import { test, expect } from 'bun:test';

import { generate } from '../../local/generator.js';
import { EventHelper } from './event.js';

test('Verify if the provider is correctly parsed', async () => {
  const event = await generate.event.onEventReceived('twitch', 'event', {
    type: 'channelPointsRedemption',
  });

  if (!event) {
    throw new Error('Failed to generate event');
  }

  const result = new EventHelper().parseProvider(event);

  expect(result.provider).toBe('twitch');
});
