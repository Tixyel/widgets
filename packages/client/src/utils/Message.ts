import { BttvEmote, SeventvEmote, TwitchEmote } from '../types/emote.js';
import { Simulation } from '../simulation/simulation.js';
import { Provider } from '../types/client.js';
import { Twitch } from '../types/twitch.js';

export type Emote = TwitchEmote | BttvEmote | SeventvEmote;

/**
 * Finds emotes in a given text.
 * @param text - The text to search for emotes.
 * @param emotes - An array of emotes to search for. Defaults to Simulation data emotes.
 * @returns An array of emotes found in the text with their positions.
 */
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

/**
 * Replaces emotes in the text with corresponding HTML image tags.
 * @param text - The text containing emotes.
 * @param emotes - An array of emotes with their positions in the text.
 * @returns The text with emotes replaced by HTML image tags.
 */
export function replaceEmotesWithHTML(text: string, emotes: Emote[]): string {
  if (!emotes.length) return text;

  let result = '';
  let index = 0;

  emotes.forEach((emote) => {
    result += text.substring(index, emote.start);

    const emotesArray = Array.from({ ...emote.urls, length: 5 })
      .slice(1)
      .reverse()
      .filter(Boolean);

    const imgUrl = emotesArray[0] || emote.urls['1'];

    result += `<img src="${imgUrl}" alt="${emote.name}" class="emote" style="width: auto; height: 1em; vertical-align: middle;" />`;

    index = emote.end;
  });

  result += text.substring(index);

  return result;
}

export function replaceYoutubeEmotesWithHTML(text: string, emotes = Simulation.data.youtube_emotes): string {
  const emoteCodesInside = Array.from(text.matchAll(/:(.*?):/gim), (x) => x[0]);

  emoteCodesInside.forEach((code) => {
    const emote = emotes.find((e) => e.shortcuts.includes(code) || e.searchTerms.includes(code.slice(1, -1)));

    if (emote) {
      const url = emote.image.thumbnails.at(-1)?.url;
      const alt = emote.image.accessibility.accessibilityData.label;

      if (url) {
        text = text.replace(code, `<img src="${url}" alt="${alt}" class="emote" style="width: auto; height: 1em; vertical-align: middle;" />`);
      }
    }
  });

  return text;
}

type TwitchResult = {
  keys: Twitch.roles[];
  badges: Twitch.badge[];
};

type YouTubeResult = {
  isVerified: boolean;
  isChatOwner: boolean;
  isChatSponsor: boolean;
  isChatModerator: boolean;
};

export type BadgeOptions = Twitch.roles[] | Twitch.roles | `${Twitch.roles}, ${Twitch.roles}` | `${Twitch.roles}, ${Twitch.roles}, ${Twitch.roles}`;

/**
 * Generates badge data based on the provided badges and platform.
 * @param badges - The badges to generate. Can be an array or a comma-separated string.
 * @param provider - The platform provider ('twitch' or 'youtube'). Defaults to 'twitch'.
 * @returns A promise that resolves to the generated badge data.
 * @example
 * ```javascript
 * // Generate Twitch badges
 * const twitchBadges = await generateBadges(['broadcaster', 'moderator'], 'twitch');
 * // Generate YouTube badges
 * const youtubeBadges = await generateBadges('sponsor, moderator', 'youtube');
 * ```
 */
export async function generateBadges(badges: BadgeOptions, provider: 'youtube'): Promise<YouTubeResult>;
export async function generateBadges(badges: BadgeOptions, provider: 'twitch'): Promise<TwitchResult>;
export async function generateBadges(badges: BadgeOptions = [], provider: Provider = 'twitch'): Promise<TwitchResult | YouTubeResult> {
  if (!Array.isArray(badges) && typeof badges === 'string') {
    badges = badges.split(',').map((e) => e.trim()) as Twitch.roles[];
  }

  if (!badges || !badges.length) {
    var max = Simulation.rand.number(1, 3);

    for await (const _ of Array.from({ length: max }, () => '')) {
      var current = Simulation.rand.array(Object.keys(Simulation.data.badges))[0] as Twitch.roles;

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
        keys: Array.from(badges).filter((e) => e in Simulation.data.badges) as Twitch.roles[],
        badges: Array.from(badges)
          .slice(0, 3)
          .map((badge) => Simulation.data.badges[badge])
          .filter(Boolean) as Twitch.badge[],
      };

      break;
    }

    case 'youtube': {
      var details = {
        'verified': { isVerified: true },
        'broadcaster': { isChatOwner: true },
        'host': { isChatOwner: true },
        'sponsor': { isChatSponsor: true },
        'subscriber': { isChatSponsor: true },
        'moderator': { isChatModerator: true },
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
