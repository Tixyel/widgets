const { logger, Client, Simulation } = window.Tixyel;

window.addEventListener('DOMContentLoaded', () => {
  if (window.Tixyel) {
    logger.info('Script loaded', window.Tixyel);
  }
});

const settings = {
  events: {
    streamelements: {
      'tip': {
        enabled: true,
      },
    },
    twitch: {
      'follower': {
        enabled: true,
      },
    },
  },
};

new Client({
  id: 'example',
})
  .on('load', async (event) => {
    event.channel;

    logger.received('Received load event', event);

    console.log(await Simulation.generate.event.onEventReceived('twitch', 'message'));
  })
  .on('event', (event) => {
    var provider = event.provider;
    var listener = event.data.listener.split('-')[0];

    if (settings.events[provider]?.[listener]?.enabled) {
      logger.received('Received event', event);
    }
  })
  .on('action', (action, type) => {
    action;
  })
  .on('session', (session) => {});
