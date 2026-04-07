import { Data } from '../data/index.js';
import { RandomHelper } from '../helper/classes/random.js';
import { UtilsHelper } from '../helper/classes/utils.js';
import { fakeUserPools } from '../internal.js';
import { Local } from '../local/index.js';
import { StreamElements, Twitch } from '../types.js';
import { EventProvider } from './EventProvider.js';

export class FakeUser {
  public readonly id!: string;
  public readonly name!: string;
  public readonly login!: string;

  public badges: Twitch.tags[] = [];
  public isSubscriber: boolean = false;
  public tier?: StreamElements.Event.Provider.Twitch.SubscriberTier;

  constructor(
    id: string,
    name: string,
    badges: Twitch.tags[] = [],
    isSubscriber: boolean = false,
    tier?: StreamElements.Event.Provider.Twitch.SubscriberTier,
  ) {
    this.id = id;
    this.name = name;
    this.login = name.toLocaleLowerCase();
    this.badges = badges;
    this.isSubscriber = isSubscriber;
    this.tier = tier;
  }
}

export interface FakeUserPoolOptions {
  id?: string;
  names?: string[];
  badges?: Twitch.tags[];
  minimumBadgesPerUser?: number;
  limits?: {
    [key in Twitch.tags]?: number;
  };
  fixed?: {
    [key in Twitch.tags]?: string | string[];
  };
  incompatible?: {
    [key in Twitch.tags]?: Twitch.tags | Twitch.tags[];
  };
}

type FakeUserPoolEvents = {
  'warn': [warning: Error];
};

export const defaultIncompatibleBadges: FakeUserPoolOptions['incompatible'] = {
  'broadcaster': ['moderator', 'vip', 'artist-badge'],
  'moderator': ['lead_moderator'],
  'no_video': ['no_audio'],
  '60-seconds_1': ['60-seconds_2', '60-seconds_3'],
  'duelyst_1': ['duelyst_2', 'duelyst_3', 'duelyst_4', 'duelyst_5', 'duelyst_6', 'duelyst_7'],
};

export const MAX_BADGES_PER_USER = 3;

export class FakeUserPool extends EventProvider<FakeUserPoolEvents> {
  public readonly users: FakeUser[] = [];
  public readonly id: string;

  private readonly byId: Map<string, FakeUser> = new Map();
  private readonly byName: Map<string, FakeUser> = new Map();
  private readonly byBadge: Map<Twitch.tags, FakeUser[]> = new Map();

  private static fixUser(user: string | FakeUser): string {
    if (typeof user === 'string') return user.trim().replace(/^@+/, '').toLocaleLowerCase();

    return FakeUserPool.fixUser(user.name);
  }

  private static getRandomSubTier(): StreamElements.Event.Provider.Twitch.SubscriberTier {
    const utils = new UtilsHelper();

    return (
      utils.probability({
        'prime': 0.4,
        '1000': 0.3,
        '2000': 0.2,
        '3000': 0.1,
      } as {
        [key in StreamElements.Event.Provider.Twitch.SubscriberTier]: number;
      }) ?? 'prime'
    );
  }

  constructor(options?: FakeUserPoolOptions) {
    super();

    this.id = options?.id || `fake_user_pool_${Math.random().toString(36).slice(2, 10)}`;

    this.users = this.start(options?.names || Data.names, options?.badges, options);
    this.byId = new Map(this.users.map((user) => [user.id, user]));
    this.byName = new Map(this.users.map((user) => [user.login, user]));
    this.byBadge = new Map(
      this.users.reduce((acc, user) => {
        for (const badge of user.badges) {
          const existing = acc.get(badge) ?? [];
          acc.set(badge, [...existing, user]);
        }
        return acc;
      }, new Map<Twitch.tags, FakeUser[]>()),
    );

    fakeUserPools.push(this);
  }

  private start(
    names: string[],
    badges: Twitch.tags[] = Data.badges.map((e) => e.set_id) as Twitch.tags[],
    options?: Omit<FakeUserPoolOptions, 'badges'>,
  ): FakeUser[] {
    const normalizedNames = names
      .map((name) => name && FakeUserPool.fixUser(name))
      .filter((name) => name && name.length)
      // remove duplicates
      .filter((name, index, self) => self.indexOf(name) === index);

    const badgePool = badges.filter((badge, index, self) => self.indexOf(badge) === index);

    if (!badgePool.length || !normalizedNames.length) {
      return [];
    }

    const users: FakeUser[] = [];
    const minimumBadgesPerUser =
      typeof options?.minimumBadgesPerUser === 'number' && options.minimumBadgesPerUser >= 0
        ? Math.floor(options.minimumBadgesPerUser)
        : 1;
    const targetBadgesPerUser = Math.min(minimumBadgesPerUser, MAX_BADGES_PER_USER);
    const limits = options?.limits ?? {};
    const fixed = options?.fixed ?? {};
    const badgeSet = new Set(badgePool);
    const usage = new Map<Twitch.tags, number>();
    const fixedNameToBadges = new Map<string, Twitch.tags[]>();
    const remainingFixedDemand = new Map<Twitch.tags, number>();
    const incompatibleBadges = new Map<Twitch.tags, Set<Twitch.tags>>();
    let badgeCursor = 0;

    const getLimit = (badge: Twitch.tags): number => {
      const value = limits[badge];

      return typeof value === 'number' && value > 0 ? value : Number.POSITIVE_INFINITY;
    };

    const registerBadgeUsage = (badge: Twitch.tags): void => {
      const current = usage.get(badge) ?? 0;
      usage.set(badge, current + 1);
    };

    const decrementFixedDemand = (badge: Twitch.tags): void => {
      const current = remainingFixedDemand.get(badge) ?? 0;

      if (current <= 1) {
        remainingFixedDemand.delete(badge);
        return;
      }

      remainingFixedDemand.set(badge, current - 1);
    };

    const normalizeUserNames = (value: string | string[] | undefined): string[] => {
      if (!value) return [];

      if (typeof value === 'string') {
        return [FakeUserPool.fixUser(value)].filter((name): name is string => Boolean(name));
      }

      if (Array.isArray(value)) {
        return value.map(FakeUserPool.fixUser).filter((name): name is string => Boolean(name));
      }

      return [];
    };

    const normalizeBadges = (value: Twitch.tags | Twitch.tags[] | undefined): Twitch.tags[] => {
      if (!value) {
        return [];
      }

      if (Array.isArray(value)) {
        return value;
      }

      return [value];
    };

    const mergeIncompatibleBadges = (
      base: FakeUserPoolOptions['incompatible'],
      extra: FakeUserPoolOptions['incompatible'],
    ): Map<Twitch.tags, Twitch.tags[]> => {
      const merged = new Map<Twitch.tags, Twitch.tags[]>();

      for (const source of [base, extra]) {
        for (const [badge, value] of Object.entries(source ?? {}) as Array<
          [Twitch.tags, Twitch.tags | Twitch.tags[] | undefined]
        >) {
          const existing = merged.get(badge) ?? [];
          const nextValues = normalizeBadges(value);

          merged.set(badge, [...new Set([...existing, ...nextValues])]);
        }
      }

      return merged;
    };

    const registerIncompatiblePair = (left: Twitch.tags, right: Twitch.tags): void => {
      if (left === right) {
        return;
      }

      const leftSet = incompatibleBadges.get(left) ?? new Set<Twitch.tags>();
      leftSet.add(right);
      incompatibleBadges.set(left, leftSet);

      const rightSet = incompatibleBadges.get(right) ?? new Set<Twitch.tags>();
      rightSet.add(left);
      incompatibleBadges.set(right, rightSet);
    };

    const isCompatibleWithAssignedBadges = (
      badge: Twitch.tags,
      assignedBadges: Twitch.tags[],
    ): boolean => {
      if (assignedBadges.includes(badge)) {
        return false;
      }

      return assignedBadges.every((assignedBadge) => {
        const conflicts = incompatibleBadges.get(assignedBadge);

        return !conflicts?.has(badge);
      });
    };

    const canUseBadgeForExtras = (badge: Twitch.tags, assignedBadges: Twitch.tags[]): boolean => {
      if (!isCompatibleWithAssignedBadges(badge, assignedBadges)) {
        return false;
      }

      const max = getLimit(badge);
      const current = usage.get(badge) ?? 0;
      const reserved = remainingFixedDemand.get(badge) ?? 0;

      return current < max && current + reserved < max;
    };

    const canUseBadgeForFixed = (badge: Twitch.tags, assignedBadges: Twitch.tags[]): boolean => {
      if (!isCompatibleWithAssignedBadges(badge, assignedBadges)) {
        return false;
      }

      const max = getLimit(badge);
      const current = usage.get(badge) ?? 0;

      return current < max;
    };

    const nextAvailableBadge = (assignedBadges: Twitch.tags[]): Twitch.tags | null => {
      for (let step = 0; step < badgePool.length; step++) {
        const badge = badgePool[(badgeCursor + step) % badgePool.length];

        if (canUseBadgeForExtras(badge, assignedBadges)) {
          badgeCursor = (badgeCursor + step + 1) % badgePool.length;
          return badge;
        }
      }

      return null;
    };

    for (const [badge, value] of mergeIncompatibleBadges(
      defaultIncompatibleBadges,
      options?.incompatible,
    )) {
      if (!badgeSet.has(badge)) {
        continue;
      }

      for (const conflictingBadge of normalizeBadges(value)) {
        if (!badgeSet.has(conflictingBadge)) {
          continue;
        }

        registerIncompatiblePair(badge, conflictingBadge);
      }
    }

    for (const badge of badgePool) {
      const namesForBadge = normalizeUserNames(fixed[badge]);

      for (const fixedName of namesForBadge) {
        const existingBadges = fixedNameToBadges.get(fixedName) ?? [];

        if (!existingBadges.includes(badge)) {
          fixedNameToBadges.set(fixedName, [...existingBadges, badge]);
        }
      }
    }

    for (const [badge, value] of Object.entries(fixed) as Array<
      [Twitch.tags, string | string[] | undefined]
    >) {
      if (badgeSet.has(badge)) {
        continue;
      }

      const namesForBadge = normalizeUserNames(value);

      if (namesForBadge.length) {
        this.emit(
          'warn',
          new Error(`Fixed badge "${badge}" is not available in the current badge pool`),
        );
      }
    }

    const resolvedFixedBadges = new Map<string, Twitch.tags[]>();

    if (minimumBadgesPerUser > MAX_BADGES_PER_USER) {
      this.emit(
        'warn',
        new Error(
          `minimumBadgesPerUser exceeds the maximum of ${MAX_BADGES_PER_USER} and was clamped`,
        ),
      );
    }

    for (const name of normalizedNames) {
      const badgesForName = fixedNameToBadges.get(name) ?? [];
      const selectedFixedBadges: Twitch.tags[] = [];

      for (const badge of badgesForName) {
        if (selectedFixedBadges.length >= MAX_BADGES_PER_USER) {
          this.emit(
            'warn',
            new Error(
              `User "${name}" has more than ${MAX_BADGES_PER_USER} fixed badges; extra badges were ignored`,
            ),
          );
          break;
        }

        if (!isCompatibleWithAssignedBadges(badge, selectedFixedBadges)) {
          this.emit(
            'warn',
            new Error(
              `Fixed badge "${badge}" for user "${name}" conflicts with another fixed badge and was ignored`,
            ),
          );
          continue;
        }

        selectedFixedBadges.push(badge);
      }

      resolvedFixedBadges.set(name, selectedFixedBadges);

      for (const badge of selectedFixedBadges) {
        remainingFixedDemand.set(badge, (remainingFixedDemand.get(badge) ?? 0) + 1);
      }
    }

    for (const name of normalizedNames) {
      const selectedBadges: Twitch.tags[] = [];
      const fixedBadgesForUser = resolvedFixedBadges.get(name) ?? [];

      for (const fixedBadge of fixedBadgesForUser) {
        decrementFixedDemand(fixedBadge);

        if (!canUseBadgeForFixed(fixedBadge, selectedBadges)) {
          this.emit(
            'warn',
            new Error(
              `Fixed badge "${fixedBadge}" for user "${name}" could not be assigned because its limit was reached`,
            ),
          );
          continue;
        }

        selectedBadges.push(fixedBadge);
        registerBadgeUsage(fixedBadge);
      }

      while (selectedBadges.length < targetBadgesPerUser) {
        const nextBadge = nextAvailableBadge(selectedBadges);

        if (!nextBadge) {
          break;
        }

        selectedBadges.push(nextBadge);
        registerBadgeUsage(nextBadge);
      }

      if (!selectedBadges.length) {
        this.emit('warn', new Error('Not enough badges to assign to users'));
        continue;
      }

      if (selectedBadges.length < targetBadgesPerUser) {
        this.emit(
          'warn',
          new Error(
            `User "${name}" could only receive ${selectedBadges.length} badge(s), below the configured minimum of ${targetBadgesPerUser}`,
          ),
        );
      }

      const userIndex = users.length + 1;
      const isSubscriber = selectedBadges.some((badge) =>
        ['subscriber'].includes(String(badge).toLocaleLowerCase()),
      );

      const user = new FakeUser(
        `fake_user_${userIndex.toString().padStart(2, '0')}_${Math.random().toString(36).slice(2, 8)}+${this.id}`,
        name,
        selectedBadges,
        isSubscriber,
        isSubscriber ? FakeUserPool.getRandomSubTier() : undefined,
      );

      users.push(user);
    }

    if (users.length < normalizedNames.length) {
      this.emit(
        'warn',
        new Error(
          'Some users could not be assigned badges due to limits. Consider increasing limits or adding more badges.',
        ),
      );
    }

    return users;
  }

  public pick(): FakeUser | null {
    if (!this.users.length) {
      return null;
    }

    return new RandomHelper().array(this.users)[0];
  }

  public getByName(name: string): FakeUser | null {
    const key = FakeUserPool.fixUser(name);
    return this.byName.get(key) ?? null;
  }

  public getById(id: string): FakeUser | null {
    return this.byId.get(id) ?? null;
  }

  public getByBadge(badge: Twitch.tags): FakeUser[] {
    return this.byBadge.get(badge) ?? [];
  }

  public getToReply(
    target: { id?: string; name?: string },
    extend?: Partial<Twitch.Reply>,
  ): Twitch.Reply | null {
    let user: FakeUser | null = null;

    if (target?.id) {
      user = this.getById(target.id);
    }

    if (!user && target?.name) {
      user = this.getByName(target.name);
    }

    if (!user) {
      return null;
    }

    return {
      msgId: `fake_msg_${Math.random().toString(36).slice(2, 10)}`,
      userId: user.id,
      userLogin: user.login,
      displayName: user.name,
      msgBody: `This is a fake reply from ${user.name}`,
      ...extend,
    };
  }

  public buildTwitchMessage(
    messages: string[] = Data.twitch_messages,
  ): Parameters<(typeof Local)['emulate']['twitch']['message']>[0] {
    const user = this.pick();

    if (!user) {
      this.emit('warn', new Error('No users available to build a Twitch message'));
      return;
    }

    return {
      userId: user.id,
      name: user.name,
      badges: user.badges,
      message: new RandomHelper().array(messages)[0],
    };
  }

  public buildYouTubeMessage(
    messages: string[] = Data.youtube_messages,
  ): Parameters<(typeof Local)['emulate']['youtube']['message']>[0] {
    const user = this.pick();

    if (!user) {
      this.emit('warn', new Error('No users available to build a YouTube message'));
      return;
    }

    return {
      userId: user.id,
      name: user.name,
      badges: user.badges,
      message: new RandomHelper().array(messages)[0],
    };
  }
}
