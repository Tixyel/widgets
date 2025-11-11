import { StreamElements } from './streamelements/events/integrated/index.js';
import { Twitch } from './streamelements/events/twitch/index.js';
import { Youtube } from './streamelements/events/youtube/index.js';

export type Provider = 'twitch' | 'youtube' | 'kick' | 'facebook' | 'streamelements';

export type ClientEvents =
  | {
      provider: 'streamelements';
      data: StreamElements;
    }
  | {
      provider: 'twitch';
      data: Twitch;
    }
  | {
      provider: 'youtube';
      data: Youtube;
    }
  | {
      provider: 'kick';
      data: Kick;
    }
  | {
      provider: 'facebook';
      data: Facebook;
    };

type Kick = Kick$Message;

type Kick$Message = {
  listener: 'message';
  event: {};
};

type Facebook = Facebook$Message;

type Facebook$Message = {
  listener: 'message';
  event: {};
};
