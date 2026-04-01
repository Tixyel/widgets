import { BadgeOptions } from '../helper/classes/message.js';
import { logger } from '../main.js';
import { StreamElements } from '../types.js';
import { generate } from './generator.js';
import { localQueue as queue } from './queue.js';

export class Emulator {
  twitch = {
    message(
      data: Partial<{
        name: string;
        message: string;
        badges: BadgeOptions;
        color: string;
        userId: string;
        msgId: string;
        channel: string;
        time: number;
        firstMsg: boolean;
        returningChatter: boolean;
        reply: {
          msgId: string;
          userId: string;
          login: string;
          name: string;
          text: string;
        };
        thread: {
          msgId: string;
          name: string;
        };
      }> = {},
    ) {
      generate.event
        .onEventReceived('twitch', 'message', data as { [key: string]: any })
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    deleteMessage(msgId: string) {
      if (!msgId || typeof msgId !== 'string') return;

      const event: StreamElements.Event.Provider.Twitch.DeleteMessage = {
        listener: 'delete-message',
        event: {
          msgId: msgId,
        },
      };

      emulate.send('onEventReceived', event);
    },
    deleteMessages(userId: string) {
      if (!userId || typeof userId !== 'string') return;

      const event: StreamElements.Event.Provider.Twitch.DeleteMessages = {
        listener: 'delete-messages',
        event: {
          userId: userId,
        },
      };

      emulate.send('onEventReceived', event);
    },
    follower(
      data: Partial<{
        avatar: string;
        name: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived(
          'twitch',
          'follower-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    raid(
      data: Partial<{
        amount: number;
        avatar: string;
        name: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived(
          'twitch',
          'raid-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    cheer(
      data: Partial<{
        amount: number;
        avatar: string;
        name: string;
        message: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived(
          'twitch',
          'cheer-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    subscriber(
      data: Partial<{
        tier: '1000' | '2000' | '3000' | 'prime';
        amount: number;
        avatar: string;
        name: string;
        sender: string;
        message: string;
        subType: 'default' | 'gift' | 'community' | 'spam';
      }> & { subType?: 'default' | 'gift' | 'community' | 'spam' } = {},
    ) {
      generate.event
        .onEventReceived(
          'twitch',
          'subscriber-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
  };
  streamelements = {
    tip(
      data: Partial<{
        amount: number;
        avatar: string;
        name: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived(
          'streamelements',
          'tip-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
  };
  youtube = {
    message(
      data: Partial<{
        name: string;
        message: string;
        badges: BadgeOptions;
        color: string;
        userId: string;
        msgId: string;
        channel: string;
        time: number;
        avatar: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived('youtube', 'message', data as { [key: string]: string | number | boolean })
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    subscriber(
      data: Partial<{
        avatar: string;
        name: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived(
          'youtube',
          'subscriber-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    superchat(
      data: Partial<{
        amount: number;
        avatar: string;
        name: string;
      }> = {},
    ) {
      generate.event
        .onEventReceived(
          'youtube',
          'superchat-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
    sponsor(
      data: Partial<{
        tier: '1000' | '2000' | '3000';
        amount: number;
        avatar: string;
        name: string;
        sender: string;
        message: string;
        subType: 'default' | 'gift' | 'community' | 'spam';
      }> & { subType?: 'default' | 'gift' | 'community' | 'spam' } = {},
    ) {
      generate.event
        .onEventReceived(
          'youtube',
          'sponsor-latest',
          data as { [key: string]: string | number | boolean },
        )
        .then((event) => {
          if (event) {
            emulate.send('onEventReceived', event);
          }
        });
    },
  };

  kick = {};
  facebook = {};

  send<T extends 'onEventReceived' | 'onSessionUpdate' | 'onWidgetLoad'>(
    listener: T,
    event: T extends 'onEventReceived'
      ? StreamElements.Event.onEventReceived
      : T extends 'onSessionUpdate'
        ? StreamElements.Event.onSessionUpdate
        : StreamElements.Event.onWidgetLoad,
  ): void {
    if (!queue) {
      logger.warn('Local  queue is not initialized.');

      window.dispatchEvent(new CustomEvent(listener, { detail: event }));

      return;
    }

    switch (listener) {
      case 'onEventReceived': {
        queue.enqueue({
          listener,
          data: event as StreamElements.Event.onEventReceived,
          session: listener === 'onEventReceived' ? true : undefined,
        });

        break;
      }
      case 'onSessionUpdate': {
        queue.enqueue({
          listener,
          data: event as StreamElements.Event.onSessionUpdate,
        });

        break;
      }
      case 'onWidgetLoad': {
        queue.enqueue({
          listener,
          data: event as StreamElements.Event.onWidgetLoad,
        });

        break;
      }
    }
  }
}

export const emulate = new Emulator();
