import { test, expect } from 'bun:test';

import { Helper } from '../index.js';

const { object } = Helper;

test('Flatten nested objects with stringify=true', () => {
  const nestedObject = {
    user: {
      name: 'Alice',
      address: { street: '123 Main St', city: 'Wonderland' },
    },
    age: 30,
    tags: ['friend', 'colleague', true, 99],
  };

  const flattened = object.flatten(nestedObject, true);

  expect(flattened).toEqual({
    'user.name': 'Alice',
    'user.address.street': '123 Main St',
    'user.address.city': 'Wonderland',
    'age': '30',
    'tags:0': 'friend',
    'tags:1': 'colleague',
    'tags:2': 'true',
    'tags:3': '99',
  });
});

test('Flatten nested objects with stringify=false', () => {
  const nestedObject = {
    user: {
      name: 'Alice',
      address: { street: '123 Main St', city: 'Wonderland' },
    },
    age: 30,
    tags: ['friend', 'colleague', true, 99],
  };

  const flattened = object.flatten(nestedObject, false);

  expect(flattened).toEqual({
    'user.name': 'Alice',
    'user.address.street': '123 Main St',
    'user.address.city': 'Wonderland',
    'age': 30,
    'tags:0': 'friend',
    'tags:1': 'colleague',
    'tags:2': true,
    'tags:3': 99,
  });
});

test('isDiff should handle null values safely', () => {
  expect(object.isDiff(null, null)).toBe(false);
  expect(object.isDiff(null, {})).toBe(true);
});

test('isDiff should compare arrays deeply', () => {
  expect(object.isDiff([1, { a: 2 }], [1, { a: 2 }])).toBe(false);
  expect(object.isDiff([1, { a: 2 }], [1, { a: 3 }])).toBe(true);
});

test('isDiff should compare Date values by timestamp', () => {
  expect(object.isDiff(new Date('2024-01-01'), new Date('2024-01-01'))).toBe(false);
  expect(object.isDiff(new Date('2024-01-01'), new Date('2024-01-02'))).toBe(true);
});

test('isDiff should treat NaN values as equal', () => {
  expect(object.isDiff(NaN, NaN)).toBe(false);
});
