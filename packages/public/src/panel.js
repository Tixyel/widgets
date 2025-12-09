var provider = 'twitch';

window.addEventListener('keydown', async (e) => {
  var key = e.key;

  const actions = {
    m: () => Simulation.emulate[provider].message(),

    // provider changes
    'shift + t': () => {
      provider = 'twitch';

      logger.info('Twitch provider selected!');
    },
    'shift + s': () => {
      provider = 'streamelements';

      logger.info('StreamElements provider selected!');
    },
    'shift + y': () => {
      provider = 'youtube';

      logger.info('YouTube provider selected!');
    },
  };

  if (actions[key]) {
    actions[key]();
  } else if (e.shiftKey) {
    const combo = `shift + ${key.toLowerCase()}`;

    if (actions[combo]) {
      actions[combo]();
    }
  } else if (e.shiftKey && e.ctrlKey) {
    const combo = `ctrl + shift + ${key.toLowerCase()}`;

    if (actions[combo]) {
      actions[combo]();
    }
  } else if (e.shiftKey && e.altKey) {
    const combo = `alt + shift + ${key.toLowerCase()}`;

    if (actions[combo]) {
      actions[combo]();
    }
  }
});
