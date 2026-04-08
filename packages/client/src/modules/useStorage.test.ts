import { expect, test } from 'bun:test';

import { useStorage } from './useStorage.js';

test('Use storage updating correctly', () => {
  const obj = { a: { value: 1 }, b: { value: 2, ba: { value: 3 } } };

  useStorage.setByPath(obj, 'b.value', 34);

  expect(obj).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 3 } } });

  useStorage.setByPath(obj, 'b.ba.value', 56);

  expect(obj).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 56 } } });
});
