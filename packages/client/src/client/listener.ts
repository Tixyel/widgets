import { Button } from '../actions/button.js';
import { Command } from '../actions/command.js';
import { Simulation } from '../simulation/index.js';
import { ClientEvents, Provider } from '../types/client.js';
import { Client } from './index.js';

window.addEventListener('load', () => {
  if (window.client instanceof Client) {
    Simulation.start();
  }
});

window.addEventListener('onWidgetLoad', async (data) => {
  const { detail } = data;

  if (window.client instanceof Client) {
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

    client.loaded = true;

    client.storage.on('load', () => {
      client.storage.add(`avatar.${detail.channel.providerId.toLowerCase()}`, {
        value: detail.channel.avatar,
        timestamp: Date.now(),
        expire: Date.now() + client.cache.avatar * 60 * 60 * 1000,
      });
    });
  }
});

window.addEventListener('onSessionUpdate', (data) => {
  const { detail } = data;

  if (window.client instanceof Client) {
    const client = window.client;

    client.session = detail.session;

    client.emit('session', detail.session);
  }
});

window.addEventListener('onEventReceived', ({ detail }) => {
  if (window.client instanceof Client) {
    var provider: Provider =
      // @ts-ignore
      detail.event?.provider || detail.event?.service || detail.event?.data?.provider || window.client.details.provider;

    const actAsStreamElements = ['kvstore:update', 'bot:counter', 'alertService:toggleSound', 'event:skip', 'tip-latest', 'event:test'];

    if (actAsStreamElements.some((l) => l === detail.listener)) provider = 'streamelements';

    const received = { provider: provider, data: detail } as ClientEvents;

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
            break;
          }
          case 'bot:counter': {
            const event = data.event;
            break;
          }
          case 'alertService:toggleSound': {
            const event = data.event;
            break;
          }
        }

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
            } else if (data.event.gifted && !data.event.bulkGifted && !data.event.isCommunityGift) {
              // gift
              const event = data.event;
            } else if (data.event.gifted && !data.event.bulkGifted && data.event.isCommunityGift) {
              // community gift spam
              const event = data.event;
            } else if (!data.event.gifted && data.event.bulkGifted && !data.event.isCommunityGift) {
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
            } else if (data.event.gifted && !data.event.bulkGifted && !data.event.isCommunityGift) {
              // gift
              const event = data.event;
            } else if (data.event.gifted && !data.event.bulkGifted && data.event.isCommunityGift) {
              // community gift spam
              const event = data.event;
            } else if (!data.event.gifted && data.event.bulkGifted && !data.event.isCommunityGift) {
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

        break;
      }
      case 'kick': {
        const data = received.data;

        break;
      }
      case 'facebook': {
        const data = received.data;

        break;
      }
    }

    // window.client.emit('event', received);
  }
});
