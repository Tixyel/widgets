import type { ComfyJSInstance, OnChatModeHandler } from 'comfy.js';
import { EventProvider } from './EventProvider.js';
import { logger } from '../index.js';

import type {
  OnErrorHandler,
  OnCommandHandler,
  OnChatHandler,
  OnWhisperHandler,
  OnMessageDeletedHandler,
  OnJoinHandler,
  OnPartHandler,
  OnHostedHandler,
  OnRaidHandler,
  OnSubHandler,
  OnResubHandler,
  OnSubGiftHandler,
  OnSubMysteryGiftHandler,
  OnGiftSubContinueHandler,
  OnCheerHandler,
  OnRewardHandler,
  OnConnectedHandler,
  OnReconnectHandler,
} from 'comfy.js';
import { Simulation } from '../simulation/simulation.js';
import { BadgeOptions } from './Message.js';

type ComfyEvents = {
  load: [instance: ComfyJSInstance];
  error: Parameters<OnErrorHandler>;
  command: Parameters<OnCommandHandler>;
  chat: Parameters<OnChatHandler>;
  whisper: Parameters<OnWhisperHandler>;
  messageDeleted: Parameters<OnMessageDeletedHandler>;
  join: Parameters<OnJoinHandler>;
  part: Parameters<OnPartHandler>;
  hosted: Parameters<OnHostedHandler>;
  raid: Parameters<OnRaidHandler>;
  sub: Parameters<OnSubHandler>;
  resub: Parameters<OnResubHandler>;
  subGift: Parameters<OnSubGiftHandler>;
  subMysteryGift: Parameters<OnSubMysteryGiftHandler>;
  giftSubContinue: Parameters<OnGiftSubContinueHandler>;
  cheer: Parameters<OnCheerHandler>;
  chatMode: Parameters<OnChatModeHandler>;
  reward: Parameters<OnRewardHandler>;
  connected: Parameters<OnConnectedHandler>;
  reconnect: Parameters<OnReconnectHandler>;
};

/**
 * Creates and manages a ComfyJS instance for Twitch chat interaction.
 */
export class useComfyJs extends EventProvider<ComfyEvents> {
  public instance!: ComfyJSInstance;

  public username!: string;
  public password?: string;
  public channels!: string[];

  public isDebug: boolean = false;
  private init: boolean = false;

  public emulate: boolean = false;

  /**
   * Initializes a new ComfyJS instance and connects to Twitch chat.
   * @param options - Configuration options for ComfyJS instance.
   * @param emulate - Whether to emulate chat messages in the Simulation module.
   */
  constructor(options: { username: string; password?: string; channels: string[]; isDebug?: boolean; init?: boolean }, emulate: boolean) {
    super();

    this.username = options.username;
    this.password = options.password;
    this.channels = options.channels;
    this.isDebug = Boolean(options.isDebug);
    this.init = Boolean(options.init);
    this.emulate = emulate;

    this.load()
      .then((comfyJS) => {
        this.instance = comfyJS;

        this.emit('load', comfyJS);
        this.connect();
      })
      .catch((err) => {
        logger.error('useComfyJs: Failed to load ComfyJS', err);
      });
  }

  /**
   * Loads the ComfyJS script if not already loaded.
   * @returns A promise that resolves to the ComfyJS instance.
   */
  private load(): Promise<ComfyJSInstance> {
    if (typeof window.ComfyJS !== 'undefined' && !window.ComfyJS) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.src = 'https://cdn.jsdelivr.net/npm/comfy.js@latest/dist/comfy.min.js';
        script.type = 'text/javascript';
        script.async = true;

        script.onload = () => resolve(window.ComfyJS as ComfyJSInstance);
        script.onerror = (err) => reject(err);

        document.head.appendChild(script);
      });
    } else return Promise.resolve(window.ComfyJS as ComfyJSInstance);
  }

  /**
   * Connects event handlers to the ComfyJS instance.
   */
  private connect() {
    this.instance.onError = (error) => {
      this.emit('error', error);
    };
    this.instance.onCommand = (user, command, message, flags, extra) => {
      this.emit('command', user, command, message, flags, extra);

      if (this.emulate) {
        const roles = {
          ...flags,
          broadcaster: flags.broadcaster,
          moderator: flags.mod,
          vip: flags.vip,
          subscriber: flags.subscriber,
          founder: flags.founder,
        };

        Simulation.emulate.twitch.message({
          name: user,
          message: `!${command} ${message}`,
          badges: Object.entries(roles)
            .map(([role, hasRole]) => (hasRole ? role : null))
            .filter(Boolean) as BadgeOptions,
          color: extra.userColor,
          time: new Date(extra.timestamp).getTime(),
          userId: extra.userId,
          msgId: extra.id,
          channel: extra.channel,
        });
      }
    };
    this.instance.onChat = (user, message, flags, self, extra) => {
      this.emit('chat', user, message, flags, self, extra);

      if (this.emulate) {
        const roles = {
          ...flags,
          ...extra.userBadges,
          broadcaster: flags.broadcaster,
          moderator: flags.mod,
          vip: flags.vip,
          subscriber: flags.subscriber,
          founder: flags.founder,
        };

        Simulation.emulate.twitch.message({
          name: user,
          message: message,
          badges: Object.entries(roles)
            .map(([role, hasRole]) => (hasRole ? role : null))
            .filter(Boolean) as BadgeOptions,
          color: extra.userColor,
          time: new Date(extra.timestamp).getTime(),
          userId: extra.userId,
          msgId: extra.id,
          channel: extra.channel,
        });
      }
    };
    this.instance.onWhisper = (user, message, flags, self, extra) => {
      this.emit('whisper', user, message, flags, self, extra);
    };
    this.instance.onMessageDeleted = (id, extra) => {
      this.emit('messageDeleted', id, extra);

      if (this.emulate) {
        Simulation.emulate.twitch.deleteMessage(id);
      }
    };
    this.instance.onJoin = (user, self, extra) => {
      this.emit('join', user, self, extra);
    };
    this.instance.onPart = (user, self, extra) => {
      this.emit('part', user, self, extra);
    };
    this.instance.onHosted = (user, viewers, autohost, extra) => {
      this.emit('hosted', user, viewers, autohost, extra);
    };
    this.instance.onRaid = (user, viewers, extra) => {
      this.emit('raid', user, viewers, extra);

      if (this.emulate) {
        Simulation.emulate.twitch.raid({
          name: user,
          amount: viewers,
        });
      }
    };
    this.instance.onSub = (user, message, subTierInfo, extra) => {
      this.emit('sub', user, message, subTierInfo, extra);

      if (this.emulate) {
        const tier = subTierInfo.plan === 'Prime' ? 'prime' : subTierInfo.plan;

        Simulation.emulate.twitch.subscriber({
          name: user,
          message: message,
          tier: tier,
          subType: 'default',
        });
      }
    };
    this.instance.onResub = (user, message, streakMonths, cumulativeMonths, subTierInfo, extra) => {
      this.emit('resub', user, message, streakMonths, cumulativeMonths, subTierInfo, extra);

      if (this.emulate) {
        const tier = subTierInfo.plan === 'Prime' ? 'prime' : subTierInfo.plan;

        Simulation.emulate.twitch.subscriber({
          name: user,
          message: message,
          tier: tier,
          amount: cumulativeMonths,
          subType: 'default',
        });
      }
    };
    this.instance.onSubGift = (gifterUser, streakMonths, recipientUser, senderCount, subTierInfo, extra) => {
      this.emit('subGift', gifterUser, streakMonths, recipientUser, senderCount, subTierInfo, extra);

      if (this.emulate) {
        const tier = subTierInfo.plan === 'Prime' ? 'prime' : subTierInfo.plan;

        Simulation.emulate.twitch.subscriber({
          name: recipientUser,
          message: '',
          sender: gifterUser,
          tier,
          amount: senderCount,
          subType: 'gift',
        });
      }
    };
    this.instance.onSubMysteryGift = (gifterUser, numbOfSubs, senderCount, subTierInfo, extra) => {
      this.emit('subMysteryGift', gifterUser, numbOfSubs, senderCount, subTierInfo, extra);

      if (this.emulate) {
        const tier = subTierInfo.plan === 'Prime' ? 'prime' : subTierInfo.plan;

        Simulation.emulate.twitch.subscriber({
          name: gifterUser,
          message: '',
          amount: numbOfSubs,
          tier: tier,
          subType: 'community',
        });
      }
    };
    this.instance.onGiftSubContinue = (user, sender, extra) => {
      this.emit('giftSubContinue', user, sender, extra);

      if (this.emulate) {
        Simulation.emulate.twitch.subscriber({
          name: user,
          message: '',
          sender: sender,
          tier: '1000',
          subType: 'gift',
        });
      }
    };
    this.instance.onCheer = (user, message, bits, flags, extra) => {
      this.emit('cheer', user, message, bits, flags, extra);

      if (this.emulate) {
        Simulation.emulate.twitch.cheer({
          name: user,
          message: message,
          amount: bits,
        });
      }
    };
    this.instance.onChatMode = (flags, channel) => {
      this.emit('chatMode', flags, channel);
    };
    this.instance.onReward = (user, reward, cost, message, extra) => {
      this.emit('reward', user, reward, cost, message, extra);
    };
    this.instance.onConnected = (address, port, isFirstConnect) => {
      this.emit('connected', address, port, isFirstConnect);
    };
    this.instance.onReconnect = (reconnectCount) => {
      this.emit('reconnect', reconnectCount);
    };

    if (this.init) {
      this.instance.Init(this.username, this.password, this.channels, this.isDebug);
    }
  }
}
