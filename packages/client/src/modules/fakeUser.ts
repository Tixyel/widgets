import { Data } from '../data/index.js';
import { RandomHelper } from '../helper/classes/random.js';
import { UtilsHelper } from '../helper/classes/utils.js';
import { Local } from '../local/index.js';
import { StreamElements, Twitch } from '../types.js';
import { EventProvider } from './EventProvider.js';

export class FakeUser {
  public readonly id!: string;
  public readonly name!: string;
  public readonly login!: string;

  public badges: Twitch.GlobalBadgeSetId[] = [];
  public isSubscriber: boolean = false;
  public tier?: StreamElements.Event.Provider.Twitch.SubscriberTier;

  constructor(
    id: string,
    name: string,
    badges: Twitch.GlobalBadgeSetId[] = [],
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
  badges?: Twitch.GlobalBadgeSetId[];
  limits?: {
    [key in Twitch.GlobalBadgeSetId]?: number;
  };
  fixed?: {
    [key in Twitch.GlobalBadgeSetId]?: string[];
  };
}

type FakeUserPoolEvents = {
  'warn': [warning: Error];
};

export const fakeUserPools: FakeUserPool[] = [];

export class FakeUserPool extends EventProvider<FakeUserPoolEvents> {
  public readonly users: FakeUser[] = [];

  private readonly byId: Map<string, FakeUser> = new Map();
  private readonly byName: Map<string, FakeUser> = new Map();
  private readonly byBadge: Map<Twitch.GlobalBadgeSetId, FakeUser[]> = new Map();

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

  constructor(names: string[] = Data.names, options?: FakeUserPoolOptions) {
    super();

    this.users = this.start(names, options?.badges, options);
    this.byId = new Map(this.users.map((user) => [user.id, user]));
    this.byName = new Map(this.users.map((user) => [user.login, user]));
    this.byBadge = new Map(
      this.users.reduce((acc, user) => {
        for (const badge of user.badges) {
          const existing = acc.get(badge) ?? [];
          acc.set(badge, [...existing, user]);
        }
        return acc;
      }, new Map<Twitch.GlobalBadgeSetId, FakeUser[]>()),
    );

    fakeUserPools.push(this);
  }

  private start(
    names: string[],
    badges: Twitch.GlobalBadgeSetId[] = Data.badges.map(
      (e) => e.set_id,
    ) as Twitch.GlobalBadgeSetId[],
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
    const limits = options?.limits ?? {};
    const fixed = options?.fixed ?? {};
    const usage = new Map<Twitch.GlobalBadgeSetId, number>();
    const fixedNameToBadge = new Map<string, Twitch.GlobalBadgeSetId>();
    let badgeCursor = 0;

    const getLimit = (badge: Twitch.GlobalBadgeSetId): number => {
      const value = limits[badge];

      return typeof value === 'number' && value > 0 ? value : Number.POSITIVE_INFINITY;
    };

    const canUseBadge = (badge: Twitch.GlobalBadgeSetId): boolean => {
      const max = getLimit(badge);
      const current = usage.get(badge) ?? 0;

      return current < max;
    };

    const registerBadgeUsage = (badge: Twitch.GlobalBadgeSetId): void => {
      const current = usage.get(badge) ?? 0;
      usage.set(badge, current + 1);
    };

    const normalizeUserNames = (value: string | string[] | undefined): string[] => {
      if (!value) return [];

      if (typeof value === 'string') {
        return [FakeUserPool.fixUser(value)].filter(Boolean);
      }

      if (Array.isArray(value)) {
        return value.map(FakeUserPool.fixUser).filter(Boolean);
      }

      return [];
    };

    const nextAvailableBadge = (): Twitch.GlobalBadgeSetId | null => {
      for (let step = 0; step < badgePool.length; step++) {
        const badge = badgePool[(badgeCursor + step) % badgePool.length];

        if (canUseBadge(badge)) {
          badgeCursor = (badgeCursor + step + 1) % badgePool.length;
          return badge;
        }
      }

      return null;
    };

    for (const badge of badgePool) {
      const namesForBadge = normalizeUserNames(fixed[badge]);

      for (const fixedName of namesForBadge) {
        const key = FakeUserPool.fixUser(fixedName);

        if (!fixedNameToBadge.has(key)) {
          fixedNameToBadge.set(key, badge);
        }
      }
    }

    for (const name of normalizedNames) {
      let selectedBadge: Twitch.GlobalBadgeSetId | null = null;
      const fixedBadge = fixedNameToBadge.get(FakeUserPool.fixUser(name));

      if (fixedBadge && canUseBadge(fixedBadge)) {
        selectedBadge = fixedBadge;
      } else {
        selectedBadge = nextAvailableBadge();
      }

      if (!selectedBadge) {
        this.emit('warn', new Error('Not enough badges to assign to users'));
        continue;
      }

      const userIndex = users.length + 1;
      const isSubscriber = ['subscriber', 'prime', 'founder'].includes(
        String(selectedBadge).toLocaleLowerCase(),
      );

      const user = new FakeUser(
        `fake_user_${userIndex.toString().padStart(2, '0')}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        selectedBadge ? [selectedBadge] : [],
        isSubscriber,
        isSubscriber ? FakeUserPool.getRandomSubTier() : undefined,
      );

      users.push(user);

      registerBadgeUsage(selectedBadge);
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

  public getByBadge(badge: Twitch.GlobalBadgeSetId): FakeUser[] {
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
