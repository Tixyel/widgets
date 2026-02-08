import { test, expect } from 'bun:test';
import { Helper } from '../index.js';

const { random } = Helper;

test('Random number generation within specified range', () => {
  const min = 5;
  const max = 15;

  for (let i = 0; i < 100; i++) {
    const num = random.number(min, max);
    expect(num).toBeGreaterThanOrEqual(min);
    expect(num).toBeLessThanOrEqual(max);
  }
});

test('Random number generation with float precision', () => {
  const min = 1;
  const max = 2;
  const float = 3;

  for (let i = 0; i < 100; i++) {
    const num = random.number(min, max, float);
    expect(num).toBeGreaterThanOrEqual(min);
    expect(num).toBeLessThanOrEqual(max);
    const decimalPart = num.toString().split('.')[1];
    if (decimalPart) expect(decimalPart.length).toBeLessThanOrEqual(float);
  }
});

test('Random boolean generation with threshold', () => {
  const threshold = 0.7;

  let trueCount = 0;
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    if (random.boolean(threshold)) {
      trueCount++;
    }
  }

  const trueRatio = trueCount / iterations;

  expect(trueRatio).toBeLessThanOrEqual(0.6);
});

test('Random boolean generation with extreme thresholds', () => {
  for (let i = 0; i < 1000; i++) {
    expect(random.boolean(0)).toBe(true);
  }
});

test('Random string generation of specified length', () => {
  const length = 10;
  const randStr = random.string(length);

  expect(randStr).toHaveLength(length);
});

test('Random string generation with custom characters', () => {
  const length = 8;
  const chars = 'ABC123';
  const randStr = random.string(length, chars);

  for (const char of randStr) {
    expect(chars).toContain(char);
  }
});

test('Random string generation with empty character set', () => {
  const length = 5;
  const chars = '';
  const randStr = random.string(length, chars);

  expect(randStr).toBe('');
});

test('Random number generation with min greater than max', () => {
  const min = 20;
  const max = 10;

  for (let i = 0; i < 100; i++) {
    const num = random.number(min, max);
    expect(num).toBeGreaterThanOrEqual(max);
    expect(num).toBeLessThanOrEqual(min);
  }
});

test('Random number generation with negative range', () => {
  const min = -10;
  const max = -1;

  for (let i = 0; i < 100; i++) {
    const num = random.number(min, max);
    expect(num).toBeGreaterThanOrEqual(min);
    expect(num).toBeLessThanOrEqual(max);
  }
});

test('Random number generation with zero range', () => {
  const min = 5;
  const max = 5;

  for (let i = 0; i < 10; i++) {
    const num = random.number(min, max);
    expect(num).toBe(5);
  }
});

test('Random array element selection', () => {
  const arr = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
  const seen = new Set<string>();

  for (let i = 0; i < 1000; i++) {
    const [element, index] = random.array(arr);
    expect(arr).toContain(element);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(arr.length);
    seen.add(element);
  }

  expect(seen.size).toBe(arr.length);
});

test('Random hexadecimal color string generation', () => {
  const randColor = random.color('hex');

  expect(randColor).toMatch(/^#([0-9A-Fa-f]{6})$/);
});

test('Random hexadecimal color with alpha channel generation', () => {
  const randColor = random.color('hexa');

  expect(randColor).toMatch(/^#([0-9A-Fa-f]{8})$/);
});

test('Random rgb color string generation', () => {
  const randColor = random.color('rgb');

  expect(randColor).toMatch(/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/);
});

test('Random rgba color string with alpha channel generation', () => {
  const randColor = random.color('rgba');

  expect(randColor).toMatch(/^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (0|0?\.\d+|1(\.0)?)\)$/);
});

test('Random date generation within specified range', () => {
  const start = new Date('2020-01-01').getTime();
  const end = new Date('2022-01-01').getTime();

  for (let i = 0; i < 100; i++) {
    const randDate = random.date(new Date(start), new Date(end));
    expect(randDate.getTime()).toBeGreaterThanOrEqual(start);
    expect(randDate.getTime()).toBeLessThanOrEqual(end);
  }
});

test('Random date generation with default range', () => {
  const defaultStart = new Date(2000, 0, 1).getTime();
  const defaultEnd = new Date().getTime();

  for (let i = 0; i < 100; i++) {
    const randDate = random.date();
    expect(randDate.getTime()).toBeGreaterThanOrEqual(defaultStart);
    expect(randDate.getTime()).toBeLessThanOrEqual(defaultEnd);
  }
});

test('Random date generation with start date after end date', () => {
  const start = new Date('2022-01-01').getTime();
  const end = new Date('2020-01-01').getTime();

  for (let i = 0; i < 100; i++) {
    const randDate = random.date(new Date(start), new Date(end));
    expect(randDate.getTime()).toBeGreaterThanOrEqual(end);
    expect(randDate.getTime()).toBeLessThanOrEqual(start);
  }
});

test('Random date generation with identical start and end dates', () => {
  const date = new Date('2021-06-15');

  for (let i = 0; i < 10; i++) {
    const randDate = random.date(date, date);
    expect(randDate.getTime()).toBe(date.getTime());
  }
});

test('Random date generation around leap year date', () => {
  const start = new Date('2019-12-31').getTime();
  const end = new Date('2020-03-01').getTime();

  let foundFeb29 = false;
  for (let i = 0; i < 1000; i++) {
    const randDate = random.date(new Date(start), new Date(end));
    if (randDate.getMonth() === 1 && randDate.getDate() === 29) {
      foundFeb29 = true;
      break;
    }
  }

  expect(foundFeb29).toBe(true);
});

test('Random date generation with far past and future dates', () => {
  const start = new Date('1900-01-01').getTime();
  const end = new Date('2100-12-31').getTime();

  for (let i = 0; i < 100; i++) {
    const randDate = random.date(new Date(start), new Date(end));
    expect(randDate.getTime()).toBeGreaterThanOrEqual(start);
    expect(randDate.getTime()).toBeLessThanOrEqual(end);
  }
});

test('Random date offset generation', () => {
  const daysAgo = 10;
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const isoDate = random.daysOffset(daysAgo);
    const date = new Date(isoDate);
    const pastLimit = now - daysAgo * 24 * 60 * 60 * 1000;
    expect(date.getTime()).toBeGreaterThanOrEqual(pastLimit);
    expect(date.getTime()).toBeLessThanOrEqual(now);
  }
});

test('Generate a random UUID v4 string', () => {
  const uuid = random.uuid();
  expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
