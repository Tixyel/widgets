import { Client } from '../client/client.js';
import { Data } from '../data/index.js';
import { BadgeOptions } from '../helper/classes/message.js';
import { Helper } from '../helper/index.js';
import { logger } from '../main.js';
import { useQueue } from '../modules/useQueue.js';
import { Twitch } from '../types.js';
import type { ClientEvents, Provider } from '../types/client.js';
import { MapNumberValuesToString } from '../types/path.js';
import { StreamElements } from '../types/streamelements/main.js';

export namespace Local {
  export type QueueItem =
    | { listener: 'onEventReceived'; data: StreamElements.Event.onEventReceived; session?: boolean }
    | { listener: 'onWidgetLoad'; data: StreamElements.Event.onWidgetLoad }
    | { listener: 'onSessionUpdate'; data: StreamElements.Event.onSessionUpdate };

  export const queue = new useQueue<QueueItem>({
    duration: 'client',
    processor: async function processor(received) {
      window.dispatchEvent(new CustomEvent(received.listener, { detail: received.data }));

      if (received.listener === 'onEventReceived' && received.session) {
        const sessionEvent = await Local.generate.event.onSessionUpdate(
          window?.client && window?.client instanceof Client ? window.client.session : undefined,
          Helper.event.parseProvider(received.data),
        );

        window.dispatchEvent(new CustomEvent('onSessionUpdate', { detail: sessionEvent }));
      }
    },
  });

  export const generate = {
    session: {
      types: {
        name: { type: 'string', options: Data.names.filter((e) => e.length) },
        tier: { type: 'string', options: Data.tiers.filter((e) => e.length) },
        message: { type: 'string', options: Data.normal_messages.filter((e) => e.length) },
        item: { type: 'array', options: Data.items },
        avatar: { type: 'string', options: Data.avatars.filter((e) => e.length) },
      } as Record<string, StreamElements.Session.Config.Any>,

      available(): StreamElements.Session.Config.Available.Data {
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
            'session-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 50, max: 200 },
            },
            'weekly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 200, max: 500 },
            },
            'monthly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 500, max: 800 },
            },
            'alltime-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 800, max: 1000 },
            },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 50, max: 200 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 500 } },
            'monthly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 500, max: 800 },
            },
            'alltime-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 800, max: 1000 },
            },
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
            latest: {
              name: types.name,
              amount: { type: 'int', min: 200, max: 800 },
              message: types.message,
            },
            'session-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 200, max: 1000 },
            },
            'weekly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 1000, max: 5000 },
            },
            'monthly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 5000, max: 12000 },
            },
            'alltime-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 12000, max: 20000 },
            },
            'session-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 200, max: 1000 },
            },
            'weekly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 1000, max: 5000 },
            },
            'monthly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 5000, max: 12000 },
            },
            'alltime-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 12000, max: 20000 },
            },
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
            'session-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 200, max: 400 },
            },
            'weekly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 400, max: 800 },
            },
            'monthly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 800, max: 1500 },
            },
            'alltime-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 1500, max: 2000 },
            },
            'session-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 200, max: 400 },
            },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 400, max: 800 } },
            'monthly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 800, max: 1500 },
            },
            'alltime-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 1500, max: 2000 },
            },
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
            'session-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 100, max: 500 },
            },
            'weekly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 500, max: 1000 },
            },
            'monthly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 1000, max: 2000 },
            },
            'alltime-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 2000, max: 2500 },
            },
            'session-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 100, max: 500 },
            },
            'weekly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 500, max: 1000 },
            },
            'monthly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 1000, max: 2000 },
            },
            'alltime-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 2000, max: 2500 },
            },
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
            'level-progress': {
              amount: { type: 'int', min: 0, max: 100 },
              percent: { type: 'int', min: 0, max: 100 },
            },
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
            'session-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 100, max: 500 },
            },
            'weekly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 500, max: 1000 },
            },
            'monthly-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 1000, max: 2000 },
            },
            'alltime-top-donation': {
              name: types.name,
              amount: { type: 'int', min: 2000, max: 2500 },
            },
            'session-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 100, max: 500 },
            },
            'weekly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 500, max: 1000 },
            },
            'monthly-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 1000, max: 2000 },
            },
            'alltime-top-donator': {
              name: types.name,
              amount: { type: 'int', min: 2000, max: 2500 },
            },
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
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              items: types.item,
            },
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

      async get(startSession?: StreamElements.Session.Data): Promise<StreamElements.Session.Data> {
        const available = this.available();

        if (startSession) return startSession;

        const generate = (
          available:
            | StreamElements.Session.Config.Available.Data
            | StreamElements.Session.Config.Available.Category
            | StreamElements.Session.Config.Any,
        ): any => {
          const generateRecentData = (config: StreamElements.Session.Config.Any): Array<any> => {
            if (!config || !('amount' in config)) return [];

            const items: Array<{ createdAt: string }> = [];

            for (let i = 0; i < config.amount; i++) {
              items.push(generate(config.value));
            }

            return items.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
          };

          const generateObjectData = (config: Record<string, any>): Record<string, any> => {
            const result: Record<string, any> = {};

            for (const key in config) {
              const processedKey = key.replace('_type', 'type');

              result[processedKey] = generate(config[key]);
            }

            return result;
          };

          const processTypedConfig = (config: StreamElements.Session.Config.Any): any => {
            if (!config) return config;

            switch (config.type) {
              case 'int':
                return Helper.random.number(config.min, config.max);
              case 'string':
                return Helper.random.array(config.options)[0];
              case 'date':
                return Helper.random.daysOffset(config.range);
              case 'array':
                return Helper.random.array(config.options)[0];
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

        var session: StreamElements.Session.Data = Object.entries(generate(available)).reduce(
          (acc, [key, value]) => {
            Object.entries(value as any).forEach(
              ([subKey, subValue]) =>
                //
                (acc[`${key}-${subKey}`] = subValue),
            );

            return acc;
          },
          {} as Record<string, any>,
        ) as StreamElements.Session.Data;

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
      async onWidgetLoad(
        fields: Record<string, StreamElements.CustomField.Value>,
        session: StreamElements.Session.Data,
        currency: 'BRL' | 'USD' | 'EUR' = 'USD',
      ): Promise<StreamElements.Event.onWidgetLoad> {
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
      async onSessionUpdate(
        session?: StreamElements.Session.Data,
        update?: ClientEvents,
      ): Promise<StreamElements.Event.onSessionUpdate> {
        session ??= await Local.generate.session.get();

        if (update) {
          const orderByDateDesc = (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

          switch (update.provider) {
            case 'twitch': {
              const data = update.data;

              switch (data.listener) {
                case 'cheer-latest': {
                  const amount = data.event.amount;
                  const name = data.event.displayName ?? data.event.name;
                  const message = data.event.message;

                  session['cheer-latest'] = { name, amount, message };

                  const update = (type: 'session' | 'weekly' | 'monthly' | 'alltime' | 'all') => {
                    if (type === 'all') {
                      update('alltime');
                      update('monthly');
                      update('weekly');
                      update('session');

                      return;
                    }

                    const topDonation = session[`cheer-${type}-top-donation`];

                    if (topDonation && amount > topDonation.amount) {
                      topDonation.amount = amount;
                      topDonation.name = name;
                    }

                    const topDonator = session[`cheer-${type}-top-donator`];

                    const donatorCurrent = session['cheer-recent']
                      .filter((e) => e.name.toLowerCase() === topDonator.name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.amount, 0);

                    const donatorNew = session['cheer-recent']
                      .filter((e) => e.name.toLowerCase() === name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.amount, 0);

                    if (donatorNew > donatorCurrent) {
                      topDonator.amount = donatorNew;
                      topDonator.name = name;
                    }
                  };

                  update('all');

                  session['cheer-session'].amount += amount;
                  session['cheer-week'].amount += amount;
                  session['cheer-month'].amount += amount;
                  session['cheer-total'].amount += amount;
                  session['cheer-count'].count += 1;
                  session['cheer-goal'].amount += amount;
                  session['cheer-recent'].unshift({
                    name: name,
                    amount: amount,
                    createdAt: new Date().toISOString(),
                  });
                  session['cheer-recent'] = (session['cheer-recent'] || []).sort(orderByDateDesc);

                  break;
                }
                case 'follower-latest': {
                  const name = data.event.displayName ?? data.event.name;

                  session['follower-latest'].name = name;

                  session['follower-session'].count += 1;
                  session['follower-week'].count += 1;
                  session['follower-month'].count += 1;
                  session['follower-total'].count += 1;
                  session['follower-goal'].amount += 1;
                  session['follower-recent'].unshift({
                    name: name,
                    createdAt: new Date().toISOString(),
                  });
                  session['follower-recent'] = (session['follower-recent'] || []).sort(
                    orderByDateDesc,
                  );

                  break;
                }
                case 'subscriber-latest': {
                  const name = data.event.displayName ?? data.event.name;
                  const amount = data.event.amount;
                  const tier = data.event.tier;
                  const message = data.event.message;

                  session['subscriber-latest'] = { name, amount, tier, message: message ?? '' };

                  if (
                    !session['subscriber-recent'].find(
                      (e) => e.name.toLowerCase() === name.toLowerCase(),
                    )
                  ) {
                    session['subscriber-new-latest'] = { name, amount, message: message ?? '' };
                    session['subscriber-new-session'].count += 1;
                  } else if (amount > 1) {
                    session['subscriber-resub-latest'] = { name, amount, message: message ?? '' };
                    session['subscriber-resub-session'].count += 1;
                  }

                  if (!data.event.gifted && !data.event.bulkGifted && !data.event.isCommunityGift) {
                    // normal
                  } else if (
                    data.event.gifted &&
                    !data.event.bulkGifted &&
                    !data.event.isCommunityGift
                  ) {
                    const sender = data.event.sender;
                    // gift
                    session['subscriber-gifted-latest'] = {
                      name,
                      amount,
                      tier,
                      message: message ?? '',
                      sender,
                    };
                    session['subscriber-gifted-session'].count += 1;

                    session['subscriber-alltime-gifter'] = { name: sender, amount };
                  } else if (
                    data.event.gifted &&
                    !data.event.bulkGifted &&
                    data.event.isCommunityGift
                  ) {
                    // community gift spam
                  } else if (
                    !data.event.gifted &&
                    data.event.bulkGifted &&
                    !data.event.isCommunityGift
                  ) {
                    // community gift
                  }

                  session['subscriber-session'].count += amount;
                  session['subscriber-week'].count += amount;
                  session['subscriber-month'].count += amount;
                  session['subscriber-total'].count += amount;
                  session['subscriber-goal'].amount += amount;
                  session['subscriber-points'].amount += amount;

                  session['subscriber-recent'].unshift({
                    name: name,
                    amount: amount,
                    tier: tier,
                    createdAt: new Date().toISOString(),
                  });
                  session['subscriber-recent'] = (session['subscriber-recent'] || []).sort(
                    orderByDateDesc,
                  );

                  break;
                }
                case 'raid-latest': {
                  const name = data.event.displayName ?? data.event.name;
                  const amount = data.event.amount;

                  session['raid-latest'] = { name, amount };

                  session['raid-recent'].unshift({
                    name: name,
                    amount: amount,
                    createdAt: new Date().toISOString(),
                  });
                  session['raid-recent'] = (session['raid-recent'] || []).sort(orderByDateDesc);
                  break;
                }
              }

              break;
            }

            case 'youtube': {
              const data = update.data;

              switch (data.listener) {
                case 'superchat-latest': {
                  const name = data.event.displayName ?? data.event.name;
                  const amount = data.event.amount;

                  session['superchat-latest'] = {
                    name: name.toLowerCase(),
                    displayName: name,
                    amount,
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'superchat',
                    originalEventName: 'superchat-latest',
                    providerId: '',
                    avatar: '',
                  };

                  const update = (type: 'session' | 'weekly' | 'monthly' | 'alltime' | 'all') => {
                    if (type === 'all') {
                      update('alltime');
                      update('monthly');
                      update('weekly');
                      update('session');

                      return;
                    }

                    const topDonation = session[`superchat-${type}-top-donation`];

                    if (topDonation && amount > topDonation.amount) {
                      topDonation.amount = amount;
                      topDonation.name = name;
                    }

                    const topDonator = session[`superchat-${type}-top-donator`];

                    const donatorCurrent = session['superchat-recent']
                      .filter((e) => e.name.toLowerCase() === topDonator.name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.amount, 0);

                    const donatorNew = session['superchat-recent']
                      .filter((e) => e.name.toLowerCase() === name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.amount, 0);

                    if (donatorNew > donatorCurrent) {
                      topDonator.amount = donatorNew;
                      topDonator.name = name;
                    }
                  };

                  update('all');

                  session['superchat-session'].amount += amount;
                  session['superchat-week'].amount += amount;
                  session['superchat-month'].amount += amount;
                  session['superchat-total'].amount += amount;
                  session['superchat-count'].count += 1;
                  session['superchat-goal'].amount += amount;
                  session['superchat-recent'].unshift({
                    name: name.toLowerCase(),
                    displayName: name,
                    amount: amount,
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'superchat',
                    originalEventName: 'superchat-latest',
                    avatar: '',
                    providerId: '',
                  });
                  // session['superchat-recent'] = (session['superchat-recent'] || []).sort(orderByDateDesc);

                  break;
                }
              }

              break;
            }

            case 'streamelements': {
              const data = update.data;

              switch (data.listener) {
                case 'tip-latest': {
                  const name = data.event.displayName ?? data.event.name;
                  const amount = data.event.amount;

                  session['tip-latest'] = { name, amount };

                  const update = (type: 'session' | 'weekly' | 'monthly' | 'alltime' | 'all') => {
                    if (type === 'all') {
                      update('alltime');
                      update('monthly');
                      update('weekly');
                      update('session');

                      return;
                    }

                    const topDonation = session[`tip-${type}-top-donation`];

                    if (topDonation && amount > topDonation.amount) {
                      topDonation.amount = amount;
                      topDonation.name = name;
                    }

                    const topDonator = session[`tip-${type}-top-donator`];

                    const donatorCurrent = session['tip-recent']
                      .filter((e) => e.name.toLowerCase() === topDonator.name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.amount, 0);

                    const donatorNew = session['tip-recent']
                      .filter((e) => e.name.toLowerCase() === name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.amount, 0);

                    if (donatorNew > donatorCurrent) {
                      topDonator.amount = donatorNew;
                      topDonator.name = name;
                    }
                  };

                  update('all');

                  session['tip-session'].amount += amount;
                  session['tip-week'].amount += amount;
                  session['tip-month'].amount += amount;
                  session['tip-total'].amount += amount;
                  session['tip-count'].count += 1;
                  session['tip-goal'].amount += amount;
                  session['tip-recent'].unshift({
                    name: name,
                    amount: amount,
                    createdAt: new Date().toISOString(),
                  });
                  session['tip-recent'] = (session['tip-recent'] || []).sort(orderByDateDesc);

                  break;
                }
                case 'event:test': {
                  break;
                }
              }

              break;
            }
          }
        }

        return { session, emulated: true };
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
       * const randomEvent = await Local .generate.event.onEventReceived();
       *
       * // Simulate a Twitch message event with custom options
       * const twitchMessageEvent = await Local .generate.event.onEventReceived('twitch', 'message', { name: 'Streamer', message: 'Hello World!' });
       * ```
       */
      async onEventReceived(
        provider: Provider | 'random' = 'random',
        type:
          | StreamElements.Event.onEventReceived['listener']
          | 'random'
          | 'tip'
          | 'cheer'
          | 'follower'
          | 'raid'
          | 'subscriber' = 'random',
        options: Record<string, string | number | boolean> = {},
      ): Promise<StreamElements.Event.onEventReceived | null> {
        const available: Record<Provider, string[]> = {
          twitch: [
            'message',
            'follower-latest',
            'cheer-latest',
            'raid-latest',
            'subscriber-latest',
          ],
          streamelements: ['tip-latest'],
          youtube: ['message', 'superchat-latest', 'subscriber-latest', 'sponsor-latest'],
          kick: [],
          facebook: [],
        };

        switch (provider) {
          default:
          case 'random': {
            var randomProvider = Helper.random.array(
              Object.keys(available).filter((e) => available[e as Provider].length),
            )[0] as Provider;
            var randomEvent = Helper.random.array(
              available[randomProvider],
            )[0] as StreamElements.Event.onEventReceived['listener'];

            return this.onEventReceived(randomProvider, randomEvent);
          }

          case 'twitch': {
            switch (
              type as
                | StreamElements.Event.Provider.Twitch.Events['listener']
                | 'random'
                | 'cheer'
                | 'follower'
                | 'raid'
                | 'subscriber'
            ) {
              default:
              case 'random': {
                var randomEvent = Helper.random.array(
                  available[provider],
                )[0] as StreamElements.Event.onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'message': {
                const data = options as Partial<{
                  name: string;
                  message: string;
                  badges: BadgeOptions;
                  color: string;
                  userId: string;
                  msgId: string;
                  channel: string;
                  time: number;
                  firstMsg: boolean;
                  returningChatter: boolean;
                  reply: {
                    msgId: string;
                    userId: string;
                    login: string;
                    name: string;
                    text: string;
                  };
                  thread: {
                    msgId: string;
                    name: string;
                  };
                }>;

                var name = data?.name ?? Helper.random.array(Data.names.filter((e) => e.length))[0];
                var message =
                  data?.message ??
                  Helper.random.array(
                    [...Data.twitch_messages, ...Data.normal_messages].filter((e) => e.length),
                  )[0];

                var badges = await Helper.message.generateBadges(data?.badges ?? [], provider);

                var emotes = Helper.message.findEmotesInText(message);
                var renderedText = Helper.message.replaceEmotesWithHTML(message, emotes);

                var color = (data?.color as string) ?? Helper.random.color('hex');
                var userId = (data?.userId as string) ?? Helper.random.string(16);
                var msgId = (data?.msgId as string) ?? Helper.random.string(16);
                var time = (data?.time as number) ?? Date.now();

                var channel =
                  (data?.channel as string) ?? window?.client?.details?.user?.username ?? 'local';

                var reply = data?.reply
                  ? ({
                      'reply-parent-display-name': data.reply.name,
                      'reply-parent-msg-body': data.reply.text,
                      'reply-parent-msg-id': data.reply.msgId,
                      'reply-parent-user-id': data.reply.userId,
                      'reply-parent-user-login': data.reply.name.toLowerCase(),
                    } satisfies Partial<Twitch.IRC>)
                  : {};

                var thread = data?.thread
                  ? ({
                      'reply-thread-parent-msg-id': data.thread.msgId,
                      'reply-thread-parent-user-login': data.thread.name.toLowerCase(),
                    } satisfies Partial<Twitch.IRC>)
                  : {};

                var roles = {
                  vip: badges.keys.includes('vip') ? '' : undefined,
                  subscriber: badges.keys.includes('subscriber') ? '1' : '0',
                  mod: badges.keys.includes('moderator') ? '1' : '0',
                  turbo: badges.keys.includes('turbo') ? '1' : '0',
                } as const;

                const event: StreamElements.Event.Provider.Twitch.Message = {
                  listener: 'message',
                  event: {
                    service: provider,
                    data: {
                      time: time,
                      tags: {
                        'badge-info': `${badges.keys.map((key) => `${key}/${badges.amount[key] ?? Helper.random.number(1, 5)}`).join(',')}`,
                        'badges': badges.keys.map((key) => `${key}/1`).join(','),

                        ...roles,

                        'tmi-sent-ts': time.toString(),
                        'room-id': Helper.random.string(9, 'numbers'),

                        'user-id': userId,
                        'user-type': '',

                        color: color,
                        'display-name': name,
                        emotes: '',

                        'client-nonce': Helper.random.string(16),
                        flags: '',
                        id: msgId,
                        'first-msg': data?.firstMsg ? '1' : '0',
                        'returning-chatter': data?.returningChatter ? '1' : '0',

                        ...reply,
                        ...thread,
                      },
                      nick: name.toLowerCase(),
                      displayName: name,
                      displayColor: color,
                      channel: channel,
                      text: message,
                      isAction: false,
                      userId: userId,
                      msgId: msgId,
                      badges: badges.badges,
                      emotes: emotes,
                    },
                    renderedText: renderedText,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'cheer':
              case 'cheer-latest': {
                var amount = (options?.amount as number) ?? Helper.random.number(100, 10000);
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];
                var message =
                  (options?.message as string) ??
                  Helper.random.array(Data.normal_messages.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.Twitch.Cheer & {
                  event: { provider: Provider };
                } = {
                  listener: 'cheer-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    message: message,
                    providerId: '',
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'cheer',
                    originalEventName: 'cheer-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'follower':
              case 'follower-latest': {
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.Twitch.Follower & {
                  event: { provider: Provider };
                } = {
                  listener: 'follower-latest',
                  event: {
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'follower',
                    originalEventName: 'follower-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'raid':
              case 'raid-latest': {
                var amount = (options?.amount as number) ?? Helper.random.number(1, 100);
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.Twitch.Raid & {
                  event: { provider: Provider };
                } = {
                  listener: 'raid-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'raid',
                    originalEventName: 'raid-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'subscriber':
              case 'subscriber-latest': {
                var tier =
                  (options?.tier as string) ??
                  Helper.random.array(['1000', '2000', '3000', 'prime'])[0];
                var amount = (options?.amount as number) ?? Helper.random.number(1, 24);
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];
                var sender =
                  (options?.sender as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length && e !== name))[0];
                var message =
                  (options?.message as string) ??
                  Helper.random.array(Data.normal_messages.filter((e) => e.length))[0];

                var addons = {
                  default: {
                    avatar,
                    playedAsCommunityGift: false,
                  },
                  gift: {
                    sender,
                    gifted: true,
                  } as StreamElements.Event.Provider.Twitch.gift,
                  community: {
                    message,
                    sender,
                    bulkGifted: true,
                  } as StreamElements.Event.Provider.Twitch.community,
                  spam: {
                    sender,
                    gifted: true,
                    isCommunityGift: true,
                  } as StreamElements.Event.Provider.Twitch.spam,
                };

                var subTypes = ['default', 'gift', 'community', 'spam'];
                var subType = (options?.subType as string) ?? Helper.random.array(subTypes)[0];

                subType = subTypes.includes(subType) ? subType : 'default';

                const event: StreamElements.Event.Provider.Twitch.Subscriber & {
                  event: { provider: Provider };
                } = {
                  listener: 'subscriber-latest',
                  event: {
                    amount,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    tier: tier as StreamElements.Event.Provider.Twitch.SubscriberTier,

                    ...addons.default,
                    ...addons[subType as keyof typeof addons],

                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'subscriber',
                    originalEventName: 'subscriber-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'delete-message': {
                const event: StreamElements.Event.Provider.Twitch.DeleteMessage & {
                  event: { provider: Provider };
                } = {
                  listener: 'delete-message',
                  event: {
                    msgId: (options?.id as string) ?? Helper.random.uuid(),
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'delete-messages': {
                const event: StreamElements.Event.Provider.Twitch.DeleteMessages & {
                  event: { provider: Provider };
                } = {
                  listener: 'delete-messages',
                  event: {
                    userId:
                      (options?.id as string) ??
                      Helper.random.number(10000000, 99999999).toString(),
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
            }
          }

          case 'streamelements': {
            switch (
              type as
                | StreamElements.Event.Provider.StreamElements.Events['listener']
                | 'random'
                | 'tip'
                | 'mute'
                | 'unmute'
                | 'skip'
            ) {
              default:
              case 'random': {
                var randomEvent = Helper.random.array(
                  available[provider],
                )[0] as StreamElements.Event.onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'tip':
              case 'tip-latest': {
                var amount = (options?.amount as number) ?? Helper.random.number(100, 4000);
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.StreamElements.Tip & {
                  event: { provider: Provider };
                } = {
                  listener: 'tip-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'tip',
                    originalEventName: 'tip-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'kvstore:update': {
                const event: StreamElements.Event.Provider.StreamElements.KVStore & {
                  event: { provider: Provider };
                } = {
                  listener: 'kvstore:update',
                  event: {
                    data: {
                      key: `customWidget.${(options?.key as string) ?? 'sampleKey'}`,
                      value: (options?.value as string) ?? 'sampleValue',
                    },
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'bot:counter': {
                const event: StreamElements.Event.Provider.StreamElements.BotCounter & {
                  event: { provider: Provider };
                } = {
                  listener: 'bot:counter',
                  event: {
                    counter: (options?.counter as string) ?? 'sampleCounter',
                    value: (options?.value as number) ?? Helper.random.number(0, 100),
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'mute':
              case 'unmute':
              case 'alertService:toggleSound': {
                var muted =
                  (options?.muted as boolean) ?? window?.client?.details?.overlay?.muted ?? false;

                const event: StreamElements.Event.Provider.StreamElements.AlertService & {
                  event: { provider: Provider };
                } = {
                  listener: 'alertService:toggleSound',
                  event: {
                    muted,
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'skip':
              case 'event:skip': {
                const event: StreamElements.Event.Provider.StreamElements.EventSkip & {
                  event: { provider: Provider };
                } = {
                  listener: 'event:skip',
                  event: {
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
            }
          }

          case 'youtube': {
            switch (
              type as
                | StreamElements.Event.Provider.YouTube.Events['listener']
                | 'random'
                | 'message'
                | 'superchat'
                | 'subscriber'
                | 'sponsor'
            ) {
              default:
              case 'random': {
                var randomEvent = Helper.random.array(
                  available[provider],
                )[0] as StreamElements.Event.onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'message': {
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];
                var message =
                  (options?.message as string) ??
                  Helper.random.array(
                    [...Data.youtube_messages, ...Data.normal_messages].filter((e) => e.length),
                  )[0];

                const badges = await Helper.message.generateBadges(
                  (options?.badges as BadgeOptions) ?? [],
                  provider,
                );

                var emotes = Helper.message.findEmotesInText(message);
                var renderedText = Helper.message.replaceEmotesWithHTML(message, emotes);

                var color = (options?.color as string) ?? Helper.random.color('hex');
                var userId =
                  (options?.userId as string) ??
                  Helper.random.number(10000000, 99999999).toString();
                var msgId = (options?.msgId as string) ?? Helper.random.uuid();
                var time = (options?.time as number) ?? Date.now();

                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];

                var channel =
                  (options?.channel as string) ??
                  window?.client?.details?.user?.username ??
                  'local';

                const event: StreamElements.Event.Provider.YouTube.Message = {
                  listener: 'message',
                  event: {
                    service: provider,
                    data: {
                      kind: '',
                      etag: '',
                      id: '',
                      snippet: {
                        type: '',
                        liveChatId: '',
                        authorChannelId: channel,
                        publishedAt: new Date().toISOString(),
                        hasDisplayContent: true,
                        displayMessage: message,
                        textMessageDetails: {
                          messageText: message,
                        },
                      },
                      authorDetails: {
                        channelId: channel,
                        channelUrl: '',
                        displayName: name,
                        profileImageUrl: avatar,
                        ...badges,
                      },
                      msgId: msgId,
                      userId: userId,
                      nick: name.toLowerCase(),
                      badges: [],
                      displayName: name,
                      isAction: false,
                      time: time,
                      tags: [],
                      displayColor: color,
                      channel: channel,
                      text: message,
                      avatar: avatar,
                      emotes: [],
                    },
                    renderedText: message,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'subscriber':
              case 'subscriber-latest': {
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.YouTube.Subscriber & {
                  event: { provider: Provider };
                } = {
                  listener: 'subscriber-latest',
                  event: {
                    avatar,
                    displayName: name,
                    name: name.toLowerCase(),
                    providerId: '',
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'subscriber',
                    originalEventName: 'subscriber-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'superchat':
              case 'superchat-latest': {
                var amount = (options?.amount as number) ?? Helper.random.number(100, 4000);
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.YouTube.Superchat & {
                  event: { provider: Provider };
                } = {
                  listener: 'superchat-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'superchat',
                    originalEventName: 'superchat-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
              case 'sponsor':
              case 'sponsor-latest': {
                var tier =
                  (options?.tier as string) ?? Helper.random.array(['1000', '2000', '3000'])[0];
                var amount = (options?.amount as number) ?? Helper.random.number(1, 24);
                var avatar = (options?.avatar as string) ?? Helper.random.array(Data.avatars)[0];
                var name =
                  (options?.name as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length))[0];
                var sender =
                  (options?.sender as string) ??
                  Helper.random.array(Data.names.filter((e) => e.length && e !== name))[0];
                var message =
                  (options?.message as string) ??
                  Helper.random.array(Data.normal_messages.filter((e) => e.length))[0];

                var addons = {
                  default: {
                    avatar,
                    playedAsCommunityGift: false,
                  },
                  gift: {
                    sender,
                    gifted: true,
                  } as StreamElements.Event.Provider.YouTube.gift,
                  community: {
                    message,
                    sender,
                    bulkGifted: true,
                  } as StreamElements.Event.Provider.YouTube.community,
                  spam: {
                    sender,
                    gifted: true,
                    isCommunityGift: true,
                  } as StreamElements.Event.Provider.YouTube.spam,
                };

                var subTypes = ['default', 'gift', 'community', 'spam'];
                var subType = (options?.subType as string) ?? Helper.random.array(subTypes)[0];

                subType = subTypes.includes(subType) ? subType : 'default';

                const event: StreamElements.Event.Provider.YouTube.Sponsor & {
                  event: { provider: Provider };
                } = {
                  listener: 'sponsor-latest',
                  event: {
                    amount,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',

                    ...addons.default,
                    ...addons[subType as keyof typeof addons],

                    _id: Helper.random.uuid(),
                    sessionTop: false,
                    type: 'sponsor',
                    originalEventName: 'sponsor-latest',
                    provider,
                  },
                  // @ts-ignore
                  emulated: true,
                };

                return event;
              }
            }
          }
        }
      },
    },
  };

  export const emulate = {
    twitch: {
      message(
        data: Partial<{
          name: string;
          message: string;
          badges: BadgeOptions;
          color: string;
          userId: string;
          msgId: string;
          channel: string;
          time: number;
          firstMsg: boolean;
          returningChatter: boolean;
          reply: {
            msgId: string;
            userId: string;
            login: string;
            name: string;
            text: string;
          };
          thread: {
            msgId: string;
            name: string;
          };
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived('twitch', 'message', data as { [key: string]: any })
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      deleteMessage(msgId: string) {
        if (!msgId || typeof msgId !== 'string') return;

        const event: StreamElements.Event.Provider.Twitch.DeleteMessage = {
          listener: 'delete-message',
          event: {
            msgId: msgId,
          },
        };

        Local.emulate.send('onEventReceived', event);
      },
      deleteMessages(userId: string) {
        if (!userId || typeof userId !== 'string') return;

        const event: StreamElements.Event.Provider.Twitch.DeleteMessages = {
          listener: 'delete-messages',
          event: {
            userId: userId,
          },
        };

        Local.emulate.send('onEventReceived', event);
      },
      follower(
        data: Partial<{
          avatar: string;
          name: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'twitch',
            'follower-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      raid(
        data: Partial<{
          amount: number;
          avatar: string;
          name: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'twitch',
            'raid-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      cheer(
        data: Partial<{
          amount: number;
          avatar: string;
          name: string;
          message: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'twitch',
            'cheer-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      subscriber(
        data: Partial<{
          tier: '1000' | '2000' | '3000' | 'prime';
          amount: number;
          avatar: string;
          name: string;
          sender: string;
          message: string;
          subType: 'default' | 'gift' | 'community' | 'spam';
        }> & { subType?: 'default' | 'gift' | 'community' | 'spam' } = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'twitch',
            'subscriber-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
    },
    streamelements: {
      tip(
        data: Partial<{
          amount: number;
          avatar: string;
          name: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'streamelements',
            'tip-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
    },
    youtube: {
      message(
        data: Partial<{
          name: string;
          message: string;
          badges: BadgeOptions;
          color: string;
          userId: string;
          msgId: string;
          channel: string;
          time: number;
          avatar: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'youtube',
            'message',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      subscriber(
        data: Partial<{
          avatar: string;
          name: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'youtube',
            'subscriber-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      superchat(
        data: Partial<{
          amount: number;
          avatar: string;
          name: string;
        }> = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'youtube',
            'superchat-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
      sponsor(
        data: Partial<{
          tier: '1000' | '2000' | '3000';
          amount: number;
          avatar: string;
          name: string;
          sender: string;
          message: string;
          subType: 'default' | 'gift' | 'community' | 'spam';
        }> & { subType?: 'default' | 'gift' | 'community' | 'spam' } = {},
      ) {
        Local.generate.event
          .onEventReceived(
            'youtube',
            'sponsor-latest',
            data as { [key: string]: string | number | boolean },
          )
          .then((event) => {
            if (event) {
              Local.emulate.send('onEventReceived', event);
            }
          });
      },
    },
    kick: {},
    facebook: {},

    send<T extends 'onEventReceived' | 'onSessionUpdate' | 'onWidgetLoad'>(
      listener: T,
      event: T extends 'onEventReceived'
        ? StreamElements.Event.onEventReceived
        : T extends 'onSessionUpdate'
          ? StreamElements.Event.onSessionUpdate
          : StreamElements.Event.onWidgetLoad,
    ): void {
      if (!Local.queue) {
        logger.warn('Local  queue is not initialized.');

        window.dispatchEvent(new CustomEvent(listener, { detail: event }));

        return;
      }

      switch (listener) {
        case 'onEventReceived': {
          Local.queue.enqueue({
            listener,
            data: event as StreamElements.Event.onEventReceived,
            session: listener === 'onEventReceived' ? true : undefined,
          });

          break;
        }
        case 'onSessionUpdate': {
          Local.queue.enqueue({
            listener,
            data: event as StreamElements.Event.onSessionUpdate,
          });

          break;
        }
        case 'onWidgetLoad': {
          Local.queue.enqueue({
            listener,
            data: event as StreamElements.Event.onWidgetLoad,
          });

          break;
        }
      }
    },
  };

  export async function start(
    fieldsFile: string[] = ['fields.json', 'cf.json', 'field.json', 'customfields.json'],
    dataFiles: string[] = ['data.json', 'fielddata.json', 'fd.json', 'DATA.json'],
    session?: StreamElements.Session.Data,
  ) {
    const localFiles = {
      fields: fieldsFile.find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
      data: dataFiles.find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
    };

    const data: Record<string, string | number | boolean> = await fetch(
      './' + (localFiles.data ?? 'data.json'),
      {
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .catch(() => ({}));

    await fetch('./' + (localFiles.fields ?? 'fields.json'), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then(async (customfields: Record<string, StreamElements.CustomField.Schema>) => {
        const fields = Object.entries(customfields)
          .filter(([_, { value }]) => value != undefined)
          .reduce(
            (acc, [key, { value }]) => {
              if (data && data[key] !== undefined) value = data[key];

              acc[key] = value;

              return acc;
            },
            {
              ...data,
            } as Record<string, StreamElements.CustomField.Value>,
          );

        const load = await Local.generate.event.onWidgetLoad(
          fields,
          await Local.generate.session.get(session),
        );

        window.dispatchEvent(new CustomEvent('onWidgetLoad', { detail: load }));
      });
  }
}
