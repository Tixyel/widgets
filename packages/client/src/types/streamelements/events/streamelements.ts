import { Provider } from '../../client.js';

export namespace StreamElementsEvents {
  export namespace Tip {
    export type Data = {
      listener: 'tip-latest';
      event: Event;
    };

    export type Event = {
      amount: number;
      avatar: string;
      name: string;
      displayName: string;
      providerId: string;
      _id: string;
      sessionTop: boolean;
      type: 'tip';
      originalEventName: 'tip-latest';
    };
  }

  export namespace KVStore {
    export type Data = {
      listener: 'kvstore:update';
      event: Event;
    };

    export type Event = {
      data: {
        key: `customWidget.${string}`;
        value: string | number | boolean | Record<string, any>;
      };
    };
  }

  export namespace BotCounter {
    export type Data = {
      listener: 'bot:counter';
      event: Event;
    };

    export type Event = {
      counter: string;
      value: number;
    };
  }

  export namespace AlertService {
    export type Data = {
      listener: 'alertService:toggleSound';
      event: Event;
    };

    export type Event = {
      muted: boolean;
    };
  }

  export namespace EventSkip {
    export type Data = {
      listener: 'event:skip';
      event: Event;
    };

    export type Event = {};
  }

  export namespace EventTest {
    export type Data = {
      listener: 'event:test';
      event: Event;
    };

    export type Event = widgetButton | emulatedEvents<EventType> | Session;

    type items = { name: string; price: number; quantity: number };

    type widgetButton = {
      listener: 'widget-button';
      field: string;
      value: string | number | boolean;
    };

    type EventType = 'follower' | 'subscriber' | 'tip' | 'cheer' | 'raid';

    type EventTier = 'prime' | '1000' | '2000' | '3000';

    type emulatedEvents<T extends EventType> = {
      listener: `${T}-latest`;
      event: {
        type: T;
        name: string;
        amount: number;
        count: number;
        message?: string;
        gifted?: boolean;
        bulkGifted?: boolean;
        sender?: string;
        subExtension?: boolean;
        items: items[];
        tier: EventTier;
        month: string;
        isTest: true;
      };
    };

    type Session =
      | SessionCount
      | SessionTotal
      | SessionTop
      | SessionGoal
      | SessionRecent
      | SessionPoints;

    type SessionCount = {
      listener: `${EventType}-count`;
      event: {
        type: EventType;
        name: string;
        count: number;
        items: items[];
        tier: EventTier;
        month: string;
        isTest: true;
      };
    };

    type SessionTotal = {
      listener: `${EventType}-total`;
      event: {
        type: EventType;
        name: string;
        amount: number;
        count: number;
        items: items[];
        tier: EventTier;
        month: string;
        isTest: true;
      };
    };

    type SessionTop = {
      listener: `${EventType}-top`;
      event: {
        type: EventType;
        name: string;
        amount: number;
        count: number;
        items: items[];
        tier: EventTier;
        month: string;
        isTest: true;
      };
    };

    type SessionGoal = {
      listener: `${EventType}-goal`;
      event: {
        type: EventType;
        name: string;
        amount: number;
        count: number;
        items: items[];
        tier: EventTier;
        month: string;
        isTest: true;
      };
    };

    type SessionRecent = {
      listener: `${EventType}-recent`;
      event: {
        event: SessionRecentEvent[];
      };
    };

    type SessionRecentEvent = {
      type: EventType;
      name: string;
      amount: number;
      count: number;
      tier: EventTier;
      isTest: true;
    };

    type SessionPoints = {
      listener: `${EventType}-points`;
      event: {
        type: EventType;
        name: string;
        amount: number;
        count: number;
        items: items[];
        tier: EventTier;
        month: string;
        isTest: true;
      };
    };
  }

  export interface BaseEvent {
    provider: Provider;
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

    export type Event = Tip;

    export interface Tip extends BaseEvent {
      type: 'tip';
      data: {
        amount: string;
        currency: string;
        username: string;
        message: string;
        avatar: string;
      };
    }
  }
}
