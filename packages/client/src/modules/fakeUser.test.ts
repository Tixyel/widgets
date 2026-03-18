import { expect, test } from 'bun:test';

import type { Twitch } from '../types.js';
import { FakeUserPool } from './fakeUser.js';

const badges: Twitch.tags[] = ['vip', 'moderator', 'subscriber', 'founder'];

test('keeps all fixed badges assigned to the same user', () => {
  const pool = new FakeUserPool({
    names: ['Alice'],
    badges,
    fixed: {
      vip: ['Alice'],
      subscriber: ['Alice'],
    },
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toEqual(['vip', 'subscriber']);
  expect(user?.isSubscriber).toBe(true);
  expect(user?.tier).toBeDefined();
});

test('preserves capacity for future fixed badges while filling the minimum per user', () => {
  const pool = new FakeUserPool({
    names: ['alice', 'bob', 'carol'],
    badges,
    minimumBadgesPerUser: 2,
    limits: {
      subscriber: 1,
    },
    fixed: {
      subscriber: ['carol'],
    },
  });

  const alice = pool.getByName('alice');
  const bob = pool.getByName('bob');
  const carol = pool.getByName('carol');

  expect(alice?.badges).toHaveLength(2);
  expect(bob?.badges).toHaveLength(2);
  expect(carol?.badges).toHaveLength(2);
  expect(carol?.badges).toContain('subscriber');
});

test('skips incompatible badges when reaching the minimum per user', () => {
  const pool = new FakeUserPool({
    names: ['alice'],
    badges: ['vip', 'moderator', 'subscriber'],
    minimumBadgesPerUser: 2,
    incompatible: {
      vip: ['moderator'],
    },
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toEqual(['vip', 'subscriber']);
});

test('does not keep fixed badges together when they are marked as incompatible', () => {
  const pool = new FakeUserPool({
    names: ['alice'],
    badges: ['vip', 'moderator', 'subscriber'],
    fixed: {
      vip: ['alice'],
      moderator: ['alice'],
    },
    incompatible: {
      vip: ['moderator'],
    },
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toEqual(['vip']);
});

test('applies default incompatible badges in both directions', () => {
  const pool = new FakeUserPool({
    names: ['alice'],
    badges: ['broadcaster', 'moderator', 'vip', 'subscriber'],
    minimumBadgesPerUser: 2,
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toEqual(['broadcaster', 'subscriber']);
});

test('merges custom incompatible badges with the default map', () => {
  const pool = new FakeUserPool({
    names: ['alice'],
    badges: ['moderator', 'lead_moderator', 'subscriber'],
    minimumBadgesPerUser: 2,
    incompatible: {
      moderator: 'subscriber',
    },
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toEqual(['moderator']);
});

test('caps the generated badges at three even when the minimum is higher', () => {
  const pool = new FakeUserPool({
    names: ['alice'],
    badges: ['vip', 'moderator', 'subscriber', 'founder'],
    minimumBadgesPerUser: 5,
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toHaveLength(3);
  expect(user?.badges).toEqual(['vip', 'moderator', 'subscriber']);
});

test('caps fixed badges at three per user', () => {
  const pool = new FakeUserPool({
    names: ['alice'],
    badges: ['vip', 'moderator', 'subscriber', 'founder'],
    fixed: {
      vip: ['alice'],
      moderator: ['alice'],
      subscriber: ['alice'],
      founder: ['alice'],
    },
  });

  const user = pool.getByName('alice');

  expect(user).not.toBeNull();
  expect(user?.badges).toEqual(['vip', 'moderator', 'subscriber']);
});
