import { fakeUserPools } from '../../modules/fakeUser.js';
import { RequireAtLeastOne, StreamElements, Twitch } from '../../types.js';
import { EventHelper } from './event.js';

export class UtilsHelper {
  /**
   * Delays execution for a specified number of milliseconds.
   * @param ms - The number of milliseconds to delay.
   * @returns A Promise that resolves after the specified delay.
   */
  delay<R extends any, M extends number>(ms: M, callback?: () => R): Promise<R | null> {
    return new Promise((resolve) =>
      setTimeout(() => {
        if (callback) {
          const result = callback();
          resolve(result ?? null);
        } else resolve(null);
      }, ms),
    );
  }

  /**
   * Returns typed entries of an object.
   * @param obj - The object to get entries from.
   * @returns An array of key-value pairs from the object.
   */
  typedEntries<K extends string, V>(obj: Record<K, V> | Array<V>): [K, V][] {
    return Object.entries(obj) as [K, V][];
  }

  /**
   * Returns typed values of an object.
   * @param obj - The object to get values from.
   * @returns An array of values from the object.
   */
  typedValues<K extends string, V>(obj: Record<K, V> | Array<V>): V[] {
    return Object.values(obj) as V[];
  }

  /**
   * Returns typed keys of an object.
   * @param obj - The object to get keys from.
   * @returns An array of keys from the object.
   */
  typedKeys<K extends string, V>(obj: Record<K, V> | Array<V>): K[] {
    return Object.keys(obj) as K[];
  }

  /**
   * Compares two dates and returns the difference in multiple time units.
   *
   * `total` values are based on raw milliseconds (can be decimal).
   * `calendar` values use calendar boundaries for full months/years.
   */
  compareDates(date1: Date | string, date2: Date | string) {
    const d1 = date1 instanceof Date ? new Date(date1.getTime()) : new Date(date1);
    const d2 = date2 instanceof Date ? new Date(date2.getTime()) : new Date(date2);

    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
      throw new Error('Invalid date provided to compareDates');
    }

    const milliseconds = d2.getTime() - d1.getTime();
    const absMilliseconds = Math.abs(milliseconds);

    const totalSeconds = milliseconds / 1000;
    const totalMinutes = milliseconds / (1000 * 60);
    const totalHours = milliseconds / (1000 * 60 * 60);
    const totalDays = milliseconds / (1000 * 60 * 60 * 24);
    const totalMonths = totalDays / 30.436875;
    const totalYears = totalDays / 365.2425;

    const from = d1 <= d2 ? d1 : d2;
    const to = d1 <= d2 ? d2 : d1;
    let calendarMonths =
      (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

    const anchor = new Date(from);
    anchor.setMonth(anchor.getMonth() + calendarMonths);

    if (anchor > to) {
      calendarMonths -= 1;
    }

    const sign = milliseconds < 0 ? -1 : 1;
    const signedCalendarMonths = calendarMonths * sign;
    const signedCalendarYears = (calendarMonths / 12) * sign;

    return {
      milliseconds,
      seconds: totalSeconds,
      minutes: totalMinutes,
      hours: totalHours,
      days: totalDays,
      months: totalMonths,
      years: totalYears,
      absolute: {
        milliseconds: absMilliseconds,
        seconds: absMilliseconds / 1000,
        minutes: absMilliseconds / (1000 * 60),
        hours: absMilliseconds / (1000 * 60 * 60),
        days: absMilliseconds / (1000 * 60 * 60 * 24),
        months: absMilliseconds / (1000 * 60 * 60 * 24 * 30.436875),
        years: absMilliseconds / (1000 * 60 * 60 * 24 * 365.2425),
      },
      calendar: {
        months: signedCalendarMonths,
        years: signedCalendarYears,
      },
      isFuture: milliseconds > 0,
      isPast: milliseconds < 0,
      isSameMoment: milliseconds === 0,
    };
  }

  /**
   * Selects an item based on weighted probabilities.
   * @param items - An object where keys are items and values are their weights.
   * @returns A randomly selected item based on the given probabilities.
   * @example
   * ```ts
   * const utils = new UtilsHelper();
   * const result = utils.probability({
   *   apple: 0.5,
   *   banana: 0.3,
   *   cherry: 0.2,
   * });
   * console.log(result); // 'apple', 'banana', or 'cherry' based on the defined probabilities
   * ```
   */
  probability<K extends string, V extends number>(items: Record<K, V>): K | undefined {
    const total = (Object.values(items) as number[]).reduce((acc, val) => acc + val, 0);
    const sorted = this.typedEntries(items).sort((a, b) => b[1] - a[1]);
    const rand = Math.random() * total;

    let cumulative = 0;

    for (const [item, weight] of sorted) {
      cumulative += weight;

      if (rand < cumulative) {
        return item;
      }
    }

    return undefined;
  }

  /**
   * Finds the subscription tier of a user based on various sources of information.
   * @param data - An object containing userId, name, and broadcasterId to identify the user.
   * @param session - The current session data which may contain recent subscription information.
   * @param checkWithAPI - Whether to check the subscription tier with an external API as a last resort.
   * @returns A promise that resolves to the subscription tier of the user (1, 2, or 3).
   * @example
   * ```javascript
   * const utils = new UtilsHelper();
   * const tier = await utils.findSubscriptionTier(
   *   { userId: '12345', name: 'exampleUser', broadcasterId: '67890' },
   *   sessionData,
   *   true
   * );
   * console.log(tier); // 1, 2, or 3 based on the user's subscription tier
   * ```
   */
  async findSubscriptionTier(
    {
      userId,
      name,
      broadcasterId,
    }: {
      userId: string;
      name: string;
      broadcasterId?: string;
    },
    session: StreamElements.Session.Data,
    checkWithAPI: boolean = false,
  ) {
    const convert = (tier?: string | number) => {
      if (tier === 'prime') return 1;
      else if (tier === '1000' || tier === 1000 || tier === 1 || tier === '1') return 1;
      else if (tier === '2000' || tier === 2000 || tier === 2 || tier === '2') return 2;
      else if (tier === '3000' || tier === 3000 || tier === 3 || tier === '3') return 3;
      else return 1;
    };

    // If it's a fake user, get the tier from the fake user pool
    if (userId?.includes('fake_user_')) {
      const pool = fakeUserPools.find((p) => userId.endsWith(`+${p.id}`));

      if (pool) {
        const user = pool.getById(userId);

        if (user) return convert(user.tier);
      }
    }

    // Check the recent subscriptions
    const recentSubscriptions = session['subscriber-recent'];

    if (recentSubscriptions) {
      const subscriber = recentSubscriptions.find((sub) => sub.name === name);

      if (subscriber) return convert(subscriber.tier);
    }

    // Check the latest subscriber

    const latestSubscriber = session['subscriber-latest'];

    if (latestSubscriber.name === name) {
      return convert(latestSubscriber.tier);
    }

    // Check gifts

    const latestGift = session['subscriber-gifted-latest'];

    if (latestGift.name === name) {
      return convert(latestGift.tier);
    }

    // Last try, check with my API
    if (checkWithAPI) {
      if (
        broadcasterId?.length &&
        userId?.length &&
        !broadcasterId.includes('fake_user_') &&
        !userId.includes('fake_user_')
      ) {
        const result = await fetch(
          `https://api.tixyel.com/v1/twitch/channel/subscriber/${broadcasterId}/${userId}`,
        )
          .then(async (res) =>
            res.status == 200
              ? res.json()
              : Promise.reject(
                  new Error(
                    `Failed to fetch subscription data: ${res.status} ${res.statusText} ${await res.text()}`,
                  ),
                ),
          )
          .then(
            (data: {
              broadcaster: { id: string; name: string; displayName: string };
              isGift: boolean;
              tier: string;
            }) => {
              return data?.tier;
            },
          )
          .catch(() => 1);

        if (result) return convert(result);
      }
    }

    return 1;
  }

  /**
   * Identifies a user based on the received event and session data, returning their ID, name, role, badges, and top status.
   * @param receivedEvent - The event received from the provider (Twitch or YouTube) containing user information.
   * @param session - The current session data which may contain recent activity and top user information.
   * @returns A promise that resolves to an object containing the user's ID, name, role, badges, and top status, or undefined if the user cannot be identified.
   * @example
   * ```javascript
   * const utils = new UtilsHelper();
   * const userInfo = await utils.identifyUser(receivedEvent, sessionData);
   * console.log(userInfo);
   * // {
   * //   id: '12345',
   * //   name: 'exampleUser',
   * //   role: 'moderator',
   * //   badges: [{ type: 'moderator', version: '1', url: 'https:...', description: 'Moderator' }],
   * //   top: {
   * //     gifter: false,
   * //     tip: {
   * //       session: { donator: false, donation: false },
   * //       weekly: { donator: false, donation: false },
   * //       monthly: { donator: false, donation: false },
   * //       alltime: { donator: false, donation: false },
   * //     },
   * //     ...
   * //   }
   * // }
   * ```
   */
  async identifyUser(
    provider: 'twitch',
    receivedEvent: StreamElements.Event.Provider.Twitch.Message,
    session: StreamElements.Session.Data,
  ): Promise<IdentifyTwitchResult | undefined>;
  async identifyUser(
    provider: 'youtube',
    receivedEvent: StreamElements.Event.Provider.YouTube.Message,
    session: StreamElements.Session.Data,
  ): Promise<IdentifyYouTubeResult | undefined>;
  async identifyUser(
    provider: 'twitch' | 'youtube',
    receivedEvent:
      | StreamElements.Event.Provider.Twitch.Message
      | StreamElements.Event.Provider.YouTube.Message,
    session: StreamElements.Session.Data,
  ): Promise<IdentifyYouTubeResult | IdentifyTwitchResult | undefined> {
    const getTops = (name: string): TopType => ({
      gifter: session['subscriber-alltime-gifter'].name === name,
      tip: {
        session: {
          donator: session['tip-session-top-donator'].name === name,
          donation: session['tip-session-top-donation'].name === name,
        },
        weekly: {
          donator: session['tip-weekly-top-donator'].name === name,
          donation: session['tip-weekly-top-donation'].name === name,
        },
        monthly: {
          donator: session['tip-monthly-top-donator'].name === name,
          donation: session['tip-monthly-top-donation'].name === name,
        },
        alltime: {
          donator: session['tip-alltime-top-donator'].name === name,
          donation: session['tip-alltime-top-donation'].name === name,
        },
      },
      cheer: {
        session: {
          donator: session['cheer-session-top-donator'].name === name,
          amount: session['cheer-session-top-donation'].name === name,
        },
        weekly: {
          donator: session['cheer-weekly-top-donator'].name === name,
          amount: session['cheer-weekly-top-donation'].name === name,
        },
        monthly: {
          donator: session['cheer-monthly-top-donator'].name === name,
          amount: session['cheer-monthly-top-donation'].name === name,
        },
        alltime: {
          donator: session['cheer-alltime-top-donator'].name === name,
          amount: session['cheer-alltime-top-donation'].name === name,
        },
      },
      superchat: {
        session: {
          donator: session['superchat-session-top-donator'].name === name,
          amount: session['superchat-session-top-donation'].name === name,
        },
        weekly: {
          donator: session['superchat-weekly-top-donator'].name === name,
          amount: session['superchat-weekly-top-donation'].name === name,
        },
        monthly: {
          donator: session['superchat-monthly-top-donator'].name === name,
          amount: session['superchat-monthly-top-donation'].name === name,
        },
        alltime: {
          donator: session['superchat-alltime-top-donator'].name === name,
          amount: session['superchat-alltime-top-donation'].name === name,
        },
      },
    });

    switch (provider) {
      case 'twitch': {
        const twitchEvent = receivedEvent as StreamElements.Event.Provider.Twitch.Message;
        const event = twitchEvent.event;
        const data = event.data;

        const tier = await this.findSubscriptionTier(
          {
            userId: data.userId,
            name: data.displayName,
            broadcasterId: data.tags['room-id'],
          },
          session ?? ({} as StreamElements.Session.Data),
          false,
        );

        return {
          id: data.userId,
          name: data.displayName,
          color: data.displayColor,
          role: data.tags.badges.split(',')[0].split('/')[0] as Twitch.tags,
          tags: data.tags.badges.split(',').map((b: string) => b.split('/')[0] as Twitch.tags),
          badges: data.badges,
          tier: data.tags.badges.includes('subscriber') ? tier : undefined,
          top: getTops(data.displayName),
        } satisfies IdentifyTwitchResult;

        break;
      }
      case 'youtube': {
        const youtubeEvent = receivedEvent as StreamElements.Event.Provider.YouTube.Message;
        const event = youtubeEvent.event;
        const data = event.data;

        const role = data.authorDetails.isChatOwner
          ? 'broadcaster'
          : data.authorDetails.isChatModerator
            ? 'moderator'
            : data.authorDetails.isChatSponsor
              ? 'sponsor'
              : data.authorDetails.isVerified
                ? 'verified'
                : 'viewer';

        return {
          id: data.userId,
          name: data.displayName,
          role: role,
          badges: data.badges,
          top: getTops(data.displayName),
        } satisfies IdentifyYouTubeResult;
      }
    }

    return undefined;
  }
}

type TopType = {
  gifter: boolean;
  tip: {
    session: { donator: boolean; donation: boolean };
    weekly: { donator: boolean; donation: boolean };
    monthly: { donator: boolean; donation: boolean };
    alltime: { donator: boolean; donation: boolean };
  };
  cheer: {
    session: { donator: boolean; amount: boolean };
    weekly: { donator: boolean; amount: boolean };
    monthly: { donator: boolean; amount: boolean };
    alltime: { donator: boolean; amount: boolean };
  };
  superchat: {
    session: { donator: boolean; amount: boolean };
    weekly: { donator: boolean; amount: boolean };
    monthly: { donator: boolean; amount: boolean };
    alltime: { donator: boolean; amount: boolean };
  };
};

type IdentifyTwitchResult = {
  id: string;
  name: string;
  color: string;
  role: Twitch.tags;
  tags: Twitch.tags[];
  badges: Twitch.badge[];
  tier?: 1 | 2 | 3;
  top: TopType;
};

type IdentifyYouTubeResult = {
  id: string;
  name: string;
  role: 'broadcaster' | 'moderator' | 'sponsor' | 'verified' | 'viewer';
  badges: unknown[];
  top: TopType;
};
