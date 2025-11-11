# Tixyel's streamelements widget client

Tixyel's streamelements widget client is a TypeScript/JavaScript helper library for developing custom widgets for [StreamElements](https://streamelements.com/), with a focus on productivity, type safety, and local development.

## Features

- **Typed event helpers** for Twitch, YouTube, and Kick (in development)
- **Utility functions** for common widget tasks
- **TypeScript types** for all major StreamElements events
- **Local development support**: Test your widget locally without uploading to StreamElements
- **Easy integration**: Use via CDN or as an npm package

## Getting Started

### CDN (for browser usage)

```html
<script src="https://cdn.jsdelivr.net/npm/@tixyel/streamelements/dist/index.umd.js"></script>
<script>
  const { Client } = window.Tixyel;

  new Client({ id: 'my-custom-widget' }).on('load', (data) => {});
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
- Youtube event types: **In development**
- Kick event types: **In development**

## Credits

Developed by: Tixyel

## License

Apache 2.0
