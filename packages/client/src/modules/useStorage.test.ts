import { expect, test } from 'bun:test';

import { ObjectHelper } from '../helper/classes/object.js';
import { useStorage } from './useStorage.js';

const object = new ObjectHelper();

test('Use storage updating correctly', () => {
  const obj = { a: { value: 1 }, b: { value: 2, ba: { value: 3 } } };

  object.updateViaPath(obj, 'b.value', 34);

  expect(obj).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 3 } } });

  object.updateViaPath(obj, 'b.ba.value', 56);

  expect(obj).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 56 } } });
});

test('setByPath should return the changed object', () => {
  const obj = { a: { value: 1 }, b: { value: 2, ba: { value: 3 } } };

  const result = object.updateViaPath(obj, 'b.value', 34);

  expect(result).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 3 } } });
});

test('use storage adding correctly', () => {
  const storage = new useStorage({
    id: 'abc',
    data: {
      a: { value: 1 },
      b: { value: 2, ba: { value: 3 } },
    },
  });

  // Ensure save() path runs so the update event can be emitted.
  (storage as any).SE_API = {
    store: {
      set: () => {},
    },
  };

  let updateCalls = 0;

  storage.on('update', (data, from) => {
    updateCalls += 1;
    expect(data).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 3 } } });
    expect(from).toBe('internal:add');
  });

  storage.loaded = true;

  storage.add('b.value', 34);

  expect(storage.data).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 3 } } });
  expect(updateCalls).toBe(1);
});

test('add should not change data when storage is not loaded', () => {
  const storage = new useStorage({
    id: 'abc',
    data: {
      a: { value: 1 },
      b: { value: 2, ba: { value: 3 } },
    },
  });

  storage.on('load', () => {
    storage.add('b.value', 34);

    expect(storage.data).toEqual({ a: { value: 1 }, b: { value: 34, ba: { value: 3 } } });
  });
});

test('updateViaPath should create missing nested objects', () => {
  const obj = { a: {} } as Record<string, any>;

  const result = object.updateViaPath(obj as any, 'a.deep.value' as any, 10 as any, true);

  expect(obj).toEqual({ a: { deep: { value: 10 } } });
  expect(result).toBe(obj);
});

test('update should emit once and persist when data changes', () => {
  const storage = new useStorage({
    id: 'abc',
    data: {
      a: { value: 1 },
      b: { value: 2, ba: { value: 3 } },
    },
  });

  let persisted = 0;
  let updates = 0;

  (storage as any).SE_API = {
    store: {
      set: () => {
        persisted += 1;
      },
    },
  };

  storage.on('update', (data, from) => {
    updates += 1;
    expect(data).toEqual({ a: { value: 9 }, b: { value: 2, ba: { value: 3 } } });
    expect(from).toBe('internal:update');
  });

  storage.loaded = true;

  storage.update({ a: { value: 9 } });

  expect(storage.data).toEqual({ a: { value: 9 }, b: { value: 2, ba: { value: 3 } } });
  expect(persisted).toBe(1);
  expect(updates).toBe(1);
});

test('update should not emit when data is unchanged', () => {
  const storage = new useStorage({
    id: 'abc',
    data: {
      a: { value: 1 },
      b: { value: 2, ba: { value: 3 } },
    },
  });

  let updates = 0;

  (storage as any).SE_API = {
    store: {
      set: () => {},
    },
  };

  storage.on('update', (data, from) => {
    updates += 1;
    expect(from).toBe('internal:update');
  });

  storage.loaded = true;

  storage.update(storage.data);

  expect(updates).toBe(0);
});

test('on load should call immediately when already loaded', () => {
  const storage = new useStorage({
    id: 'abc',
    data: {
      a: { value: 1 },
      b: { value: 2, ba: { value: 3 } },
    },
  });

  storage.loaded = true;

  let loadCalls = 0;

  storage.on('load', (data) => {
    loadCalls += 1;
    expect(data).toEqual({ a: { value: 1 }, b: { value: 2, ba: { value: 3 } } });
  });

  expect(loadCalls).toBe(1);
});
