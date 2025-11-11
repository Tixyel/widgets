export type TwitchEmote = {
  type: 'twitch';
  name: string;
  id: string;
  gif: boolean;
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
  cords: { x: number; y: number };
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
  coords: { x: number; y: number; width: number; height: number };
};
