import {
  avatars as A,
  commonBadges as B,
  css_color_names as CSS,
  emotes as E,
  items as I,
  messages as M,
  twitch_messages as TM,
  youtube_messages as YM,
  normal_messages as NM,
  names as N,
  tiers as T,
  tts as TTS,
  youtube_emotes as Y,
} from './collection/index.js';

export namespace Data {
  export const avatars = A;
  export const badges = B;
  export const css_color_names = CSS;
  export const emotes = E;
  export const items = I;
  export const names = N;
  export const tiers = T;
  export const tts = TTS;

  export const twitch_messages = TM;
  export const youtube_messages = YM;
  export const normal_messages = NM;
  export const messages = M;

  export const youtube_emotes = Y;
}
