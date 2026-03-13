import { MapNumberValuesToString } from '../../path.js';
import { Twitch } from '../../twitch.js';

export namespace TwitchEvents {
  export namespace Message {
    export type Data = {
      listener: 'message';
      event: Event;
    };

    export type Event = {
      service: 'twitch';
      data: {
        time: number;
        tags: Partial<MapNumberValuesToString<Twitch.IRC>> & {
          'client-nonce': string;
          'flags': string;
          'id': string;
          'first-msg': '1' | '0';
          'returning-chatter': '1' | '0';
        };
        nick: string;
        displayName: string;
        displayColor: string;
        channel: string;
        text: string;
        isAction: boolean;
        userId: string;
        msgId: string;
        badges: Array<Badge>;
        emotes: Array<Emote>;
      };
      renderedText: string;
    };

    type Badge = {
      type: string;
      version: string;
      description: string;
      url: string;
    };

    type Emote = {
      type: string;
      name: string;
      id: string;
      gif: boolean;
      urls: {
        '1': string;
        '2': string;
        '4': string;
      };
      start: number;
      end: number;
    };
  }

  export namespace DeleteMessage {
    export type Data = {
      listener: 'delete-message';
      event: Event;
    };

    export type Event = {
      msgId: string;
    };
  }

  export namespace DeleteMessages {
    export type Data = {
      listener: 'delete-messages';
      event: Event;
    };

    export type Event = {
      userId: string;
    };
  }

  export namespace Follower {
    export type Data = {
      listener: 'follower-latest';
      event: Event;
    };

    export type Event = {
      avatar: string;
      name: string;
      displayName: string;
      providerId: string;
      _id: string;
      sessionTop: boolean;
      type: 'follower';
      originalEventName: 'follower-latest';
    };
  }

  export namespace Cheer {
    export type Data = {
      listener: 'cheer-latest';
      event: Event;
    };

    export type Event = {
      amount: number;
      avatar: string;
      name: string;
      displayName: string;
      providerId: string;
      message: string;
      _id: string;
      sessionTop: boolean;
      type: 'cheer';
      originalEventName: 'cheer-latest';
    };
  }

  export namespace Raid {
    export type Data = {
      listener: 'raid-latest';
      event: Event;
    };

    export type Event = {
      amount: number;
      avatar: string;
      displayName: string;
      providerId: string;
      name: string;
      _id: string;
      sessionTop: boolean;
      type: 'raid';
      originalEventName: 'raid-latest';
    };
  }

  export namespace Subscriber {
    export type Data = {
      listener: 'subscriber-latest';
      event: Event;
    };

    export type Event = common & (normal | gift | community | spam);

    export type SubscriberTier = 'prime' | '1000' | '2000' | '3000';

    type common = {
      amount: number;
      name: string;
      displayName: string;
      tier: SubscriberTier;

      message?: string;
      providerId?: string;
      avatar?: string;
      sender?: string;

      gifted?: boolean;
      bulkGifted?: boolean;
      isCommunityGift?: boolean;

      _id?: string;
      sessionTop?: boolean;
      playedAsCommunityGift?: boolean;

      type: 'subscriber';
      originalEventName: 'subscriber-latest';
    };

    export type normal = {
      sender?: undefined;

      gifted?: false;
      bulkGifted?: false;
      isCommunityGift?: false;
    };

    export type gift = {
      sender: string;

      gifted: true;
      bulkGifted?: false;
      isCommunityGift?: false;
    };

    export type community = {
      message: string;
      sender: string;

      gifted?: false;
      bulkGifted: true;
      isCommunityGift?: false;
    };

    export type spam = {
      sender: string;

      gifted: true;
      bulkGifted?: false;
      isCommunityGift: true;
    };
  }

  export interface BaseEvent {
    provider: 'twitch';
    flagged: boolean;
    channel: string;
    createdAt: string;
    _id: string;
    expiresAt: string;
    updatedAt: string;
    activityId: string;
    sessionEventsCount: number;
    isMock?: boolean;
  }

  export namespace Event {
    export type Data = {
      listener: 'event';
      event: Event;
    };

    export type Event = ChannelPointsRedemption | Follower | Cheer | Subscriber;

    export interface ChannelPointsRedemption extends BaseEvent {
      type: 'channelPointsRedemption';
      data: {
        amount: number;
        username: string;
        displayName: string;
        providerId: string;
        redemption: string;
        message?: string;
        quantity: number;
        avatar: string;
      };
    }

    export interface Follower extends BaseEvent {
      type: 'follower';
      data: {
        username: string;
        displayName: string;
        providerId: string;
        quantity: number;
        avatar: string;
      };
    }

    export interface Cheer extends BaseEvent {
      type: 'cheer';
      data: {
        amount: number;
        username: string;
        displayName: string;
        providerId: string;
        message: string;
        quantity: number;
        avatar: string;
      };
    }

    export interface Subscriber extends BaseEvent {
      type: 'subscriber';
      data: FirstTimeSubscriber | Resubscribe | GiftedSubscriber | CommunityGiftedSubscriber;
    }

    export type FirstTimeSubscriber = {
      amount: number;
      username: string;
      displayName: string;
      providerId: string;
      tier: Subscriber.SubscriberTier;
      quantity: 0;
      avatar: string;
    };

    export type Resubscribe = {
      amount: number;
      username: string;
      displayName: string;
      providerId: string;
      message: string;
      tier: Subscriber.SubscriberTier;
      streak: number;
      quantity: number;
      avatar: string;
    };

    export type GiftedSubscriber = {
      amount: number;
      username: string;
      displayName: string;
      providerId: string;
      message: string;
      tier: Subscriber.SubscriberTier;
      sender: string;
      gifted: true;
      quantity: 0;
      avatar: string;
    };

    export type CommunityGiftedSubscriber = {
      amount: number;
      username: string;
      displayName: string;
      providerId: string;
      message: string;
      tier: Subscriber.SubscriberTier;
      sender: string;
      gifted: true;
      quantity: 0;
      avatar: string;
    };
  }
}
