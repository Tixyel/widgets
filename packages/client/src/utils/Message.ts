import { Simulation } from '../simulation/index.js';
import { TwitchBadge, TwitchBadgesKeys } from '../types/badge.js';
import { Provider } from '../types/client.js';
import { BttvEmote, SeventvEmote, TwitchEmote } from '../types/emote.js';

type Emote = TwitchEmote | BttvEmote | SeventvEmote;

export function findEmotesInText(text: string, emotes: Emote[] = Simulation.data.emotes): Emote[] {
  const result: Emote[] = [];

  emotes.forEach((emote) => {
    const name = emote.name;

    let searchIndex = 0;
    let start = 0;

    while (searchIndex < text.length) {
      const index = text.indexOf(name, start);

      if (index === -1) break;

      const before = index > 0 ? text[index - 1] : ' ';
      const after = index + name.length < text.length ? text[index + name.length] : ' ';

      if (/\s/.test(before) && /\s/.test(after)) {
        result.push({ ...emote, start: index, end: index + name.length });
      }

      start = index + 1;
    }
  });

  return result.sort((a, b) => a.start - b.start);
}

export function replaceEmotesWithHTML(text: string, emotes: Emote[]): string {
  if (!emotes.length) return text;

  let result = '';
  let index = 0;

  emotes.forEach((emote) => {
    result += text.substring(index, emote.start);

    const imgUrl = emote.urls['4'] || emote.urls['2'] || emote.urls['1'];

    result += `<img src="${imgUrl}" alt="${emote.name}" class="emote" style="width: auto; height: 1em; vertical-align: middle;" />`;

    index = emote.end;
  });

  result += text.substring(index);

  return result;
}

type TwitchResult = {
  keys: TwitchBadgesKeys[];
  badges: TwitchBadge[];
};

type YouTubeResult = {
  isVerified: boolean;
  isChatOwner: boolean;
  isChatSponsor: boolean;
  isChatModerator: boolean;
};

export type BadgeOptions =
  | TwitchBadgesKeys[]
  | TwitchBadgesKeys
  | `${TwitchBadgesKeys}, ${TwitchBadgesKeys}`
  | `${TwitchBadgesKeys}, ${TwitchBadgesKeys}, ${TwitchBadgesKeys}`;

export async function generateBadges(badges: BadgeOptions, provider: 'youtube'): Promise<YouTubeResult>;
export async function generateBadges(badges: BadgeOptions, provider: 'twitch'): Promise<TwitchResult>;
export async function generateBadges(badges: BadgeOptions = [], provider: Provider = 'twitch'): Promise<TwitchResult | YouTubeResult> {
  if (!Array.isArray(badges) && typeof badges === 'string') {
    badges = badges.split(',').map((e) => e.trim()) as TwitchBadgesKeys[];
  }

  if (!badges || !badges.length) {
    var max = Simulation.rand.number(1, 3);

    for await (const _ of Array.from({ length: max }, () => '')) {
      var current = Simulation.rand.array(Object.keys(Simulation.data.badges))[0] as TwitchBadgesKeys;

      if (!badges.includes(current) && Array.isArray(badges)) {
        badges.push(current);
      } else {
        badges = [current];
      }
    }
  }

  var result;

  switch (provider) {
    case 'twitch': {
      result = {
        keys: Array.from(badges).filter((e) => e in Simulation.data.badges) as TwitchBadgesKeys[],
        badges: Array.from(badges)
          .slice(0, 3)
          .map((badge) => Simulation.data.badges[badge])
          .filter(Boolean) as TwitchBadge[],
      };

      break;
    }

    case 'youtube': {
      var details = {
        'verified': { isVerified: false },
        'broadcaster': { isChatOwner: false },
        'host': { isChatOwner: false },
        'sponsor': { isChatSponsor: false },
        'subscriber': { isChatSponsor: false },
        'moderator': { isChatModerator: false },
      };

      result = Object.entries(badges).reduce(
        (acc, [key]) => {
          if (key in details) {
            Object.assign(acc, details[key as keyof typeof details]);
          }

          return acc;
        },
        {
          isVerified: false,
          isChatOwner: false,
          isChatSponsor: false,
          isChatModerator: false,
        } as {
          isVerified: boolean;
          isChatOwner: boolean;
          isChatSponsor: boolean;
          isChatModerator: boolean;
        },
      );

      break;
    }
  }

  return result as TwitchResult | YouTubeResult;
}
