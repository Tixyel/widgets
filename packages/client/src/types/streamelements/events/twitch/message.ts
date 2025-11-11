import { MapNumberValuesToString } from '../../../../utils/index.js';
import { Twitch$IRC } from './IRC.js';

export type Twitch$Message = {
  listener: 'message';
  event: Message;
};

type Message = {
  service: 'twitch';
  data: {
    time: number;
    tags: Partial<MapNumberValuesToString<Twitch$IRC>> & {
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
    badges: Array<Message$Badge>;
    emotes: Array<Message$Emote>;
  };
  renderedText: string;
};

type Message$Badge = {
  type: string;
  version: string;
  description: string;
  url: string;
};

type Message$Emote = {
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
