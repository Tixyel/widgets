import { Tixyel } from '../index.js';
import { Alejo$Pronouns } from '../types/alejo/pronouns.js';
import type { TwitchBadge, TwitchBadgesKeys } from '../types/badge.js';
import type { Provider } from '../types/client.js';
import type { BttvEmote, SeventvEmote, TwitchEmote } from '../types/emote.js';
import type {
  FieldSettings,
  NormalizedFieldSettings,
  StreamElementsField,
  StreamElementsFieldTypes,
  StreamElementsFieldValue,
} from '../types/streamelements/customfields.js';
import type { StreamElements$AlertService } from '../types/streamelements/events/integrated/alertService.js';
import type { StreamElements$BotCounter } from '../types/streamelements/events/integrated/botCounter.js';
import type { StreamElements$EventSkip } from '../types/streamelements/events/integrated/eventSkip.js';
import type { StreamElements } from '../types/streamelements/events/integrated/index.js';
import type { StreamElements$KVStore } from '../types/streamelements/events/integrated/kvstore.js';
import type { StreamElements$Tip } from '../types/streamelements/events/integrated/tip.js';
import type { onEventReceived } from '../types/streamelements/events/onEventReceived.js';
import type { onSessionUpdate } from '../types/streamelements/events/onSessionUpdate.js';
import type { onWidgetLoad } from '../types/streamelements/events/onWidgetLoad.js';
import type { Twitch$Cheer } from '../types/streamelements/events/twitch/cheer.js';
import type { Twitch$Follower } from '../types/streamelements/events/twitch/follower.js';
import type { Twitch } from '../types/streamelements/events/twitch/index.js';
import type { Twitch$DeleteMessage, Twitch$DeleteMessages } from '../types/streamelements/events/twitch/message.delete.js';
import type { Twitch$Message } from '../types/streamelements/events/twitch/message.js';
import type { Twitch$Raid } from '../types/streamelements/events/twitch/raid.js';
import type { Subscriber$community, Subscriber$gift, Subscriber$spam, Twitch$Subscriber } from '../types/streamelements/events/twitch/subscriber.js';
import type { Youtube } from '../types/streamelements/events/youtube/index.js';
import type { Youtube$Message } from '../types/streamelements/events/youtube/message.js';
import type { Sponsor$community, Sponsor$gift, Sponsor$spam, Youtube$Sponsor } from '../types/streamelements/events/youtube/sponsor.js';
import type { YouTube$Subscriber } from '../types/streamelements/events/youtube/subscriber.js';
import type { YouTube$Superchat } from '../types/streamelements/events/youtube/superchat.js';
import type { Session$AnyConfig, Session$AvailableCategory, Session$AvailableData } from '../types/streamelements/session.generate.js';
import type { Session } from '../types/streamelements/session.js';
import { BadgeOptions, findEmotesInText, generateBadges, replaceEmotesWithHTML } from '../utils/Message.js';

type Modifier = (value: string, param: string | null | undefined, values: { amount?: number; count?: number }) => string;

export class Simulation {
  static data = {
    names: ['local', 'tixyel', 'urie_s2', 'itzzcatt', 'beniarts', 'cupidiko', 'shy_madeit'] as string[],
    messages: ['Hello!', 'How are you?', 'Goodbye!', 'Have fun!'] as string[],
    tiers: ['1000', '2000', '3000', 'prime'] as string[],
    avatars: [
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/13e5fa74-defa-11e9-809c-784f43822e80-profile_image-300x300.png',
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/dbdc9198-def8-11e9-8681-784f43822e80-profile_image-300x300.png',
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/998f01ae-def8-11e9-b95c-784f43822e80-profile_image-300x300.png',
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/de130ab0-def7-11e9-b668-784f43822e80-profile_image-300x300.png',
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/ebe4cd89-b4f4-4cd9-adac-2f30151b4209-profile_image-300x300.png',
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/215b7342-def9-11e9-9a66-784f43822e80-profile_image-300x300.png',
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/ead5c8b2-a4c9-4724-b1dd-9f00b46cbd3d-profile_image-300x300.png',
    ] as string[],
    items: [] as any[],
    emotes: [
      {
        'type': 'twitch',
        'name': 'DinoDance',
        'id': 'emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7',
        'gif': true,
        'animated': true,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7/animated/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7/animated/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7/animated/dark/3.0',
        },
        'start': 46,
        'end': 55,
      },
      {
        'type': 'twitch',
        'name': 'PopNemo',
        'id': 'emotesv2_5d523adb8bbb4786821cd7091e47da21',
        'gif': true,
        'animated': true,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_5d523adb8bbb4786821cd7091e47da21/animated/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_5d523adb8bbb4786821cd7091e47da21/animated/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_5d523adb8bbb4786821cd7091e47da21/animated/dark/3.0',
        },
        'start': 56,
        'end': 63,
      },
      {
        'type': 'twitch',
        'name': 'TransgenderPride',
        'id': '307827377',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827377/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827377/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827377/default/dark/3.0',
        },
        'start': 0,
        'end': 15,
      },
      {
        'type': 'twitch',
        'name': 'PansexualPride',
        'id': '307827370',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827370/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827370/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827370/default/dark/3.0',
        },
        'start': 17,
        'end': 30,
      },
      {
        'type': 'twitch',
        'name': 'NonbinaryPride',
        'id': '307827356',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827356/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827356/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827356/default/dark/3.0',
        },
        'start': 32,
        'end': 45,
      },
      {
        'type': 'twitch',
        'name': 'LesbianPride',
        'id': '307827340',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827340/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827340/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827340/default/dark/3.0',
        },
        'start': 47,
        'end': 58,
      },
      {
        'type': 'twitch',
        'name': 'IntersexPride',
        'id': '307827332',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827332/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827332/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827332/default/dark/3.0',
        },
        'start': 60,
        'end': 72,
      },
      {
        'type': 'twitch',
        'name': 'GenderFluidPride',
        'id': '307827326',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827326/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827326/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827326/default/dark/3.0',
        },
        'start': 74,
        'end': 89,
      },
      {
        'type': 'twitch',
        'name': 'GayPride',
        'id': '307827321',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827321/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827321/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827321/default/dark/3.0',
        },
        'start': 91,
        'end': 98,
      },
      {
        'type': 'twitch',
        'name': 'BisexualPride',
        'id': '307827313',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827313/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827313/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827313/default/dark/3.0',
        },
        'start': 100,
        'end': 112,
      },
      {
        'type': 'twitch',
        'name': 'AsexualPride',
        'id': '307827267',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/307827267/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/307827267/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/307827267/default/dark/3.0',
        },
        'start': 114,
        'end': 125,
      },
      {
        'type': 'twitch',
        'name': 'PogChamp',
        'id': '305954156',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/3.0',
        },
        'start': 127,
        'end': 134,
      },
      {
        'type': 'twitch',
        'name': 'GlitchCat',
        'id': '304486301',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/304486301/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/304486301/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/304486301/default/dark/3.0',
        },
        'start': 136,
        'end': 144,
      },
      {
        'type': 'twitch',
        'name': 'DarkMode',
        'id': '461298',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/461298/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/461298/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/461298/default/dark/3.0',
        },
        'start': 146,
        'end': 153,
      },
      {
        'type': 'twitch',
        'name': 'LUL',
        'id': '425618',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/3.0',
        },
        'start': 155,
        'end': 157,
      },
      {
        'type': 'twitch',
        'name': 'TheIlluminati',
        'id': '145315',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/145315/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/145315/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/145315/default/dark/3.0',
        },
        'start': 159,
        'end': 171,
      },
      {
        'type': 'twitch',
        'name': 'imGlitch',
        'id': '112290',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/112290/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/112290/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/112290/default/dark/3.0',
        },
        'start': 173,
        'end': 180,
      },
      {
        'type': 'twitch',
        'name': 'DoritosChip',
        'id': '102242',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/102242/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/102242/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/102242/default/dark/3.0',
        },
        'start': 182,
        'end': 192,
      },
      {
        'type': 'twitch',
        'name': 'SSSsss',
        'id': '46',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/46/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/46/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/46/default/dark/3.0',
        },
        'start': 194,
        'end': 199,
      },
      {
        'type': 'twitch',
        'name': 'PunchTrees',
        'id': '47',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/47/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/47/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/47/default/dark/3.0',
        },
        'start': 201,
        'end': 210,
      },
      {
        'type': 'twitch',
        'name': 'BloodTrail',
        'id': '69',
        'gif': false,
        'urls': {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/69/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/69/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/69/default/dark/3.0',
        },
        'start': 223,
        'end': 232,
      },
      {
        'type': '7tv',
        'name': 'CookieTime',
        'id': '635b0184ea9ce7391cbf77d6',
        'gif': true,
        'animated': true,
        'urls': {
          '1': 'https://cdn.7tv.app/emote/635b0184ea9ce7391cbf77d6/1x.webp',
          '2': 'https://cdn.7tv.app/emote/635b0184ea9ce7391cbf77d6/2x.webp',
          '3': 'https://cdn.7tv.app/emote/635b0184ea9ce7391cbf77d6/3x.webp',
          '4': 'https://cdn.7tv.app/emote/635b0184ea9ce7391cbf77d6/4x.webp',
        },
        'start': 0,
        'end': 10,
        'coords': {
          'x': 0,
          'y': 0,
        },
      },
      {
        'type': 'bttv',
        'name': 'catJAM',
        'id': '5f1b0186cf6d2144653d2970',
        'gif': true,
        'animated': true,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/1x',
          '2': 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/2x',
          '4': 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/3x',
        },
        'start': 0,
        'end': 6,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': ':tf:',
        'id': '54fa8f1401e468494b85b537',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/54fa8f1401e468494b85b537/1x',
          '2': 'https://cdn.betterttv.net/emote/54fa8f1401e468494b85b537/2x',
          '4': 'https://cdn.betterttv.net/emote/54fa8f1401e468494b85b537/3x',
        },
        'start': 7,
        'end': 11,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'AngelThump',
        'id': '566ca1a365dbbdab32ec055b',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/566ca1a365dbbdab32ec055b/1x',
          '2': 'https://cdn.betterttv.net/emote/566ca1a365dbbdab32ec055b/2x',
          '4': 'https://cdn.betterttv.net/emote/566ca1a365dbbdab32ec055b/3x',
        },
        'start': 12,
        'end': 22,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 334,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'ariW',
        'id': '56fa09f18eff3b595e93ac26',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/56fa09f18eff3b595e93ac26/1x',
          '2': 'https://cdn.betterttv.net/emote/56fa09f18eff3b595e93ac26/2x',
          '4': 'https://cdn.betterttv.net/emote/56fa09f18eff3b595e93ac26/3x',
        },
        'start': 23,
        'end': 27,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'BroBalt',
        'id': '54fbf00a01abde735115de5c',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/54fbf00a01abde735115de5c/1x',
          '2': 'https://cdn.betterttv.net/emote/54fbf00a01abde735115de5c/2x',
          '4': 'https://cdn.betterttv.net/emote/54fbf00a01abde735115de5c/3x',
        },
        'start': 28,
        'end': 35,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 184,
          'height': 120,
        },
      },
      {
        'type': 'bttv',
        'name': 'bttvNice',
        'id': '54fab7d2633595ca4c713abf',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/54fab7d2633595ca4c713abf/1x',
          '2': 'https://cdn.betterttv.net/emote/54fab7d2633595ca4c713abf/2x',
          '4': 'https://cdn.betterttv.net/emote/54fab7d2633595ca4c713abf/3x',
        },
        'start': 36,
        'end': 44,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 168,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'bUrself',
        'id': '566c9f3b65dbbdab32ec052e',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/566c9f3b65dbbdab32ec052e/1x',
          '2': 'https://cdn.betterttv.net/emote/566c9f3b65dbbdab32ec052e/2x',
          '4': 'https://cdn.betterttv.net/emote/566c9f3b65dbbdab32ec052e/3x',
        },
        'start': 45,
        'end': 52,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'c!',
        'id': '6468f7acaee1f7f47567708e',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/6468f7acaee1f7f47567708e/1x',
          '2': 'https://cdn.betterttv.net/emote/6468f7acaee1f7f47567708e/2x',
          '4': 'https://cdn.betterttv.net/emote/6468f7acaee1f7f47567708e/3x',
        },
        'start': 53,
        'end': 55,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'CandianRage',
        'id': '54fbf09c01abde735115de61',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/54fbf09c01abde735115de61/1x',
          '2': 'https://cdn.betterttv.net/emote/54fbf09c01abde735115de61/2x',
          '4': 'https://cdn.betterttv.net/emote/54fbf09c01abde735115de61/3x',
        },
        'start': 56,
        'end': 67,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'CiGrip',
        'id': '54fa8fce01e468494b85b53c',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/54fa8fce01e468494b85b53c/1x',
          '2': 'https://cdn.betterttv.net/emote/54fa8fce01e468494b85b53c/2x',
          '4': 'https://cdn.betterttv.net/emote/54fa8fce01e468494b85b53c/3x',
        },
        'start': 68,
        'end': 74,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'ConcernDoge',
        'id': '566c9f6365dbbdab32ec0532',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/566c9f6365dbbdab32ec0532/1x',
          '2': 'https://cdn.betterttv.net/emote/566c9f6365dbbdab32ec0532/2x',
          '4': 'https://cdn.betterttv.net/emote/566c9f6365dbbdab32ec0532/3x',
        },
        'start': 75,
        'end': 86,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 101,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'CruW',
        'id': '55471c2789d53f2d12781713',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/55471c2789d53f2d12781713/1x',
          '2': 'https://cdn.betterttv.net/emote/55471c2789d53f2d12781713/2x',
          '4': 'https://cdn.betterttv.net/emote/55471c2789d53f2d12781713/3x',
        },
        'start': 87,
        'end': 91,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'cvHazmat',
        'id': '5e76d338d6581c3724c0f0b2',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/5e76d338d6581c3724c0f0b2/1x',
          '2': 'https://cdn.betterttv.net/emote/5e76d338d6581c3724c0f0b2/2x',
          '4': 'https://cdn.betterttv.net/emote/5e76d338d6581c3724c0f0b2/3x',
        },
        'start': 92,
        'end': 100,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'D:',
        'id': '55028cd2135896936880fdd7',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/1x',
          '2': 'https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/2x',
          '4': 'https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/3x',
        },
        'start': 101,
        'end': 103,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'haHAA',
        'id': '555981336ba1901877765555',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/555981336ba1901877765555/1x',
          '2': 'https://cdn.betterttv.net/emote/555981336ba1901877765555/2x',
          '4': 'https://cdn.betterttv.net/emote/555981336ba1901877765555/3x',
        },
        'start': 104,
        'end': 109,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'LuL',
        'id': '567b00c61ddbe1786688a633',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/567b00c61ddbe1786688a633/1x',
          '2': 'https://cdn.betterttv.net/emote/567b00c61ddbe1786688a633/2x',
          '4': 'https://cdn.betterttv.net/emote/567b00c61ddbe1786688a633/3x',
        },
        'start': 110,
        'end': 113,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 112,
          'height': 112,
        },
      },
      {
        'type': 'bttv',
        'name': 'DuckerZ',
        'id': '573d38b50ffbf6cc5cc38dc9',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.betterttv.net/emote/573d38b50ffbf6cc5cc38dc9/1x',
          '2': 'https://cdn.betterttv.net/emote/573d38b50ffbf6cc5cc38dc9/2x',
          '4': 'https://cdn.betterttv.net/emote/573d38b50ffbf6cc5cc38dc9/3x',
        },
        'start': 114,
        'end': 121,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 149,
          'height': 112,
        },
      },
      {
        'type': 'ffz',
        'name': 'CatBag',
        'id': '25927',
        'gif': false,
        'animated': false,
        'urls': {
          '1': 'https://cdn.frankerfacez.com/emote/25927/1',
          '2': 'https://cdn.frankerfacez.com/emote/25927/2',
          '4': 'https://cdn.frankerfacez.com/emote/25927/4',
        },
        'start': 122,
        'end': 128,
        'coords': {
          'x': 0,
          'y': 0,
          'width': 143,
          'height': 128,
        },
      },
    ] as Array<TwitchEmote | BttvEmote | SeventvEmote>,
    badges: {
      '100 bits': {
        type: '100 bits',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/09d93036-e7ce-431c-9a9e-7044297133f2/3',
        description: '100 bits badge',
      },
      'no audio': {
        type: 'no audio',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/aef2cd08-f29b-45a1-8c12-d44d7fd5e6f0/3',
        description: 'Individuals with unreliable or no sound can select this badge',
      },
      'no video': {
        type: 'no video',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/199a0dba-58f3-494e-a7fc-1fa0a1001fb8/3',
        description: 'Individuals with unreliable or no video can select this badge',
      },
      'bot': {
        type: 'bot',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/df9095f6-a8a0-4cc2-bb33-d908c0adffb8/3',
        description: 'Twitch bot',
      },
      'twitch staff': {
        type: 'twitch staff',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8f57-4e4bef88af34/3',
        description: 'Twitch Staff',
      },
      'admins': {
        type: 'admins',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/3',
        description: 'Admins',
      },
      'artist': {
        type: 'artist',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/4300a897-03dc-4e83-8c0e-c332fee7057f/3',
        description: 'Artist',
      },
      'game developer': {
        type: 'game developer',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/85856a4a-eb7d-4e26-a43e-d204a977ade4/3',
        description: 'Game Developer',
      },
      'prime': {
        type: 'prime',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/a1dd5073-19c3-4911-8cb4-c464a7bc1510/3',
        description: 'Prime',
      },
      'turbo': {
        type: 'turbo',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/3',
        description: 'Turbo',
      },
      'subscriber': {
        type: 'subscriber',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
        description: 'Subscriber',
      },
      'broadcaster': {
        type: 'broadcaster',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3',
        description: 'Broadcaster',
      },
      'verified': {
        type: 'verified',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3',
        description: 'Verified',
      },
      'moderator': {
        type: 'moderator',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3',
        description: 'Moderator',
      },
      'vip': {
        type: 'vip',
        version: '1',
        url: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3',
        description: 'VIP',
      },
    } as Record<TwitchBadgesKeys, TwitchBadge>,
    pronouns: Alejo$Pronouns,
    tts: [
      'Filiz',
      'Astrid',
      'Tatyana',
      'Maxim',
      'Carmen',
      'Ines',
      'Cristiano',
      'Vitoria',
      'Ricardo',
      'Maja',
      'Jan',
      'Jacek',
      'Ewa',
      'Ruben',
      'Lotte',
      'Liv',
      'Seoyeon',
      'Takumi',
      'Mizuki',
      'Giorgio',
      'Carla',
      'Bianca',
      'Karl',
      'Dora',
      'Mathieu',
      'Celine',
      'Chantal',
      'Penelope',
      'Miguel',
      'Mia',
      'Enrique',
      'Conchita',
      'Geraint',
      'Salli',
      'Matthew',
      'Kimberly',
      'Kendra',
      'Justin',
      'Joey',
      'Joanna',
      'Ivy',
      'Raveena',
      'Aditi',
      'Emma',
      'Brian',
      'Amy',
      'Russell',
      'Nicole',
      'Vicki',
      'Marlene',
      'Hans',
      'Naja',
      'Mads',
      'Gwyneth',
      'Zhiyu',
      'Tracy',
      'Danny',
      'Huihui',
      'Yaoyao',
      'Kangkang',
      'HanHan',
      'Zhiwei',
      'Asaf',
      'An',
      'Stefanos',
      'Filip',
      'Ivan',
      'Heidi',
      'Herena',
      'Kalpana',
      'Hemant',
      'Matej',
      'Andika',
      'Rizwan',
      'Lado',
      'Valluvar',
      'Linda',
      'Heather',
      'Sean',
      'Michael',
      'Karsten',
      'Guillaume',
      'Pattara',
      'Jakub',
      'Szabolcs',
      'Hoda',
      'Naayf',
    ] as string[],
  };

  static color = {
    opacity(opacity: number = 100, color: string) {
      color = color.length > 7 ? color.substring(0, 6) : color;
      opacity = opacity > 1 ? opacity / 100 : opacity;

      let result = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
        .toString(16)
        .toLowerCase();

      result = result.padStart(2, '0');

      return color + result;
    },

    getOpacity(hex: string) {
      if (!hex.startsWith('#') || hex.length <= 7) return { opacity: 100, hex };

      var ohex = hex.slice(-2);
      var decimal = parseInt(ohex, 16) / 255;
      var percentage = Math.round(decimal * 100);
      var color = hex.length > 7 ? hex.slice(0, 7) : hex;

      return { opacity: percentage, color: color };
    },

    validate(str: string): 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-color-name' | false {
      if (typeof str !== 'string' || !str.length) return false;

      const s = str.trim();

      // HEX (#FFF, #FFFFFF, #FFFFFFFF)
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(s) || /^#([A-Fa-f0-9]{4}|[A-Fa-f0-9]{8})$/.test(s)) {
        return 'hex';
      }

      // rgb(255, 255, 255)
      if (/^rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)$/.test(s)) {
        return 'rgb';
      }

      // rgba(255, 255, 255, 0.5)
      if (/^rgba\(\s*(?:\d{1,3}\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)$/.test(s)) {
        return 'rgba';
      }

      // hsl(360, 100%, 100%)
      if (/^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/.test(s)) {
        return 'hsl';
      }

      // hsla(360, 100%, 100%, 0.5)
      if (/^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)$/.test(s)) {
        return 'hsla';
      }

      if (
        [
          'aliceblue',
          'antiquewhite',
          'aqua',
          'aquamarine',
          'azure',
          'beige',
          'bisque',
          'black',
          'blanchedalmond',
          'blue',
          'blueviolet',
          'brown',
          'burlywood',
          'cadetblue',
          'chartreuse',
          'chocolate',
          'coral',
          'cornflowerblue',
          'cornsilk',
          'crimson',
          'cyan',
          'darkblue',
          'darkcyan',
          'darkgoldenrod',
          'darkgray',
          'darkgreen',
          'darkgrey',
          'darkkhaki',
          'darkmagenta',
          'darkolivegreen',
          'darkorange',
          'darkorchid',
          'darkred',
          'darksalmon',
          'darkseagreen',
          'darkslateblue',
          'darkslategray',
          'darkslategrey',
          'darkturquoise',
          'darkviolet',
          'deeppink',
          'deepskyblue',
          'dimgray',
          'dimgrey',
          'dodgerblue',
          'firebrick',
          'floralwhite',
          'forestgreen',
          'fuchsia',
          'gainsboro',
          'ghostwhite',
          'gold',
          'goldenrod',
          'gray',
          'green',
          'greenyellow',
          'grey',
          'honeydew',
          'hotpink',
          'indianred',
          'indigo',
          'ivory',
          'khaki',
          'lavender',
          'lavenderblush',
          'lawngreen',
          'lemonchiffon',
          'lightblue',
          'lightcoral',
          'lightcyan',
          'lightgoldenrodyellow',
          'lightgray',
          'lightgreen',
          'lightgrey',
          'lightpink',
          'lightsalmon',
          'lightseagreen',
          'lightskyblue',
          'lightslategray',
          'lightslategrey',
          'lightsteelblue',
          'lightyellow',
          'lime',
          'limegreen',
          'linen',
          'magenta',
          'maroon',
          'mediumaquamarine',
          'mediumblue',
          'mediumorchid',
          'mediumpurple',
          'mediumseagreen',
          'mediumslateblue',
          'mediumspringgreen',
          'mediumturquoise',
          'mediumvioletred',
          'midnightblue',
          'mintcream',
          'mistyrose',
          'moccasin',
          'navajowhite',
          'navy',
          'oldlace',
          'olive',
          'olivedrab',
          'orange',
          'orangered',
          'orchid',
          'palegoldenrod',
          'palegreen',
          'paleturquoise',
          'palevioletred',
          'papayawhip',
          'peachpuff',
          'peru',
          'pink',
          'plum',
          'powderblue',
          'purple',
          'rebeccapurple',
          'red',
          'rosybrown',
          'royalblue',
          'saddlebrown',
          'salmon',
          'sandybrown',
          'seagreen',
          'seashell',
          'sienna',
          'silver',
          'skyblue',
          'slateblue',
          'slategray',
          'slategrey',
          'snow',
          'springgreen',
          'steelblue',
          'tan',
          'teal',
          'thistle',
          'tomato',
          'turquoise',
          'violet',
          'wheat',
          'white',
          'whitesmoke',
          'yellow',
          'yellowgreen',
          'transparent',
        ].includes(s.toLowerCase())
      ) {
        return 'css-color-name';
      }

      return false;
    },
  };

  static rand = {
    color(type: 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-color-name' = 'hex'): string {
      switch (type) {
        default:
        case 'hex': {
          return `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0')}`;
        }
        case 'hexa': {
          const hex = `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0')}`;

          const alpha = Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0');

          return hex + alpha;
        }
        case 'rgb': {
          const r = Math.floor(Math.random() * 256);
          const g = Math.floor(Math.random() * 256);
          const b = Math.floor(Math.random() * 256);

          return `rgb(${r}, ${g}, ${b})`;
        }
        case 'rgba': {
          const r = Math.floor(Math.random() * 256);
          const g = Math.floor(Math.random() * 256);
          const b = Math.floor(Math.random() * 256);
          const a = Math.random().toFixed(2);

          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        case 'hsl': {
          const h = Math.floor(Math.random() * 361);
          const s = Math.floor(Math.random() * 101);
          const l = Math.floor(Math.random() * 101);

          return `hsl(${h}, ${s}%, ${l}%)`;
        }
        case 'hsla': {
          const h = Math.floor(Math.random() * 361);
          const s = Math.floor(Math.random() * 101);
          const l = Math.floor(Math.random() * 101);
          const a = Math.random().toFixed(2);

          return `hsla(${h}, ${s}%, ${l}%, ${a})`;
        }
        case 'css-color-name': {
          var names = [
            'aliceblue',
            'antiquewhite',
            'aqua',
            'aquamarine',
            'azure',
            'beige',
            'bisque',
            'black',
            'blanchedalmond',
            'blue',
            'blueviolet',
            'brown',
            'burlywood',
            'cadetblue',
            'chartreuse',
            'chocolate',
            'coral',
            'cornflowerblue',
            'cornsilk',
            'crimson',
            'cyan',
            'darkblue',
            'darkcyan',
            'darkgoldenrod',
            'darkgray',
            'darkgreen',
            'darkgrey',
            'darkkhaki',
            'darkmagenta',
            'darkolivegreen',
            'darkorange',
            'darkorchid',
            'darkred',
            'darksalmon',
            'darkseagreen',
            'darkslateblue',
            'darkslategray',
            'darkslategrey',
            'darkturquoise',
            'darkviolet',
            'deeppink',
            'deepskyblue',
            'dimgray',
            'dimgrey',
            'dodgerblue',
            'firebrick',
            'floralwhite',
            'forestgreen',
            'fuchsia',
            'gainsboro',
            'ghostwhite',
            'gold',
            'goldenrod',
            'gray',
            'green',
            'greenyellow',
            'grey',
            'honeydew',
            'hotpink',
            'indianred',
            'indigo',
            'ivory',
            'khaki',
            'lavender',
            'lavenderblush',
            'lawngreen',
            'lemonchiffon',
            'lightblue',
            'lightcoral',
            'lightcyan',
            'lightgoldenrodyellow',
            'lightgray',
            'lightgreen',
            'lightgrey',
            'lightpink',
            'lightsalmon',
            'lightseagreen',
            'lightskyblue',
            'lightslategray',
            'lightslategrey',
            'lightsteelblue',
            'lightyellow',
            'lime',
            'limegreen',
            'linen',
            'magenta',
            'maroon',
            'mediumaquamarine',
            'mediumblue',
            'mediumorchid',
            'mediumpurple',
            'mediumseagreen',
            'mediumslateblue',
            'mediumspringgreen',
            'mediumturquoise',
            'mediumvioletred',
            'midnightblue',
            'mintcream',
            'mistyrose',
            'moccasin',
            'navajowhite',
            'navy',
            'oldlace',
            'olive',
            'olivedrab',
            'orange',
            'orangered',
            'orchid',
            'palegoldenrod',
            'palegreen',
            'paleturquoise',
            'palevioletred',
            'papayawhip',
            'peachpuff',
            'peru',
            'pink',
            'plum',
            'powderblue',
            'purple',
            'rebeccapurple',
            'red',
            'rosybrown',
            'royalblue',
            'saddlebrown',
            'salmon',
            'sandybrown',
            'seagreen',
            'seashell',
            'sienna',
            'silver',
            'skyblue',
            'slateblue',
            'slategray',
            'slategrey',
            'snow',
            'springgreen',
            'steelblue',
            'tan',
            'teal',
            'thistle',
            'tomato',
            'turquoise',
            'violet',
            'wheat',
            'white',
            'whitesmoke',
            'yellow',
            'yellowgreen',
            'transparent',
          ];

          return this.array(names)[0];
        }
      }
    },

    number(min: number, max: number, float: number = 0): number {
      if (min > max) [min, max] = [max, min];

      const rand = Math.random() * (max - min) + min;
      return float ? Number(rand.toFixed(float)) : Math.round(rand);
    },

    boolean(threshold: number = 0.5): boolean {
      return Math.random() > threshold;
    },

    string(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
      let result = '';

      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return result;
    },

    array<T>(arr: T[]): [T, number] {
      const index = this.number(0, arr.length - 1);

      return [arr[index], index];
    },

    date(rangeDays: number = 365): string {
      const now = Date.now();
      const past = now - this.number(0, rangeDays * 24 * 60 * 60 * 1000);

      return new Date(past).toISOString();
    },

    uuid(): string {
      return window.crypto && typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
            (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
          );
    },
  };

  static string = {
    /**
     * Replaces occurrences in a string based on a pattern with the result of an asynchronous callback function.
     * @param string - The input string to perform replacements on.
     * @param pattern - The pattern to match in the string (can be a string or a regular expression).
     * @param callback - An asynchronous callback function that takes the matched substring and any captured groups as arguments and returns the replacement string.
     * @returns A promise that resolves to the modified string with replacements applied.
     * @example
     * ```javascript
     * const result = await Simulation.string.replace("Hello World", /World/, async (match) => {
     *   return await fetchSomeData(match); // Assume this function fetches data asynchronously
     * });
     * console.log(result); // Output will depend on the fetched data
     * ```
     */
    async replace(string: string, pattern: string, callback: (match: string, ...groups: string[]) => Promise<string> | string): Promise<string> {
      const promises: Array<Promise<string>> = [];

      string.replace(pattern, (match: string, ...groups: string[]) => {
        const promise = typeof callback === 'function' ? callback(match, ...groups) : match;

        promises.push(Promise.resolve(promise));

        return match;
      });

      const replacements = await Promise.all(promises);

      return string.replace(pattern, () => replacements.shift() ?? '');
    },

    /**
     * Capitalizes the first letter of a given string.
     * @param string - The input string to be capitalized.
     * @returns The capitalized string.
     * @example
     * ```javascript
     * const result = Simulation.string.capitalize("hello world");
     * console.log(result); // Output: "Hello world"
     * ```
     */
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * Composes a template string by replacing placeholders with corresponding values and applying optional modifiers.
     * @param template - The template string containing placeholders in the format {key} and optional modifiers in the format [MODIFIER:param=value].
     * @param values - An object containing key-value pairs to replace the placeholders in the template.
     * @param options - Optional settings for the composition process.
     * @returns The composed string with placeholders replaced and modifiers applied.
     * @example
     * ```javascript
     * const template = "Hello, {username}! You have {amount} [UPPERCASE=messages] and your name is [CAPITALIZE=name].";
     * const values = { username: "john_doe", amount: 5, name: "john" };
     * const result = Simulation.string.compose(template, values);
     * console.log(result); // Output: "Hello, john_doe! You have 5 MESSAGES and your name is John."
     * ```
     */
    compose(
      template: string,
      values: Record<string, any>,
      options: { method?: 'loop' | 'index'; modifiers?: Record<string, Modifier> } = { method: 'index', modifiers: {} },
    ): string {
      const { mergeSpanStyles } = Simulation.element;

      const flatten: Record<string, string> = Object.entries(Simulation.object.flatten(values)).reduce(
        (acc, [k, v]) => {
          acc[k] = String(v);

          if (['username', 'name', 'nick', 'nickname', 'sender'].some((e) => k === e)) {
            const username = acc?.username || acc?.name || acc?.nick || acc?.nickname || acc?.sender;

            acc['username'] = acc.username || username;
            acc['usernameAt'] = `@${acc.username}`;
            acc['name'] = acc.name || username;
            acc['nick'] = acc.nick || username;
            acc['nickname'] = acc.nickname || username;
            acc['sender'] = acc.sender || username;
            acc['senderAt'] = `@${acc.sender}`;
          }

          if (['amount', 'count'].some((e) => k === e)) {
            acc['amount'] = String(amount);
            acc['count'] = String(acc?.count || amount);
          }

          acc['currency'] = acc.currency || window.client?.details.currency.symbol || '$';
          acc['currencyCode'] = acc.currencyCode || window.client?.details.currency.code || 'USD';

          acc['skip'] = '<br/>';
          acc['newline'] = '<br/>';

          return acc;
        },
        {} as Record<string, string>,
      );

      const REGEX = {
        PLACEHOLDERS: /{([^}]+)}/g,
        MODIFIERS: /\[(\w+)(:[^=]+)?=([^\]]+)\]/g,
      };

      var amount = parseFloat(flatten?.amount ?? flatten?.count ?? 0);

      const MODIFIERS: Record<string, Modifier> = {
        BT1: (value) => (amount > 1 ? value : ''),
        BT0: (value) => (amount > 0 ? value : ''),
        ST1: (value) => (amount < 1 ? value : ''),
        ST0: (value) => (amount < 0 ? value : ''),
        UPC: (value) => value.toUpperCase(),
        LOW: (value) => value.toLowerCase(),
        REV: (value) => value.split('').reverse().join(''),
        CAP: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        FALLBACK: (value, param) => (value.length ? value : (param ?? value)),
        COLOR: (value, param) => mergeSpanStyles(param && !!Simulation.color.validate(param) ? `color: ${param}` : '', value),
        WEIGHT: (value, param) => mergeSpanStyles(param && !isNaN(parseInt(param)) ? `font-weight: ${param}` : '', value),
        BOLD: (value) => mergeSpanStyles('font-weight: bold', value),
        LIGHT: (value) => mergeSpanStyles('font-weight: lighter', value),
        STRONG: (value) => mergeSpanStyles('font-weight: bolder', value),
        ITALIC: (value) => mergeSpanStyles('font-style: italic', value),
        UNDERLINE: (value) => mergeSpanStyles('text-decoration: underline', value),
        STRIKETHROUGH: (value) => mergeSpanStyles('text-decoration: line-through', value),
        SUB: (value) => mergeSpanStyles('vertical-align: sub', value),
        SUP: (value) => mergeSpanStyles('vertical-align: super', value),
        LARGER: (value) => mergeSpanStyles('font-size: larger', value),
        SMALL: (value) => mergeSpanStyles('font-size: smaller', value),
        SHADOW: (value, param) => mergeSpanStyles(`text-shadow: ${param}`, value),
        SIZE: (value, param) => mergeSpanStyles(param ? `font-size: ${param}` : '', value),
        ...(options.modifiers ?? {}),
      };

      const ALIASES = {
        UPC: ['UPPERCASE', 'UPPER', 'UPP'],
        LOW: ['LOWERCASE', 'LOWER', 'LWC'],
        REV: ['REVERSE', 'RVS'],
        CAP: ['CAPITALIZE', 'CAPITAL'],
        BT1: ['BIGGER_THAN_1', 'GREATER_THAN_1', 'GT1'],
        BT0: ['BIGGER_THAN_0', 'GREATER_THAN_0', 'GT0'],
        ST1: ['SMALLER_THAN_1', 'LESS_THAN_1', 'LT1'],
        ST0: ['SMALLER_THAN_0', 'LESS_THAN_0', 'LT0'],
        COLOR: ['COLOUR', 'CLR', 'HIGHLIGHT'],
        BOLD: ['BOLDEN', 'B'],
        STRONG: ['STRONGEN', 'STRONG'],
        ITALIC: ['ITALICIZE', 'ITALIC', 'I'],
        UNDERLINE: ['U', 'INS', 'INSET', 'I'],
        STRIKETHROUGH: ['STRIKE', 'S', 'DELETE', 'D'],
        SUB: ['SUBSCRIPT', 'SUBS'],
        SUP: ['SUPERSCRIPT', 'SUPS'],
        LARGER: ['LARGER', 'LG'],
        SMALL: ['SMALLER', 'SM'],
        SHADOW: ['SHADOW', 'SHD'],
        FALLBACK: ['FALLBACK', 'FB'],
      };

      function applyModifier(value: string, name: string, param: string | null | undefined): string {
        const canonical = Object.entries(ALIASES).find(([key, aliases]) => {
          if (aliases.some((alias) => alias.toUpperCase() === name.toUpperCase())) return true;
          else if (key.toUpperCase() === name.toUpperCase()) return true;
          else return false;
        });
        const use = canonical ? canonical[0] : name.toUpperCase();

        if (MODIFIERS[use]) return MODIFIERS[use](value, typeof param === 'string' ? param.trim() : null, flatten);
        else return value;
      }

      function replaceAll(string: string): string {
        let str = string;
        let match;

        while ((match = REGEX.MODIFIERS.exec(str)) !== null) {
          const [fullMatch, modifier, param, value] = match;

          const newValue = applyModifier(replaceAll(value), modifier, param);

          str = str.replace(fullMatch, newValue ?? '');

          REGEX.MODIFIERS.lastIndex = 0;
        }

        return str;
      }

      function parseModifiers(str: string): string {
        let i = 0;
        const len = str.length;

        function parseText(stopChar?: string): string {
          let out = '';
          while (i < len) {
            if (str[i] === '\\') {
              if (i + 1 < len) {
                out += str[i + 1];
                i += 2;
              } else {
                i++;
              }
            } else if (str[i] === '[' && (!stopChar || stopChar !== '[')) {
              out += parseModifier();
            } else if (stopChar && str[i] === stopChar) {
              i++;
              break;
            } else {
              out += str[i++];
            }
          }
          return out;
        }

        function parseModifier(): string {
          i++;
          let name = '';
          while (i < len && /[A-Za-z0-9]/.test(str[i])) name += str[i++];
          let param: string | null = null;
          if (str[i] === ':') {
            i++;
            const paramStart = i;
            while (i < len && str[i] !== '=') i++;
            param = str.slice(paramStart, i);
          }
          if (str[i] === '=') i++;
          const value = parseText(']');
          return applyModifier(value, name, param);
        }

        return parseText();
      }

      let result = template.replace(REGEX.PLACEHOLDERS, (_, key: string) =>
        typeof flatten[key] === 'string' || typeof flatten[key] === 'number' ? String(flatten[key]) : (key ?? key),
      );

      result = options.method === 'loop' ? replaceAll(result) : parseModifiers(result);

      return result;
    },
  };

  static element = {
    /**
     * Merges outer span styles with inner span styles in the provided HTML string.
     * @param outerStyle - The style string to be applied to the outer span.
     * @param innerHTML - The inner HTML string which may contain a span with its own styles.
     * @returns A new HTML string with merged styles applied to a single span.
     * @example
     * ```javascript
     * const result = Simulation.element.mergeSpanStyles("color: red; font-weight: bold;", '<span style="font-size: 14px;">Hello World</span>');
     * console.log(result); // Output: '<span style="font-size: 14px; color: red; font-weight: bold;">Hello World</span>'
     * ```
     */
    mergeSpanStyles(outerStyle: string, innerHTML: string): string {
      const match = innerHTML.match(/^<span style="([^"]*)">(.*)<\/span>$/s);

      if (match) {
        const innerStyle = match[1];
        const content = match[2];

        const mergedStyle = [innerStyle, outerStyle]
          .filter(Boolean)
          .join('; ')
          .replace(/\s*;\s*/g, '; ')
          .trim();

        return `<span style="${mergedStyle}">${content}</span>`;
      } else {
        return `<span style="${outerStyle}">${innerHTML}</span>`;
      }
    },
  };

  static object = {
    /**
     * Flattens a nested object into a single-level object with dot-separated keys.
     * @param obj - The nested object to be flattened.
     * @param prefix  - The prefix to be added to each key (used for recursion).
     * @returns A flattened object with dot-separated keys.
     * @example
     * ```javascript
     * const nestedObj = { a: { b: 1, c: { d: 2 } }, e: [3, 4] };
     * const flatObj = Simulation.object.flatten(nestedObj);
     * console.log(flatObj);
     * // Output: { 'a.b': '1', 'a.c.d': '2', 'e:0': '3', 'e:1': '4' }
     * ```
     */
    flatten(obj: Record<string, any>, prefix: string = ''): Record<string, string> {
      const result = {} as Record<string, string>;

      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];
        const path = prefix ? `${prefix}.${key}` : key;

        // Handle null and undefined
        if (value === null || value === undefined) {
          result[path] = String(value);

          continue;
        }

        // Handle Date objects
        if (value instanceof Date) {
          result[path] = value.toISOString();

          continue;
        }

        // Handle Map objects
        if (value instanceof Map) {
          value.forEach((v, k) => {
            result[`${path}.${k}`] = JSON.stringify(v);
          });

          continue;
        }

        // Handle Array objects
        if (Array.isArray(value)) {
          value.forEach((v, i) => {
            const itemPath = `${path}:${i}`;

            if (typeof v === 'object') {
              Object.assign(result, this.flatten(v, itemPath));
            } else {
              result[itemPath] = String(v);
            }
          });

          continue;
        }

        // Handle nested objects
        if (typeof value === 'object') {
          Object.assign(result, this.flatten(value, path));

          continue;
        }

        // Handle primitive values (string, number, boolean, etc.)
        result[path] = String(value);
      }

      return result;
    },
  };

  static generate = {
    session: {
      types: {
        name: { type: 'string', options: Simulation.data.names.filter((e) => e.length) },
        tier: { type: 'string', options: Simulation.data.tiers.filter((e) => e.length) },
        message: { type: 'string', options: Simulation.data.messages.filter((e) => e.length) },
        item: { type: 'array', options: Simulation.data.items },
        avatar: { type: 'string', options: Simulation.data.avatars.filter((e) => e.length) },
      } as Record<string, Session$AnyConfig>,

      available(): Session$AvailableData {
        const types = this.types;

        return {
          follower: {
            latest: { name: types.name },
            session: { count: { type: 'int', min: 50, max: 200 } },
            week: { count: { type: 'int', min: 200, max: 1000 } },
            month: { count: { type: 'int', min: 1000, max: 3000 } },
            goal: { amount: { type: 'int', min: 3000, max: 7000 } },
            total: { count: { type: 'int', min: 7000, max: 10000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: { name: types.name, createdAt: { type: 'date', range: 400 } },
            },
          },
          subscriber: {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              tier: types.tier,
              message: types.message,
            },
            'new-latest': {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              message: types.message,
            },
            'resub-latest': {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              message: types.message,
            },
            'gifted-latest': {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              message: types.message,
              tier: types.tier,
              sender: types.name,
            },
            session: { count: { type: 'int', min: 10, max: 40 } },
            'new-session': { count: { type: 'int', min: 10, max: 40 } },
            'resub-session': { count: { type: 'int', min: 10, max: 40 } },
            'gifted-session': { count: { type: 'int', min: 10, max: 40 } },
            week: { count: { type: 'int', min: 40, max: 100 } },
            month: { count: { type: 'int', min: 100, max: 200 } },
            goal: { amount: { type: 'int', min: 200, max: 300 } },
            total: { count: { type: 'int', min: 300, max: 400 } },
            points: { amount: { type: 'int', min: 100, max: 400 } },
            'alltime-gifter': { name: types.name, amount: { type: 'int', min: 300, max: 400 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 10, max: 30 },
                tier: types.tier,
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          host: {
            latest: { name: types.name, amount: { type: 'int', min: 1, max: 10 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 1, max: 10 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          raid: {
            latest: { name: types.name, amount: { type: 'int', min: 0, max: 100 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 0, max: 100 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          charityCampaignDonation: {
            latest: { name: types.name, amount: { type: 'int', min: 50, max: 150 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 50, max: 200 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 200, max: 500 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 500, max: 800 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 800, max: 1000 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 50, max: 200 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 500 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 500, max: 800 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 800, max: 1000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 50, max: 150 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          cheer: {
            latest: { name: types.name, amount: { type: 'int', min: 200, max: 800 }, message: types.message },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 200, max: 1000 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 1000, max: 5000 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 5000, max: 12000 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 12000, max: 20000 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 1000 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 1000, max: 5000 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 5000, max: 12000 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 12000, max: 20000 } },
            session: { amount: { type: 'int', min: 200, max: 1000 } },
            week: { amount: { type: 'int', min: 1000, max: 5000 } },
            month: { amount: { type: 'int', min: 5000, max: 12000 } },
            goal: { amount: { type: 'int', min: 12000, max: 18000 } },
            total: { amount: { type: 'int', min: 18000, max: 20000 } },
            count: { count: { type: 'int', min: 200, max: 1000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 200, max: 800 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          cheerPurchase: {
            latest: { name: types.name, amount: { type: 'int', min: 200, max: 400 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 200, max: 400 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 400, max: 800 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 800, max: 1500 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 1500, max: 2000 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 400 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 400, max: 800 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 800, max: 1500 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 1500, max: 2000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 200, max: 400 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          superchat: {
            latest: { name: types.name, amount: { type: 'int', min: 100, max: 400 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            session: { amount: { type: 'int', min: 100, max: 500 } },
            week: { amount: { type: 'int', min: 500, max: 1000 } },
            month: { amount: { type: 'int', min: 1000, max: 2000 } },
            goal: { amount: { type: 'int', min: 2000, max: 2300 } },
            total: { amount: { type: 'int', min: 2300, max: 2500 } },
            count: { count: { type: 'int', min: 100, max: 500 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 100, max: 400 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          hypetrain: {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              active: { type: 'int', min: 0, max: 1 },
              level: { type: 'int', min: 5, max: 10 },
              levelChanged: { type: 'int', min: 0, max: 5 },
              _type: { type: 'array', options: ['follower', 'subscriber', 'cheer', 'donation'] },
            },
            'level-goal': { amount: { type: 'int', min: 0, max: 100 } },
            'level-progress': { amount: { type: 'int', min: 0, max: 100 }, percent: { type: 'int', min: 0, max: 100 } },
            total: { amount: { type: 'int', min: 0, max: 100 } },
            'latest-top-contributors': { type: 'recent', amount: 25, value: { name: types.name } },
          },
          'channel-points': {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              message: types.message,
              redemption: { type: 'array', options: ['Reward 1', 'Reward 2', 'Reward 3'] },
            },
          },
          tip: {
            latest: { name: types.name, amount: { type: 'int', min: 100, max: 400 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            session: { amount: { type: 'int', min: 100, max: 500 } },
            week: { amount: { type: 'int', min: 500, max: 1000 } },
            month: { amount: { type: 'int', min: 1000, max: 2000 } },
            goal: { amount: { type: 'int', min: 2000, max: 2300 } },
            total: { amount: { type: 'int', min: 2300, max: 2500 } },
            count: { count: { type: 'int', min: 100, max: 500 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 100, max: 400 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          merch: {
            latest: { name: types.name, amount: { type: 'int', min: 0, max: 100 }, items: types.item },
            'goal-orders': { amount: { type: 'int', min: 0, max: 100 } },
            'goal-items': { amount: { type: 'int', min: 0, max: 100 } },
            'goal-total': { amount: { type: 'int', min: 0, max: 100 } },
            recent: { type: 'recent', amount: 25, value: { name: types.name } },
          },
          purchase: {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              items: types.item,
              avatar: types.avatar,
              message: types.message,
            },
          },
        };
      },

      async get(): Promise<Session> {
        const available = this.available();

        const generate = (available: Session$AvailableData | Session$AvailableCategory | Session$AnyConfig): any => {
          const generateRecentData = (config: Session$AnyConfig): Array<any> => {
            if (!config || !('amount' in config)) return [];

            const items: Array<{ createdAt: string }> = [];

            for (let i = 0; i < config.amount; i++) {
              items.push(generate(config.value));
            }

            return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          };

          const generateObjectData = (config: Record<string, any>): Record<string, any> => {
            const result: Record<string, any> = {};

            for (const key in config) {
              const processedKey = key.replace('_type', 'type');

              result[processedKey] = generate(config[key]);
            }

            return result;
          };

          const processTypedConfig = (config: Session$AnyConfig): any => {
            if (!config) return config;

            switch (config.type) {
              case 'int':
                return Simulation.rand.number(config.min, config.max);
              case 'string':
                return Simulation.rand.array(config.options)[0];
              case 'date':
                return Simulation.rand.date(config.range);
              case 'array':
                return Simulation.rand.array(config.options)[0];
              case 'recent':
                return generateRecentData(config);
              default:
                return config;
            }
          };

          // Main generation logic

          // Handle primitive values (non-objects)
          if (typeof available !== 'object' || available === null) {
            return available;
          }

          // Handle typed configurations (objects with a 'type' property)
          if ('type' in available && typeof available.type === 'string') {
            return processTypedConfig(available);
          }

          // Handle generic objects - recursively process each property
          return generateObjectData(available);
        };

        var session: Session = Object.entries(generate(available)).reduce(
          (acc, [key, value]) => {
            Object.entries(value as any).forEach(
              ([subKey, subValue]) =>
                //
                (acc[`${key}-${subKey}`] = subValue),
            );

            return acc;
          },
          {} as Record<string, any>,
        ) as Session;

        return session;
      },
    },
    event: {
      /**
       * Simulates the onWidgetLoad event for a widget.
       * @param fields - The field values to be included in the event.
       * @param session - The session data to be included in the event.
       * @param currency - The currency to be used (default is 'USD').
       * @returns A Promise that resolves to the simulated onWidgetLoad event data.
       */
      async onWidgetLoad(fields: Record<string, StreamElementsFieldValue>, session: Session, currency: 'BRL' | 'USD' | 'EUR' = 'USD'): Promise<onWidgetLoad> {
        const currencies = {
          BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
          USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
          EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
        };

        return {
          channel: {
            username: 'local',
            apiToken: '',
            id: '',
            providerId: '',
            avatar: '',
          },
          currency: currencies[currency] ?? currencies.USD,
          fieldData: fields,
          recents: [],
          session: {
            data: session,
            settings: {
              autoReset: false,
              calendar: false,
              resetOnStart: false,
            },
          },
          overlay: {
            isEditorMode: true,
            muted: false,
          },
          emulated: true,
        };
      },
      /**
       * Simulates the onSessionUpdate event for a widget.
       * @param session - The session data to be included in the event.
       * @returns A Promise that resolves to the simulated onSessionUpdate event data.
       */
      async onSessionUpdate(session?: Session): Promise<onSessionUpdate> {
        session ??= await Simulation.generate.session.get();

        return { session };
      },
      /**
       * Simulates the onEventReceived event for a widget.
       * @param provider - The provider of the event (default is 'random').
       * @param type - The type of event to simulate (default is 'random').
       * @param options - Additional options to customize the event data.
       * @returns A Promise that resolves to the simulated onEventReceived event data, or null if the event type is not supported.
       * @example
       * ```javascript
       * // Simulate a random event
       * const randomEvent = await Simulation.generate.event.onEventReceived();
       *
       * // Simulate a Twitch message event with custom options
       * const twitchMessageEvent = await Simulation.generate.event.onEventReceived('twitch', 'message', { name: 'Streamer', message: 'Hello World!' });
       * ```
       */
      async onEventReceived(
        provider: Provider | 'random' = 'random',
        type: onEventReceived['listener'] | 'random' | 'tip' | 'cheer' | 'follower' | 'raid' | 'subscriber' = 'random',
        options: Record<string, string | number | boolean> = {},
      ): Promise<onEventReceived | null> {
        const available: Record<Provider, string[]> = {
          twitch: ['message', 'follower-latest', 'cheer-latest', 'raid-latest', 'subscriber-latest'],
          streamelements: ['tip-latest'],
          youtube: ['message', 'superchat-latest', 'subscriber-latest', 'sponsor-latest'],
          kick: [],
          facebook: [],
        };

        switch (provider) {
          default:
          case 'random': {
            var randomProvider = Simulation.rand.array(Object.keys(available).filter((e) => available[e as Provider].length))[0] as Provider;
            var randomEvent = Simulation.rand.array(available[randomProvider])[0] as onEventReceived['listener'];

            return this.onEventReceived(randomProvider, randomEvent);
          }

          case 'twitch': {
            switch (type as Twitch['listener'] | 'random' | 'cheer' | 'follower' | 'raid' | 'subscriber') {
              default:
              case 'random': {
                var randomEvent = Simulation.rand.array(available[provider])[0] as onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'message': {
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                var badges = await generateBadges((options?.badges as BadgeOptions) ?? [], provider);

                var emotes = findEmotesInText(message);
                var renderedText = replaceEmotesWithHTML(message, emotes);

                var color = (options?.color as string) ?? Simulation.rand.color('hex');
                var userId = (options?.userId as string) ?? Simulation.rand.number(10000000, 99999999).toString();
                var time = Date.now();

                const event: Twitch$Message = {
                  listener: 'message',
                  event: {
                    service: provider,
                    data: {
                      time: time,
                      tags: {
                        'badge-info': `${badges.keys.map((key) => `${key}/${Simulation.rand.number(1, 5)}`).join(',')}`,
                        'badges': badges.keys.join('/1,'),

                        'mod': badges.keys.includes('moderator') ? '1' : '0',
                        'subscriber': badges.keys.includes('subscriber') ? '1' : '0',
                        'turbo': badges.keys.includes('turbo') ? '1' : '0',

                        'tmi-sent-ts': time.toString(),

                        'user-id': userId,
                        'user-type': '',

                        'color': color,
                        'display-name': name,
                        'emotes': '',

                        'client-nonce': Simulation.rand.string(16),
                        'flags': '',
                        'id': Simulation.rand.uuid(),
                        'first-msg': '0',
                        'returning-chatter': '0',
                      },
                      nick: name.toLowerCase(),
                      displayName: name,
                      displayColor: color,
                      channel: 'local',
                      text: message,
                      isAction: false,
                      userId: userId,
                      msgId: Simulation.rand.uuid(),
                      badges: badges.badges,
                      emotes: emotes,
                    },
                    renderedText: renderedText,
                  },
                };

                return event;
              }
              case 'cheer':
              case 'cheer-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(100, 10000);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                const event: Twitch$Cheer = {
                  listener: 'cheer-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    message: message,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'cheer',
                    originalEventName: 'cheer-latest',
                  },
                };

                return event;
              }
              case 'follower':
              case 'follower-latest': {
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: Twitch$Follower = {
                  listener: 'follower-latest',
                  event: {
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'follower',
                    originalEventName: 'follower-latest',
                  },
                };

                return event;
              }
              case 'raid':
              case 'raid-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(1, 100);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: Twitch$Raid = {
                  listener: 'raid-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'raid',
                    originalEventName: 'raid-latest',
                  },
                };

                return event;
              }
              case 'subscriber':
              case 'subscriber-latest': {
                var tier = (options?.tier as string) ?? Simulation.rand.array(['1000', '2000', '3000'])[0];
                var amount = (options?.amount as number) ?? Simulation.rand.number(1, 24);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var sender = (options?.sender as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length && e !== name))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                var addons = {
                  default: {
                    avatar,
                    tier,
                    playedAsCommunityGift: false,
                  },
                  gift: {
                    sender,
                    gifted: true,
                  } as Subscriber$gift,
                  community: {
                    message,
                    sender,
                    bulkGifted: true,
                  } as Subscriber$community,
                  spam: {
                    sender,
                    gifted: true,
                    isCommunityGift: true,
                  } as Subscriber$spam,
                };

                var subTypes = ['default', 'gift', 'community', 'spam'];
                var subType = (options?.subType as string) ?? Simulation.rand.array(subTypes)[0];

                subType = subTypes.includes(subType) ? subType : 'default';

                const event: Twitch$Subscriber = {
                  listener: 'subscriber-latest',
                  event: {
                    amount,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',

                    ...addons.default,
                    ...addons[subType as keyof typeof addons],

                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'subscriber',
                    originalEventName: 'subscriber-latest',
                  },
                };

                return event;
              }
              case 'delete-message': {
                const event: Twitch$DeleteMessage = {
                  listener: 'delete-message',
                  event: {
                    msgId: (options?.id as string) ?? Simulation.rand.uuid(),
                  },
                };

                return event;
              }
              case 'delete-messages': {
                const event: Twitch$DeleteMessages = {
                  listener: 'delete-messages',
                  event: {
                    userId: (options?.id as string) ?? Simulation.rand.number(10000000, 99999999).toString(),
                  },
                };

                return event;
              }
            }
          }

          case 'streamelements': {
            switch (type as StreamElements['listener'] | 'random' | 'tip' | 'mute' | 'unmute' | 'skip') {
              default:
              case 'random': {
                var randomEvent = Simulation.rand.array(available[provider])[0] as onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'tip':
              case 'tip-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(100, 4000);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: StreamElements$Tip = {
                  listener: 'tip-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'tip',
                    originalEventName: 'tip-latest',
                  },
                };

                return event;
              }
              case 'kvstore:update': {
                const event: StreamElements$KVStore = {
                  listener: 'kvstore:update',
                  event: {
                    data: {
                      key: `customWidget.${(options?.key as string) ?? 'sampleKey'}`,
                      value: (options?.value as string) ?? 'sampleValue',
                    },
                  },
                };

                return event;
              }
              case 'bot:counter': {
                const event: StreamElements$BotCounter = {
                  listener: 'bot:counter',
                  event: {
                    counter: (options?.counter as string) ?? 'sampleCounter',
                    value: (options?.value as number) ?? Simulation.rand.number(0, 100),
                  },
                };

                return event;
              }
              case 'mute':
              case 'unmute':
              case 'alertService:toggleSound': {
                const event: StreamElements$AlertService = {
                  listener: 'alertService:toggleSound',
                  event: {},
                };

                return event;
              }
              case 'skip':
              case 'event:skip': {
                const event: StreamElements$EventSkip = {
                  listener: 'event:skip',
                  event: {},
                };

                return event;
              }
            }
          }

          case 'youtube': {
            switch (type as Youtube['listener'] | 'random' | 'message' | 'superchat' | 'subscriber' | 'sponsor') {
              default:
              case 'random': {
                var randomEvent = Simulation.rand.array(available[provider])[0] as onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'message': {
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                const badges = await generateBadges((options?.badges as BadgeOptions) ?? [], provider);

                var emotes = findEmotesInText(message);
                var renderedText = replaceEmotesWithHTML(message, emotes);

                var color = (options?.color as string) ?? Simulation.rand.color('hex');
                var userId = (options?.userId as string) ?? Simulation.rand.number(10000000, 99999999).toString();
                var time = Date.now();

                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];

                const event: Youtube$Message = {
                  listener: 'message',
                  event: {
                    service: 'youtube',
                    data: {
                      kind: '',
                      etag: '',
                      id: '',
                      snippet: {
                        type: '',
                        liveChatId: '',
                        authorChannelId: 'local',
                        publishedAt: new Date().toISOString(),
                        hasDisplayContent: true,
                        displayMessage: message,
                        textMessageDetails: {
                          messageText: message,
                        },
                      },
                      authorDetails: {
                        channelId: 'local',
                        channelUrl: '',
                        displayName: name,
                        profileImageUrl: avatar,
                        ...badges,
                      },
                      msgId: Simulation.rand.uuid(),
                      userId: Simulation.rand.uuid(),
                      nick: name.toLowerCase(),
                      badges: [],
                      displayName: name,
                      isAction: false,
                      time: Date.now(),
                      tags: [],
                      displayColor: Simulation.rand.color('hex'),
                      channel: 'local',
                      text: message,
                      avatar: avatar,
                      emotes: [],
                    },
                    renderedText: message,
                  },
                };

                return event;
              }
              case 'subscriber':
              case 'subscriber-latest': {
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: YouTube$Subscriber = {
                  listener: 'subscriber-latest',
                  event: {
                    avatar,
                    displayName: name,
                    name: name.toLowerCase(),
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'subscriber',
                    originalEventName: 'subscriber-latest',
                  },
                };

                return event;
              }
              case 'superchat':
              case 'superchat-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(100, 4000);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: YouTube$Superchat = {
                  listener: 'superchat-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'superchat',
                    originalEventName: 'superchat-latest',
                  },
                };

                return event;
              }
              case 'sponsor':
              case 'sponsor-latest': {
                var tier = (options?.tier as string) ?? Simulation.rand.array(['1000', '2000', '3000'])[0];
                var amount = (options?.amount as number) ?? Simulation.rand.number(1, 24);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var sender = (options?.sender as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length && e !== name))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                var addons = {
                  default: {
                    avatar,
                    tier,
                    playedAsCommunityGift: false,
                  },
                  gift: {
                    sender,
                    gifted: true,
                  } as Sponsor$gift,
                  community: {
                    message,
                    sender,
                    bulkGifted: true,
                  } as Sponsor$community,
                  spam: {
                    sender,
                    gifted: true,
                    isCommunityGift: true,
                  } as Sponsor$spam,
                };

                var subTypes = ['default', 'gift', 'community', 'spam'];
                var subType = (options?.subType as string) ?? Simulation.rand.array(subTypes)[0];

                subType = subTypes.includes(subType) ? subType : 'default';

                const event: Youtube$Sponsor = {
                  listener: 'sponsor-latest',
                  event: {
                    amount,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',

                    ...addons.default,
                    ...addons[subType as keyof typeof addons],

                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'sponsor',
                    originalEventName: 'sponsor-latest',
                  },
                };

                return event;
              }
            }
          }
        }
      },
    },
  };

  static fields(settings: FieldSettings): Record<string, StreamElementsField> {
    const defaultOptions: NormalizedFieldSettings = {
      from: 'main',
      endsWith: [],
      ignore: [],
      replace: {},
      subgroup: false,
      template: '• {key}',
      subgroupTemplate: '★ {key}',
      settings: {
        types: [
          [['size', 'width', 'number', 'gap', 'duration'], 'number'],
          [['options', 'dropdown', 'weight'], 'dropdown'],
          [['range', 'radius'], 'slider'],
          [['color', 'background'], 'colorpicker'],
          [['font-family', 'font', 'family'], 'googleFont'],
        ],
        addons: [
          [['slider', 'radius'], { step: 1, min: 0, max: 'inherit' }],
          [['options', 'dropdown'], { options: {} }],
          [
            ['weight'],
            {
              options: {
                '100': 'Thin',
                '200': 'Extra Light',
                '300': 'Light',
                '400': 'Regular',
                '500': 'Medium',
                '600': 'Semi Bold',
                '700': 'Bold',
                '800': 'Extra Bold',
                '900': 'Black',
              },
            },
          ],
        ],
        transforms: [
          [['size', 'width', 'number', 'gap', 'duration'], (value) => parseFloat(String(value))],
          [['font-family', 'font', 'family'], (value) => value],
          [['range', 'radius'], (value) => parseFloat(String(value))],
          [['options', 'dropdown'], (value) => value],
          [['weight'], (value) => value],
          [['color', 'background'], (value) => value],
        ],
        labels: [
          [['font-size'], ' • In pixels'],
          [['font-radius'], ' • In pixels'],
        ],
      },
    };

    function normalizeFieldSettings(settings: FieldSettings): NormalizedFieldSettings {
      return {
        ...defaultOptions,
        ...settings,
        endsWith: Array.isArray(settings.endsWith) ? settings.endsWith : defaultOptions.endsWith,
        ignore: Array.isArray(settings.ignore) ? settings.ignore : defaultOptions.ignore,
        replace: { ...defaultOptions.replace, ...(settings.replace ?? {}) },
        settings: {
          types: Array.isArray(settings.settings?.types) ? settings.settings.types : defaultOptions.settings.types,
          addons: Array.isArray(settings.settings?.addons) ? settings.settings.addons : defaultOptions.settings.addons,
          transforms: Array.isArray(settings.settings?.transforms) ? settings.settings.transforms : defaultOptions.settings.transforms,
          labels: Array.isArray(settings.settings?.labels) ? settings.settings.labels : defaultOptions.settings.labels,
        },
        subgroup: settings.subgroup ?? defaultOptions.subgroup,
        template: settings.template ?? defaultOptions.template,
        subgroupTemplate: settings.subgroupTemplate ?? defaultOptions.subgroupTemplate,
        from: settings.from ?? defaultOptions.from,
      };
    }

    const options = normalizeFieldSettings(settings);

    const extractCssVariables = (): Record<string, string> => {
      return Array.from(document.styleSheets)
        .filter(({ href }) => !href || href.startsWith(window.location.origin))
        .reduce(
          (acc, { cssRules }) => {
            if (!cssRules) return acc;
            Array.from(cssRules).forEach((rule) => {
              if (rule instanceof CSSStyleRule && rule.selectorText === options.from && Array.from(rule.style).some((prop) => prop.startsWith('--'))) {
                Array.from(rule.style)
                  .filter((prop) => prop.startsWith('--'))
                  .forEach((prop) => {
                    acc[prop] = rule.style.getPropertyValue(prop).trim();
                  });
              }
            });
            return acc;
          },
          {} as Record<string, string>,
        );
    };

    const allVariables = extractCssVariables();

    const filteredVariables = Object.entries(allVariables)
      .filter(([name]) => options.endsWith.some((suffix) => name.toLowerCase().endsWith(suffix.toLowerCase()) && !name.includes('-options-')))
      .filter(([name]) => !options.ignore.some((ignoreName) => name.toLowerCase() === ignoreName.toLowerCase()))
      .reduce(
        (acc, [name, value]) => {
          acc[name.replace('--', '')] = String(options.replace?.[name] ?? value);
          return acc;
        },
        {} as Record<string, string | number>,
      );

    let usedSubgroups: string[] = [];

    const fields = Object.entries(filteredVariables).reduce(
      (fields, [name, value]) => {
        let type = options.settings.types.find(([names]) => names.some((n) => name.toLowerCase().includes(n)))?.[1] || 'text';

        let transform = options.settings.transforms.find(([names]) => names.some((n) => name.toLowerCase().includes(n)))?.[1] || ((v: any) => v);

        let labelAddon = options.settings.labels.find(([names]) => names.some((n) => name.toLowerCase().includes(n)))?.[1] || '';

        let fieldAddons: Record<string, any> = {
          type: 'text',
          label: labelAddon,
          ...(options.settings.addons.find(([names]) => names.some((n) => name.toLowerCase().includes(n)))?.[1] || {}),
        };

        (['min', 'max', 'step', 'label', 'type'] as const).forEach((addonKey) => {
          const addonValue = allVariables[`--${name}-${addonKey}`];
          if (addonValue && addonValue.length) {
            fieldAddons[addonKey] = isNaN(parseFloat(addonValue)) ? String(addonValue).replace(/^['"]|['"]$/g, '') : String(parseFloat(addonValue));
          }
        });

        let subgroupKey = name
          .replace(/-(size|color|weight|width|height|gap|duration|radius|amount)$/g, '')
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
          .replace(/[A-Z]/g, ' $&')
          .toLowerCase()
          .trim();

        let matchingSubgroupVars = Object.keys(filteredVariables).filter((key) =>
          key.startsWith(subgroupKey.replace(/[A-Z]/g, '-$&').replaceAll(' ', '-').toLowerCase().slice(1)),
        );

        if (
          options.subgroup &&
          !fields[`${subgroupKey.replace(/[A-Z]/g, '-$&').replaceAll(' ', '-').toLowerCase().slice(1)}-subgroup`] &&
          matchingSubgroupVars.length > 1 &&
          !usedSubgroups.includes(name)
        ) {
          usedSubgroups.push(...matchingSubgroupVars);

          fields[`${subgroupKey.replace(/[A-Z]/g, '-$&').replaceAll(' ', '-').toLowerCase().slice(1)}-subgroup`] = {
            type: 'hidden',
            label: options.subgroupTemplate.replaceAll('{key}', Simulation.string.capitalize(subgroupKey)),
          };
        }

        let label = Simulation.string.capitalize(
          name
            .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
            .replace(/[A-Z]/g, ' $&')
            .toLowerCase(),
        );

        value = transform(value) ?? value;

        const getCustomOptions = () => {
          const values = Object.entries(allVariables)
            .filter(([key]) => key.startsWith(`--${name}-options-`))
            .reduce(
              (acc, [key, value]) => {
                const optionLabel = key.replace(`--${name}-options-`, '');
                if (optionLabel)
                  acc[String(value)] = Simulation.string.capitalize(
                    optionLabel
                      .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                      .replace(/[A-Z]/g, ' $&')
                      .toLowerCase(),
                  );
                return acc;
              },
              {} as Record<string, string>,
            );
          return Object.keys(values).length ? values : null;
        };

        const customOptions = getCustomOptions();

        if (customOptions) {
          type = 'dropdown';
          fieldAddons.options = customOptions;
          value = String(value);
        }

        Object.entries(fieldAddons).forEach(([key, val]) => {
          if ([false, 'inherit', 'auto', null].includes(val)) fieldAddons[key] = value;
        });

        fields[name] = {
          type: (fieldAddons.type as StreamElementsFieldTypes) || type,
          label: options.template.toString().replaceAll('{key}', Simulation.string.capitalize(label) + fieldAddons.label),
          value,
          min: fieldAddons.min,
          max: fieldAddons.max,
          step: fieldAddons.step,
          options: fieldAddons.options,
        };

        return fields;
      },
      {} as Record<string, StreamElementsField>,
    );

    const errors = Object.entries(fields).reduce(
      (acc, [name, field]) => {
        const hasInvalidLabel = field?.label?.includes('undefined');
        const isInvalidValue = !['hidden', 'button'].includes(field.type) && field.value === undefined;
        if (hasInvalidLabel || isInvalidValue) acc[name] = field;
        return acc;
      },
      {} as Record<string, StreamElementsField>,
    );

    if (Object.keys(errors).length) {
      Tixyel.logger.error('Simulation.fields: Detected errors in generated fields:', errors);

      throw new Error('Error while processing fields');
    }

    return fields;
  }

  static async start() {
    const localFiles = {
      fields: ['fields.json', 'cf.json', 'field.json', 'customfields.json'].find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
      data: ['data.json', 'fielddata.json', 'fd.json', 'DATA.json'].find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
    };

    const data: Record<string, string | number | boolean> = await fetch('./' + (localFiles.data ?? 'data.json'), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .catch(() => ({}));

    await fetch('./' + (localFiles.fields ?? 'fields.json'), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then(async (customfields: Record<string, StreamElementsField>) => {
        const fields = Object.entries(customfields)
          .filter(([_, { value }]) => value != undefined)
          .reduce(
            (acc, [key, { value }]) => {
              if (data && data[key] !== undefined) value = data[key];

              acc[key] = value;

              return acc;
            },
            {} as Record<string, StreamElementsFieldValue>,
          );

        const load = await Simulation.generate.event.onWidgetLoad(fields, await Simulation.generate.session.get());

        window.dispatchEvent(new CustomEvent('onWidgetLoad', { detail: load }));
      });
  }
}
