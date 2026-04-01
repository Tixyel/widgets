import { test, expect } from 'bun:test';

import { generate } from '../../local/generator.js';
import { StreamElements, TwitchEvents } from '../../types.js';
import { EventHelper } from './event.js';

const parseProvider = new EventHelper().parseProvider;

test('Verify if the provider is correctly parsed', async () => {
  const event = await generate.event.onEventReceived('twitch', 'event', {
    type: 'channelPointsRedemption',
  });

  if (!event) {
    throw new Error('Failed to generate event');
  }

  const result = parseProvider(event);

  expect(result.provider).toBe('twitch');
});
