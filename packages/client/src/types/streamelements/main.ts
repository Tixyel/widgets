import { StreamElementsEvents } from './events/streamelements.js';
import { YoutubeEvents } from './events/youtube.js';
import { TwitchEvents } from './events/twitch.js';

export namespace StreamElements {
  export namespace CustomField {
    export type Types =
      | 'button'
      | 'number'
      | 'slider'
      | 'text'
      | 'hidden'
      | 'checkbox'
      | 'dropdown'
      | 'colorpicker'
      | 'googleFont'
      | 'video-input'
      | 'image-input'
      | 'sound-input';

    export type Schema = {
      type: Types;
      label: string;
      value?: string | number | boolean;
      group?: string;
      min?: number | string;
      max?: number | string;
      step?: number | string;
      options?: Record<string, string>;
      multiple?: boolean;
    };

    export type Value = string | number | boolean | undefined;
  }

  export type SE_API = {
    responses: Record<string, any>;
    sendMessage: (message: string, data: object) => void;
    counters: {
      get: (key: string) => number | null;
    };
    store: {
      get: <T>(key: string) => Promise<T | null>;
      set: <T>(key: string, value: T) => void;
    };
    resumeQueue: () => void;
    sanitize: (message: string) => string;
    cheerFilter: (message: string) => string;
    setField: (key: string, value: string | number | boolean | undefined, reload: boolean) => void;
    getOverlayStatus: () => { isEditorMode: boolean; muted: boolean };
  };

  export namespace Event {
    export type onWidgetLoad = {
      channel: {
        username: string;
        /**
         * The channel's streamelements api token (used to authenticate requests to the SE API)
         */
        apiToken: string;
        /**
         * The channel's unique identifier in the SE system
         */
        id: string;
        /**
         * The channel's unique identifier from the provider (e.g. Twitch user ID)
         */
        providerId: string;
        avatar: string;
      };
      currency: {
        code: string;
        name: string;
        symbol: string;
      };
      fieldData: Record<string, StreamElements.CustomField.Value>;
      recents: Array<Object>;
      session: {
        data: StreamElements.Session.Data;
        settings: {
          autoReset: boolean;
          calendar: boolean;
          resetOnStart: boolean;
        };
      };
      overlay: {
        /**
         * Whether the overlay is being viewed in the editor mode (in the SE dashboard) or live (on stream)
         */
        isEditorMode: boolean;
        /**
         * Whether the overlay is muted or not
         */
        muted: boolean;
      };
      emulated?: boolean;
    };

    export type onSessionUpdate = {
      session: StreamElements.Session.Data;
    };

    export namespace Provider {
      export namespace YouTube {
        export type Events = YoutubeEvents.Message.Data | YoutubeEvents.Sponsor.Data | YoutubeEvents.Subscriber.Data | YoutubeEvents.Superchat.Data;

        export type Message = YoutubeEvents.Message.Data;
        export type Superchat = YoutubeEvents.Superchat.Data;
        export type Subscriber = YoutubeEvents.Subscriber.Data;
        export type Sponsor = YoutubeEvents.Sponsor.Data;
        export type gift = YoutubeEvents.Sponsor.gift;
        export type community = YoutubeEvents.Sponsor.community;
        export type spam = YoutubeEvents.Sponsor.spam;
      }

      export namespace StreamElements {
        export type Events =
          | StreamElementsEvents.Tip.Data
          | StreamElementsEvents.Event.Data
          | StreamElementsEvents.KVStore.Data
          | StreamElementsEvents.EventSkip.Data
          | StreamElementsEvents.EventTest.Data
          | StreamElementsEvents.BotCounter.Data
          | StreamElementsEvents.AlertService.Data;

        export type Tip = StreamElementsEvents.Tip.Data;
        export type Event = StreamElementsEvents.Event.Data;
        export type KVStore = StreamElementsEvents.KVStore.Data;
        export type EventSkip = StreamElementsEvents.EventSkip.Data;
        export type EventTest = StreamElementsEvents.EventTest.Data;
        export type BotCounter = StreamElementsEvents.BotCounter.Data;
        export type AlertService = StreamElementsEvents.AlertService.Data;
      }

      export namespace Twitch {
        export type Events =
          | TwitchEvents.Raid.Data
          | TwitchEvents.Event.Data
          | TwitchEvents.Cheer.Data
          | TwitchEvents.Message.Data
          | TwitchEvents.Follower.Data
          | TwitchEvents.Subscriber.Data
          | TwitchEvents.DeleteMessage.Data
          | TwitchEvents.DeleteMessages.Data;

        export type Raid = TwitchEvents.Raid.Data;
        export type Event = TwitchEvents.Event.Data;
        export type Cheer = TwitchEvents.Cheer.Data;
        export type spam = TwitchEvents.Subscriber.spam;
        export type gift = TwitchEvents.Subscriber.gift;
        export type Message = TwitchEvents.Message.Data;
        export type Follower = TwitchEvents.Follower.Data;
        export type Subscriber = TwitchEvents.Subscriber.Data;
        export type community = TwitchEvents.Subscriber.community;
        export type DeleteMessage = TwitchEvents.DeleteMessage.Data;
        export type DeleteMessages = TwitchEvents.DeleteMessages.Data;
      }

      export namespace Kick {
        export type Events = { listener: 'message'; event: {} };
      }

      export namespace Facebook {
        export type Events = { listener: 'message'; event: {} };
      }
    }

    export type onEventReceived = Provider.Twitch.Events | Provider.YouTube.Events | Provider.StreamElements.Events;
  }

  export namespace Session {
    export type Data = Tip &
      Host &
      Raid &
      Cheer &
      Merch &
      Purchase &
      Follower &
      Hypetrain &
      Superchat &
      Subscriber &
      CheerPurchase &
      ChannelPoints &
      CharityCampaignDonation;

    export namespace Config {
      export type Int = {
        type: 'int';
        min: number;
        max: number;
      };

      export type String = {
        type: 'string';
        options: string[];
      };

      export type Array = {
        type: 'array';
        options: any[];
      };

      export type Date = {
        type: 'date';
        range: number;
      };

      export type Recent = {
        type: 'recent';
        amount: number;
        value: Record<string, Any>;
      };

      export type Any = Int | String | Date | Array | Recent | undefined;

      export namespace Available {
        export type Category = Record<string, Config.Any | Record<string, Config.Any | undefined> | undefined>;
        export type Data = Record<string, Category | undefined>;
      }
    }

    export type Follower = {
      'follower-latest': {
        name: string;
      };
      'follower-session': {
        count: number;
      };
      'follower-week': {
        count: number;
      };
      'follower-month': {
        count: number;
      };
      'follower-goal': {
        amount: number;
      };
      'follower-total': {
        count: number;
      };
      'follower-recent': { name: string; createdAt: string }[];
    };

    export type SubscriptionTier = 'prime' | '1000' | '2000' | '3000';

    export interface Subscriber {
      'subscriber-latest': {
        name: string;
        amount: number;
        tier: SubscriptionTier;
        message: string;
      };
      'subscriber-new-latest': {
        name: string;
        amount: number;
        message: string;
      };
      'subscriber-resub-latest': {
        name: string;
        amount: number;
        message: string;
      };
      'subscriber-gifted-latest': {
        name: string;
        amount: number;
        message: string;
        tier: SubscriptionTier;
        sender: string;
      };
      'subscriber-session': {
        count: number;
      };
      'subscriber-new-session': {
        count: number;
      };
      'subscriber-resub-session': {
        count: number;
      };
      'subscriber-gifted-session': {
        count: number;
      };
      'subscriber-week': {
        count: number;
      };
      'subscriber-month': {
        count: number;
      };
      'subscriber-goal': {
        amount: number;
      };
      'subscriber-total': {
        count: number;
      };
      'subscriber-points': {
        amount: number;
      };
      'subscriber-alltime-gifter': {
        name: string;
        amount: number;
      };
      'subscriber-recent': {
        name: string;
        amount: number;
        tier: SubscriptionTier;
        createdAt: string;
      }[];
    }

    export interface Host {
      'host-latest': {
        name: string;
        amount: number;
      };
      'host-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface Raid {
      'raid-latest': {
        name: string;
        amount: number;
      };
      'raid-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface CharityCampaignDonation {
      'charityCampaignDonation-latest': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-session-top-donation': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-weekly-top-donation': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-monthly-top-donation': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-alltime-top-donation': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-session-top-donator': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-weekly-top-donator': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-monthly-top-donator': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-alltime-top-donator': {
        name: string;
        amount: number;
      };
      'charityCampaignDonation-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface Cheer {
      'cheer-latest': {
        name: string;
        amount: number;
        message: string;
      };
      'cheer-session-top-donation': {
        name: string;
        amount: number;
      };
      'cheer-weekly-top-donation': {
        name: string;
        amount: number;
      };
      'cheer-monthly-top-donation': {
        name: string;
        amount: number;
      };
      'cheer-alltime-top-donation': {
        name: string;
        amount: number;
      };
      'cheer-session-top-donator': {
        name: string;
        amount: number;
      };
      'cheer-weekly-top-donator': {
        name: string;
        amount: number;
      };
      'cheer-monthly-top-donator': {
        name: string;
        amount: number;
      };
      'cheer-alltime-top-donator': {
        name: string;
        amount: number;
      };
      'cheer-session': {
        amount: number;
      };
      'cheer-week': {
        amount: number;
      };
      'cheer-month': {
        amount: number;
      };
      'cheer-total': {
        amount: number;
      };
      'cheer-count': {
        count: number;
      };
      'cheer-goal': {
        amount: number;
      };
      'cheer-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface CheerPurchase {
      'cheerPurchase-latest': {
        name: string;
        amount: number;
      };
      'cheerPurchase-session-top-donation': {
        name: string;
        amount: number;
      };
      'cheerPurchase-weekly-top-donation': {
        name: string;
        amount: number;
      };
      'cheerPurchase-monthly-top-donation': {
        name: string;
        amount: number;
      };
      'cheerPurchase-alltime-top-donation': {
        name: string;
        amount: number;
      };
      'cheerPurchase-session-top-donator': {
        name: string;
        amount: number;
      };
      'cheerPurchase-weekly-top-donator': {
        name: string;
        amount: number;
      };
      'cheerPurchase-monthly-top-donator': {
        name: string;
        amount: number;
      };
      'cheerPurchase-alltime-top-donator': {
        name: string;
        amount: number;
      };
      'cheerPurchase-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface Superchat {
      'superchat-latest': {
        name: string;
        amount: number;
      };
      'superchat-session-top-donation': {
        name: string;
        amount: number;
      };
      'superchat-weekly-top-donation': {
        name: string;
        amount: number;
      };
      'superchat-monthly-top-donation': {
        name: string;
        amount: number;
      };
      'superchat-alltime-top-donation': {
        name: string;
        amount: number;
      };
      'superchat-session-top-donator': {
        name: string;
        amount: number;
      };
      'superchat-weekly-top-donator': {
        name: string;
        amount: number;
      };
      'superchat-monthly-top-donator': {
        name: string;
        amount: number;
      };
      'superchat-alltime-top-donator': {
        name: string;
        amount: number;
      };
      'superchat-session': {
        amount: number;
      };
      'superchat-week': {
        amount: number;
      };
      'superchat-month': {
        amount: number;
      };
      'superchat-total': {
        amount: number;
      };
      'superchat-count': {
        count: number;
      };
      'superchat-goal': {
        amount: number;
      };
      'superchat-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface Hypetrain {
      'hypetrain-latest': {
        name: string;
        amount: number;
        active: number;
        level: any;
        levelChanged: any;
        type: any;
      };
      'hypetrain-level-goal': {
        amount: number;
      };
      'hypetrain-level-progress': {
        amount: number;
        percent: number;
      };
      'hypetrain-total': {
        amount: number;
      };
      'hypetrain-latest-top-contributors': {
        name: string;
      }[];
    }

    export interface ChannelPoints {
      'channel-points-latest': {
        name: string;
        amount: number;
        message: string;
        redemption: string;
      };
    }

    export interface Tip {
      'tip-latest': {
        name: string;
        amount: number;
      };
      'tip-session-top-donation': {
        name: string;
        amount: number;
      };
      'tip-weekly-top-donation': {
        name: string;
        amount: number;
      };
      'tip-monthly-top-donation': {
        name: string;
        amount: number;
      };
      'tip-alltime-top-donation': {
        name: string;
        amount: number;
      };
      'tip-session-top-donator': {
        name: string;
        amount: number;
      };
      'tip-weekly-top-donator': {
        name: string;
        amount: number;
      };
      'tip-monthly-top-donator': {
        name: string;
        amount: number;
      };
      'tip-alltime-top-donator': {
        name: string;
        amount: number;
      };
      'tip-session': {
        amount: number;
      };
      'tip-week': {
        amount: number;
      };
      'tip-month': {
        amount: number;
      };
      'tip-total': {
        amount: number;
      };
      'tip-count': {
        count: number;
      };
      'tip-goal': {
        amount: number;
      };
      'tip-recent': {
        name: string;
        amount: number;
        createdAt: string;
      }[];
    }

    export interface Merch {
      'merch-latest': {
        name: string;
        amount: number;
        items: any[];
      };
      'merch-goal-orders': {
        amount: number;
      };
      'merch-goal-items': {
        amount: number;
      };
      'merch-goal-total': {
        amount: number;
      };
      'merch-recent': {
        name: string;
      }[];
    }

    export interface Purchase {
      'purchase-latest': {
        name: string;
        amount: number;
        items: any[];
        avatar: string;
        message: string;
      };
    }
  }
}
