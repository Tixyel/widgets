# @tixyel/streamelements

TypeScript/JavaScript helper library for building custom widgets for [StreamElements](https://streamelements.com/), focused on productivity, type safety, and local development. Designed for browser usage via CDN, with TypeScript types for IDE autocompletion.

## Features

- **Typed event helpers** for Twitch, YouTube, and Kick (in development)
- **Utility functions** for common widget tasks
- **TypeScript types** for all major StreamElements events
- **Local development support**: Test your widget locally without uploading to StreamElements
- **Easy integration**: Use directly in the browser via CDN

## Usage

Add the following to your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@tixyel/streamelements"></script>
<script>
  const { Client, Simulation, logger } = window.Tixyel;

  new Client({ id: 'my-widget' }).on('load', (event) => {
    logger.received('Widget loaded!', event);
  });
</script>
```

> **Note:** This package is designed for browser usage via CDN only.
> TypeScript is used only to provide type definitions and autocompletion in your IDE when working with `window.Tixyel`.

## API Overview

- **Client**: Manages events and integration with StreamElements.
- **Simulation**: Simulates events for local testing.
- **Logger**: Utility for formatted logs.
- **Button/Command**: Helpers for custom actions.

## License

Apache-2.0
