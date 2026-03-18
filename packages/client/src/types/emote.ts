export type TwitchEmote = {
  type: 'twitch';
  name: string;
  id: string;
  gif: boolean;
  urls: { '1': string; '2': string; '4': string };
  start: number;
  end: number;
};

export type FfzEmote = {
  type: 'ffz';
  id: string;
  name: string;
  gif: boolean;
  animated: boolean;
  urls: { '1': string; '2': string; '4': string };
  start: number;
  end: number;
};

export type SeventvEmote = {
  type: '7tv';
  name: string;
  id: string;
  gif: boolean;
  animated: boolean;
  urls: { '1': string; '2': string; '3': string; '4': string };
  start: number;
  end: number;
};

export type BttvEmote = {
  type: 'bttv';
  name: string;
  id: string;
  gif: boolean;
  animated: boolean;
  urls: { '1': string; '2': string; '4': string };
  start: number;
  end: number;
};

export type Emoji = {
  type: 'emoji';
  name: string;
  id: string;
  gif: boolean;
  urls: { '1': string };
};

export type Emote = TwitchEmote | BttvEmote | SeventvEmote | FfzEmote | Emoji;
