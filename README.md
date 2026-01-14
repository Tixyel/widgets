# Tixyel's streamelements widget client

Tixyel's streamelements widget client is a TypeScript/JavaScript helper library for developing custom widgets for [StreamElements](https://streamelements.com/), with a focus on productivity, type safety, and local development.

## Features

- **Typed event helpers** for Twitch, YouTube, and Kick (in development)
- **Utility functions** for common widget tasks
- **TypeScript types** for all major StreamElements events
- **Local development support**: Test your widget locally without uploading to StreamElements
- **Easy integration**: Use via CDN or as an npm package

## Getting Started

### CDN (for streamelements)

```html
<script src="https://cdn.jsdelivr.net/npm/@tixyel/streamelements/dist/index.umd.js"></script>
<script>
  const { Client, Simulation, logger, modules, utils, Alejo } = window.Tixyel;

  new Client({
    id: 'my-custom-widget', // ID of your widget for storage purposes
    debug: true, // Enable event debug logs
  });

  // client is already set on window.client after the executation of new Client(...)
  client.on('load', (data) => {
    Simulation.emulate.twitch.message({ name: 'tixyel', badges: ['broadcaster'], message: 'hello!' });

    console.log(data.fieldData);

    // Create a !test 123 command
    new modules.Command({
      prefix: '!',
      name: 'test',
      permissions: ['broadcaster', 'moderator', 'username'],
      admins: ['tixyel'], // Admins can use the command regardless of permissions
      arguments: true,
      run(args, event) {
        const amount = parseInt(args[0]);

        if (isNaN(amount) || !amount) {
          logger.warn('Invalid amount provided', args);
          return;
        }
      },
    });

    // Create a customfields button listener
    new modules.Button({
      field: (field, value) => {
        if (field.startsWith('emote.')) {
          const count = parseInt(field.split('.')[1]);

          if (!isNaN(count) && count > 0) {
            return true;
          }
        }

        return false;
      },
      template: 'emote.{amount}',
      run(amount) {
        amount = parseInt(amount);

        if (client.details.provider === 'youtube') {
          const message = Array.from({ length: amount })
            .map(() => {
              return Simulation.rand.array(Simulation.data.youtube_emotes)[0];
            })
            .map((emote) => emote.shortcuts[0])
            .join(' ');

          Simulation.emulate.youtube.message({ message });
        } else if (client.details.provider === 'twitch') {
          const message = Array.from({ length: amount })
            .map(() => {
              return Simulation.rand.array(Simulation.data.emotes)[0];
            })
            .map((emote) => emote.name)
            .join(' ');

          Simulation.emulate.twitch.message({ message });
        }
      },
    });

    // comfyJs is integrated to the script
    if (client.details.provider !== 'twitch') {
      new modules.useComfyJs(
        {
          channels: ['tixyel'], // channels to listen
          isDebug: true, // debug logs
          init: true, // auto init the websocket
        },
        true, // true for emit events to the client
      );
    }
  });

  client.on('message', async (provider, received) => {
    switch (provider) {
      case 'twitch': {
        switch (received.listener) {
          case 'message': {
            logger.received(`Received message event from ${provider}`, received.event);

            const messageHTML = utils.replaceEmotesWithHTML(event.data.text, event.data.emotes);

            let pronoun;

            const pronoun_id = await Alejo.get(event.data.nick);
            if (pronoun_id) pronoun = Alejo.Pronouns.map[pronoun_id];

            break;
          }
        }
        break;
      }
      case 'youtube': {
        switch (received.listener) {
          case 'message': {
            logger.received(`Received message event from ${provider}`, received.event);

            const messageHTML = utils.replaceYoutubeEmotesWithHTML(event.data.text, Simulation.data.youtube_emotes);
            break;
          }
        }
        break;
      }
    }
  });

  client.on('session', (session) => {
    // update goals
  });
</script>
```

### NPM (for TypeScript/Node projects)

It is recommended to install the NPM package to get full type support and autocompletion in your IDE.

```sh
npm install -D @tixyel/streamelements
```

## Why use?

- **Faster widget prototyping**
- **Type safety** for all major platforms
- **No need to upload to StreamElements for every test**

## Status

- Twitch event types: **Stable**
- Youtube event types: **Testing phase**
- Kick event types: **In development**

## Credits

Developed by: Tixyel

## License

Apache 2.0
