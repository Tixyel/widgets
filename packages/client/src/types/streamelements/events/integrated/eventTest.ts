export type StreamElements$EventTest = {
  listener: 'event:test';
  event: EventTest;
};

type EventTest = widgetButton | emulatedEvents<EventType> | Session;

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

type Session = SessionCount | SessionTotal | SessionTop | SessionGoal | SessionRecent | SessionPoints;

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
