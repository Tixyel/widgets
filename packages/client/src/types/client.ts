import { StreamElements } from './streamelements/main.js';

export type Provider = 'twitch' | 'youtube' | 'kick' | 'facebook' | 'streamelements';

export type ClientProviderEvents = {
  streamelements: StreamElements.Event.Provider.StreamElements.Events;
  twitch: StreamElements.Event.Provider.Twitch.Events;
  youtube: StreamElements.Event.Provider.YouTube.Events;
  kick: StreamElements.Event.Provider.Kick.Events;
  facebook: StreamElements.Event.Provider.Facebook.Events;
};

export type ClientCustomEventPayload<TProvider extends string = string> = {
  provider: TProvider;
};

export type ClientCustomProviderEvents = Record<string, ClientCustomEventPayload>;

type ClientCustomEventsWithoutInternalProviders<CustomEvents> = Omit<
  CustomEvents,
  keyof ClientProviderEvents
>;

type ValidateCustomProviderEvents<CustomEvents> =
  CustomEvents extends Record<string, unknown>
    ? {
        [K in keyof ClientCustomEventsWithoutInternalProviders<CustomEvents> &
          string]: ClientCustomEventsWithoutInternalProviders<CustomEvents>[K] extends ClientCustomEventPayload<K>
          ? ClientCustomEventsWithoutInternalProviders<CustomEvents>[K]
          : never;
      }
    : {};

type ClientAllProviderEvents<CustomEvents = {}> = ClientProviderEvents &
  ValidateCustomProviderEvents<CustomEvents>;

export type ClientEvents<CustomEvents = {}> = {
  [K in keyof ClientAllProviderEvents<CustomEvents> & string]: {
    provider: K;
    data: ClientAllProviderEvents<CustomEvents>[K];
  };
}[keyof ClientAllProviderEvents<CustomEvents> & string];

export type ClientEventTuple<CustomEvents = {}> = {
  [K in keyof ClientAllProviderEvents<CustomEvents> & string]: [
    provider: K,
    event: ClientAllProviderEvents<CustomEvents>[K],
  ];
}[keyof ClientAllProviderEvents<CustomEvents> & string];
