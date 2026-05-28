import { test, expect } from 'bun:test';

import { Helper } from '../index.js';

const { utils } = Helper;
const { delay, typedEntries, probability } = utils;

test('delay should wait for the specified time', async () => {
  const start = Date.now();
  await delay(1001);
  const end = Date.now();
  expect(end - start).toBeGreaterThanOrEqual(1000);
});

test('typedEntries should return typed entries of an object', () => {
  const obj = { a: 1, b: 2, c: '3' };
  const entries = typedEntries(obj);
  expect(entries).toEqual([
    ['a', 1],
    ['b', 2],
    ['c', '3'],
  ]);
});

test('probability should select items based on weights', () => {
  const items = { apple: 1, banana: 2, cherry: 3 };

  const results: Record<string, number> = { apple: 0, banana: 0, cherry: 0 };
  const iterations = 10000;

  for (let i = 0; i < iterations; i++) {
    const selected = probability(items);
    if (selected) {
      results[selected]++;
    }
  }

  expect(results.apple).toBeLessThan(results.banana);
  expect(results.banana).toBeLessThan(results.cherry);
});
