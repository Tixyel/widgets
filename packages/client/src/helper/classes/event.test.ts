import { test, expect } from 'bun:test';

import { StreamElements, TwitchEvents } from '../../types.js';
import { EventHelper } from './event.js';

const parseProvider = new EventHelper().parseProvider;

test('Verify if the provider is correctly parsed', () => {
  const result = parseProvider({
    listener: 'event',
    event: {
      type: 'channelPointsRedemption',
      data: {
        amount: 100,
        username: 'johndoe',
        displayName: 'JohnDoe',
        providerId: 'provider123',
        avatar: 'https://example.com/avatar.jpg',
        message: 'Redeemed 100 points!',
        quantity: 1,
        redemption: 'Drink water',
      },
      _id: '123456789',
      provider: 'twitch',
      flagged: false,
      channel: 'example_channel',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      activityId: 'activity123',
      sessionEventsCount: 1,
      isMock: true,
    },
  } as TwitchEvents.Event.Data);

  expect(result.provider).toBe('twitch');
});
