import { Button } from '../actions/button.js';
import { Command } from '../actions/command.js';
import { Helper } from '../helper/index.js';
import { Local } from '../local/index.js';
import { logger } from '../main.js';
import { usedComms } from '../modules/useComms.js';
import { useQueue } from '../modules/useQueue.js';
import { usedStorages } from '../modules/useStorage.js';
import { Client, ClientStorageOptions } from './client.js';

if (typeof window !== undefined) {
  window.addEventListener('onWidgetLoad', async (data) => {
    const { detail } = data;

    if (window.client instanceof Client && client instanceof Client && !!client) {
      const client = window.client;

      client.fields = detail.fieldData;
      client.session = detail.session.data;

      client.details = {
        ...client.details,
        user: detail.channel,
        currency: detail.currency,
        overlay: detail.overlay,
      };

      if (detail.channel.id && !detail.emulated) {
        await fetch(`https://api.streamelements.com/kappa/v2/channels/${detail.channel.id}/`)
          .then((res) => res.json())
          .then((profile) => {
            if (profile.provider) {
              client.details.provider = profile.provider;

              return profile.provider;
            } else {
              client.details.provider = 'local';
            }
          })
          .catch(() => {
            client.details.provider = 'local';
          });
      } else {
        client.details.provider = 'local';
      }

      client.emit('load', detail);

      if (client.debug) {
        logger.received('Widget loaded!', data.detail);

        const fieldData = data.detail.fieldData;

        if (Object.keys(fieldData).length) logger.received('Field data:', fieldData);
      }

      client.loaded = true;

      client.storage.on('load', (data) => {
        if (client.debug && data) {
          logger.debug(
            '[Client]',
            'Storage loaded for client',
            `"${client.id}";`,
            `Provider: "${client.details.provider}";`,
            data,
          );
        } else if (client.debug) {
          logger.debug(
            '[Client]',
            'Storage loaded for client',
            `"${client.id}";`,
            `Provider: "${client.details.provider}";`,
            'No data found.',
          );
        }

        if (data) {
          const clearExpired = <T extends Record<string, ClientStorageOptions<string>>>(
            data: T,
          ) => {
            const now = Date.now();
            const cleanedData: any = {};

            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                const entry = data[key];

                if (entry.expire && entry.expire > now) {
                  cleanedData[key] = entry;
                }
              }
            }

            return cleanedData as T;
          };

          const users = clearExpired(data['user'] || {});
          const avatars = clearExpired(data['avatar'] || {});
          const pronouns = clearExpired(data['pronoun'] || {});
          const emotes = clearExpired(data['emote'] || {});

          client.storage.update({
            user: users,
            avatar: avatars,
            pronoun: pronouns,
            emote: emotes,
          });
        }

        if (detail.channel.providerId.length) {
          client.storage.add(`avatar.${detail.channel.providerId.toLowerCase()}`, {
            value: detail.channel.avatar,
            timestamp: Date.now(),
            expire: Date.now() + client.cache.avatar * 60 * 1000,
          });
        }
      });
    }
  });

  window.addEventListener('onSessionUpdate', (data) => {
    const { detail } = data;

    if (window.client instanceof Client && client instanceof Client && !!client) {
      const client = window.client;

      client.session = detail.session;

      client.emit('session', detail.session);

      if (client.debug) {
        logger.debug('[Client]', 'Session updated', detail.session);
      }
    }
  });

  window.addEventListener('onEventReceived', ({ detail }) => {
    if (window.client instanceof Client && client instanceof Client && !!client) {
      const received = Helper.event.parseProvider(detail);

      switch (received.provider) {
        case 'streamelements': {
          const data = received.data;

          switch (data.listener) {
            case 'tip-latest': {
              const event = data.event;

              break;
            }
            case 'event:skip': {
              const event = data.event;

              break;
            }
            case 'event:test': {
              switch (data.event.listener) {
                case 'widget-button': {
                  const event = data.event;

                  Button.execute(event.field, event.value);

                  break;
                }
                case 'subscriber-latest': {
                  const event = data.event;
                  break;
                }

                // ... alot more
              }

              break;
            }
            case 'kvstore:update': {
              const event = data.event;

              if (usedStorages.length) {
                var storage = usedStorages.find(
                  (s) =>
                    s.id === event.data.key.replace('customWidget.', '') || s.id === event.data.key,
                );

                if (storage) {
                  // @ts-ignore
                  storage.update(event.data.value);
                }
              }

              if (usedComms.length) {
                const comm = usedComms.find(
                  (c) =>
                    c.id === event.data.key.replace('customWidget.', '') || c.id === event.data.key,
                );

                if (comm) {
                  // @ts-ignore
                  comm.update(event.data.value);
                }
              }

              break;
            }
            case 'bot:counter': {
              const event = data.event;

              break;
            }
            case 'alertService:toggleSound': {
              const event = data.event;

              client.details.overlay.muted = Boolean(event.muted);

              break;
            }
          }

          window.client.emit('event', 'streamelements', received.data);

          break;
        }
        case 'twitch': {
          const data = received.data;

          switch (data.listener) {
            case 'delete-message': {
              const event = data.event;

              break;
            }
            case 'delete-messages': {
              const event = data.event;

              break;
            }
            case 'message': {
              const event = data.event;

              Command.execute({ provider: 'twitch', data: data });

              break;
            }
            case 'follower-latest': {
              const event = data.event;

              break;
            }
            case 'cheer-latest': {
              const event = data.event;

              break;
            }
            case 'subscriber-latest': {
              if (!data.event.gifted && !data.event.bulkGifted && !data.event.isCommunityGift) {
                // normal
                const event = data.event;
              } else if (
                data.event.gifted &&
                !data.event.bulkGifted &&
                !data.event.isCommunityGift
              ) {
                // gift
                const event = data.event;
              } else if (
                data.event.gifted &&
                !data.event.bulkGifted &&
                data.event.isCommunityGift
              ) {
                // community gift spam
                const event = data.event;
              } else if (
                !data.event.gifted &&
                data.event.bulkGifted &&
                !data.event.isCommunityGift
              ) {
                // community gift
                const event = data.event;
              }

              break;
            }
            case 'raid-latest': {
              const event = data.event;

              break;
            }
          }

          window.client.emit('event', 'twitch', received.data);

          break;
        }
        case 'youtube': {
          const data = received.data;

          switch (data.listener) {
            case 'message': {
              const event = data.event;

              Command.execute({ provider: 'youtube', data: data });

              break;
            }
            case 'subscriber-latest': {
              const event = data.event;

              break;
            }
            case 'sponsor-latest': {
              const event = data.event;

              if (!data.event.gifted && !data.event.bulkGifted && !data.event.isCommunityGift) {
                // normal
                const event = data.event;
              } else if (
                data.event.gifted &&
                !data.event.bulkGifted &&
                !data.event.isCommunityGift
              ) {
                // gift
                const event = data.event;
              } else if (
                data.event.gifted &&
                !data.event.bulkGifted &&
                data.event.isCommunityGift
              ) {
                // community gift spam
                const event = data.event;
              } else if (
                !data.event.gifted &&
                data.event.bulkGifted &&
                !data.event.isCommunityGift
              ) {
                // community gift
                const event = data.event;
              }

              break;
            }
            case 'superchat-latest': {
              const event = data.event;

              break;
            }
          }

          window.client.emit('event', 'youtube', received.data);

          break;
        }
        case 'kick': {
          const data = received.data;

          window.client.emit('event', 'kick', received.data);

          break;
        }
        case 'facebook': {
          const data = received.data;

          window.client.emit('event', 'facebook', received.data);

          break;
        }
      }

      const excludeListeners: Array<(typeof received.data)['listener']> = [
        'bot:counter',
        'alertService:toggleSound',
        'event',
        'event:skip',
        'event:test',
        'kvstore:update',
      ];

      if (client.debug && !excludeListeners.some((e) => e === received.data.listener)) {
        logger.received(
          '[Client]',
          `Event ${received.data.listener} received from ${received.provider}`,
          received.data.event,
        );
      }
    }
  });
}
