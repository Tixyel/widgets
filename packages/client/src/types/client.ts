import { StreamElements } from './streamelements/main.js';

export type Provider = 'twitch' | 'youtube' | 'kick' | 'facebook' | 'streamelements';

export type ClientEvents =
  | {
      provider: 'streamelements';
      data: StreamElements.Event.Provider.StreamElements.Events;
    }
  | {
      provider: 'twitch';
      data: StreamElements.Event.Provider.Twitch.Events;
    }
  | {
      provider: 'youtube';
      data: StreamElements.Event.Provider.YouTube.Events;
    }
  | {
      provider: 'kick';
      data: StreamElements.Event.Provider.Kick.Events;
    }
  | {
      provider: 'facebook';
      data: StreamElements.Event.Provider.Facebook.Events;
    };
