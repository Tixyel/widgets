import { Data } from '../../data/index.js';
import { Emote, Provider, Twitch } from '../../types.js';
import { NumberHelper } from './number.js';
import { RandomHelper } from './random.js';

export type BadgeOptions =
  | Twitch.roles[]
  | Twitch.roles
  | `${Twitch.roles}/${number}`
  | `${Twitch.roles}/${number}`[];

export type TwitchResult = {
  keys: Twitch.roles[];
  badges: Twitch.badge[];
  amount: {
    [K in Twitch.roles]?: number;
  };
};

export type YouTubeResult = {
  isVerified: boolean;
  isChatOwner: boolean;
  isChatSponsor: boolean;
  isChatModerator: boolean;
};

export class MessageHelper {
  /**
   * Finds emotes in a given text.
   * @param text - The text to search for emotes.
   * @param emotes - An array of emotes to search for. Defaults to Local data emotes.
   * @returns An array of emotes found in the text with their positions.
   */
  findEmotesInText(text: string, emotes: Emote[] = Data.emotes): Emote[] {
    const result: Emote[] = [];

    emotes
      .filter((emote) => emote.type !== 'emoji')
      .forEach((emote) => {
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

    return result;
  }

  /**
   * Replaces emotes in the text with corresponding HTML image tags.
   * @param text - The text containing emotes.
   * @param emotes - An array of emotes with their positions in the text.
   * @returns The text with emotes replaced by HTML image tags.
   */
  replaceEmotesWithHTML(text: string, emotes: Emote[]): string {
    if (!emotes.length) return text;

    let result = '';
    let index = 0;

    emotes
      .filter((emote) => emote.type !== 'emoji')
      .forEach((emote) => {
        if (emote.start < index) return;

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

  /**
   * Checks if the text contains only emotes and whitespace.
   * @param text - The text to check.
   * @param emotes - An array of emotes with their positions in the text.
   * @returns True if the text contains only emotes and whitespace, false otherwise.
   */
  hasOnlyEmotes(text: string, emotes: Emote[]): boolean {
    const textWithoutEmotes = emotes.reduce((acc, emote) => {
      return acc
        .replace(new RegExp(`\\b${emote.name}\\b`, 'g'), '')
        .replace(/<img[^>]*class="emote"[^>]*>/gi, '');
    }, text);

    return textWithoutEmotes.trim().length === 0;
  }

  /**
   * Replaces YouTube emotes in the text with corresponding HTML image tags.
   * @param text - The text containing YouTube emotes.
   * @param emotes - An array of YouTube emotes. Defaults to Local data YouTube emotes.
   * @returns The text with YouTube emotes replaced by HTML image tags.
   */
  replaceYoutubeEmotesWithHTML(text: string, emotes = Data.youtube_emotes): string {
    const emoteCodesInside = Array.from(text.matchAll(/:(.*?):/gim), (x) => x[0]);

    emoteCodesInside.forEach((code) => {
      const emote = emotes.find(
        (e) => e.shortcuts.includes(code) || e.searchTerms.includes(code.slice(1, -1)),
      );

      if (emote) {
        const url = emote.image.thumbnails.at(-1)?.url;
        const alt = emote.image.accessibility.accessibilityData.label;

        if (url) {
          text = text.replace(
            code,
            `<img src="${url}" alt="${alt}" class="emote" style="width: auto; height: 1em; vertical-align: middle;" />`,
          );
        }
      }
    });

    return text;
  }

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
  async generateBadges<T extends Provider>(
    badges: BadgeOptions = [],
    provider: T,
  ): Promise<T extends 'twitch' ? TwitchResult : YouTubeResult> {
    if (!Array.isArray(badges) && typeof badges === 'string') {
      badges = badges.split(',').map((e) => e.trim()) as Twitch.roles[];
    }

    var clearedBadges = badges.map((badge) => badge.split('/')[0] as Twitch.roles);

    if (!clearedBadges || !clearedBadges.length) {
      const number = new NumberHelper();
      const random = new RandomHelper();
      var max = number.random(1, 3);

      for await (const _ of Array.from({ length: max }, () => '')) {
        var current = random.array(Object.keys(Data.badges))[0] as Twitch.roles;

        if (!clearedBadges.includes(current) && Array.isArray(clearedBadges)) {
          clearedBadges.push(current);
        } else {
          clearedBadges = [current];
        }
      }
    }

    var result;

    switch (provider) {
      case 'twitch': {
        result = {
          keys: Array.from(clearedBadges).filter((e) => e in Data.badges) as Twitch.roles[],
          badges: Array.from(clearedBadges)
            .slice(0, 3)
            .map((badge) => Data.badges[badge])
            .filter(Boolean) as Twitch.badge[],
          amount: badges.reduce(
            (acc, data) => {
              var [badge, amount = '1'] = data.split('/') as [Twitch.roles, string];

              if (isNaN(parseInt(amount)) || !amount.length) amount = '1';

              acc[badge] = parseInt(amount) || 1;

              return acc;
            },
            {} as { [K in Twitch.roles]?: number },
          ),
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

        result = Object.entries(clearedBadges).reduce(
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

    return result as T extends 'twitch' ? TwitchResult : YouTubeResult;
  }
}
