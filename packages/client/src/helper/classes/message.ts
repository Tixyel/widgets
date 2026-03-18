import { Data } from '../../data/index.js';
import { Emote, Provider, Twitch } from '../../types.js';
import { NumberHelper } from './number.js';
import { RandomHelper } from './random.js';

export type BadgeOptions =
  | Twitch.tags[]
  | Twitch.tags
  | `${Twitch.tags}/${string}`
  | `${Twitch.tags}/${string}`[];

export type TwitchResult = {
  keys: Twitch.tags[];
  badges: Twitch.badge[];
  versions: { [K in Twitch.tags]?: string | number };
  amount: { [K in Twitch.tags]?: string | number };
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

  mapGlobalBadgeVersions(globalBadges: Twitch.GlobalBadge[] = Data.badges): Array<{
    id: Twitch.tags;
    versions: Twitch.badge[];
  }> {
    return globalBadges.map((badge) => ({
      id: badge.set_id,
      versions: badge.versions.map((version) => ({
        type: badge.set_id,
        version: version.id,
        url: version.image_url_4x,
        description: version.title,
      })),
    }));
  }

  mapGlobalBadgeVersionAmount(type: Twitch.tags, variation: string | number): string {
    const IdToId = (key: Twitch.tags) =>
      Data.badges
        .find((b) => b.set_id === key)!
        .versions.map((v) => [v.id, parseInt(v.id)] as [string, number]);

    let result = '0';

    switch (type) {
      case 'subscriber': {
        if (isNaN(parseInt(variation as string))) return result;

        const map = Object.entries({
          '0': 0,
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 6,
          '5': 9,
          '6': 12,
        });

        for (const [key, minAmount] of map) {
          if (parseInt(variation as string) >= minAmount) result = key;
        }

        break;
      }
      case 'bits':
      case 'sub-gifter':
      case 'bits-leader':
      case 'clips-leader':
      case 'sub-gift-leader': {
        if (isNaN(parseInt(variation as string))) return result;

        const map = IdToId(type);

        for (const [key, minAmount] of map) {
          if (parseInt(variation as string) >= minAmount) result = key;
        }

        break;
      }
      case 'warcraft': {
        const map = {
          horde: 'horde',
          alliance: 'alliance',
        };

        result =
          Object.entries(map).find(
            ([_, label]) => label.toLowerCase() === String(variation).toLowerCase(),
          )?.[0] || '0';

        break;
      }
      case 'twitchbot': {
        const map = {
          1: 'auto mod',
          2: 'automated moderation system',
        };

        result =
          Object.entries(map).find(
            ([_, label]) => label.toLowerCase() === String(variation).toLowerCase(),
          )?.[0] || '0';
        break;
      }
      case 'moments': {
        if (isNaN(parseInt(variation as string))) {
          const map = Object.fromEntries(
            Array.from({ length: 20 }, (_, i) => i + 1).map((num) => [num, `tier ${num}`]),
          );

          result =
            Object.entries(map).find(
              ([_, label]) => label.toLowerCase() === String(variation).toLowerCase(),
            )?.[0] || '0';
        } else {
          const map = IdToId('moments');

          for (const [key, minAmount] of map) {
            if (parseInt(variation as string) >= minAmount) result = key;
          }
        }

        break;
      }
      case 'power-rangers': {
        if (isNaN(parseInt(variation as string))) {
          const map = {
            0: ['black ranger', 'black', 'blackranger'],
            1: ['blue ranger', 'blue', 'blueranger'],
            2: ['green ranger', 'green', 'greenranger'],
            3: ['pink ranger', 'pink', 'pinkranger'],
            4: ['red ranger', 'red', 'redranger'],
            5: ['white ranger', 'white', 'whiteranger'],
            6: ['yellow ranger', 'yellow', 'yellowranger'],
          };

          result =
            Object.entries(map).find(([_, labels]) =>
              labels.some((label) => label.toLowerCase() === String(variation).toLowerCase()),
            )?.[0] || '0';
        } else {
          const map = IdToId('power-rangers');

          for (const [key, minAmount] of map) {
            if (parseInt(variation as string) >= minAmount) result = key;
          }
        }

        break;
      }
      case 'predictions': {
        const map = Object.fromEntries(
          IdToId('predictions').map(([key, _]) => [
            key,
            [key, key.replace('-', ' '), key.replace('-', '')],
          ]),
        );

        result =
          Object.entries(map).find(([_, labels]) =>
            labels.some((label) => label.toLowerCase() === String(variation).toLowerCase()),
          )?.[0] || '0';

        break;
      }
      case 'social-sharing': {
        if (isNaN(parseInt(variation as string))) {
          const map = Object.fromEntries(
            IdToId('social-sharing').map(([key, _]) => [
              key,
              [key + ' views', key.replace('-', '') + ' views'],
            ]),
          );

          result =
            Object.entries(map).find(([_, labels]) =>
              labels.some((label) => label.toLowerCase() === String(variation).toLowerCase()),
            )?.[0] || '0';
        } else {
          const map = {
            1: 100,
            2: 10000,
            3: 100000,
          };

          for (const [key, minAmount] of Object.entries(map)) {
            if (parseInt(variation as string) >= minAmount) result = key;
          }
        }

        break;
      }
    }

    return result;
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
    const globalBadges = this.mapGlobalBadgeVersions();

    if (!Array.isArray(badges) && typeof badges === 'string') {
      badges = badges.split(',').map((e) => e.trim()) as Twitch.tags[];
    }

    var clearedBadges = badges.map((badge) => badge.split('/')[0] as Twitch.tags);

    if (!clearedBadges || !clearedBadges.length) {
      const number = new NumberHelper();
      const random = new RandomHelper();
      var max = number.random(1, 3);

      for await (const _ of Array.from({ length: max }, () => '')) {
        // var current = random.array(Object.keys(Data.badges))[0] as Twitch.roles;
        const item = random.array(globalBadges)[0];

        if (!clearedBadges.includes(item.id) && Array.isArray(clearedBadges)) {
          clearedBadges.push(item.id);
        } else {
          clearedBadges = [item.id];
        }
      }
    }

    var result;

    switch (provider) {
      case 'twitch': {
        const keys = Array.from(clearedBadges).filter((e) =>
          globalBadges.some((badge) => badge.id === e),
        ) as Twitch.tags[];

        const versions = badges.reduce(
          (acc, data) => {
            var [badge, variation = '1'] = data.split('/') as [Twitch.tags, string];

            let value: string | number = variation;

            if (!isNaN(parseInt(value))) value = parseInt(value);
            else if (!value) value = 0;

            acc[badge] = this.mapGlobalBadgeVersionAmount(badge, value);

            return acc;
          },
          {} as { [K in Twitch.tags]?: string | number },
        );

        result = {
          keys,
          versions,
          amount: badges.reduce(
            (acc, data) => {
              var [badge, variation = '1'] = data.split('/') as [Twitch.tags, string];

              let value: string | number = variation;

              if (!isNaN(parseInt(value))) value = parseInt(value);
              else if (!value) value = 0;

              acc[badge] = value;

              return acc;
            },
            {} as { [K in Twitch.tags]?: string | number },
          ),
          badges: Array.from(clearedBadges)
            .slice(0, 3)
            .map((badge) => {
              const data = globalBadges.find((b) => b.id === badge);

              if (data?.versions && data.versions.length) {
                const quantity = versions[badge];

                const version = data.versions.find((v) => v.version === String(quantity));

                if (version) return version;

                return data.versions[0];
              }

              return;
            })
            .filter(Boolean) as Twitch.badge[],
        };

        break;
      }

      case 'youtube': {
        var details = {
          'verified': { isVerified: true },
          'partner': { isVerified: true },
          'broadcaster': { isChatOwner: true },
          'host': { isChatOwner: true },
          'sponsor': { isChatSponsor: true },
          'subscriber': { isChatSponsor: true },
          'moderator': { isChatModerator: true },
        };

        result = Object.values(clearedBadges).reduce(
          (acc, key) => {
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
