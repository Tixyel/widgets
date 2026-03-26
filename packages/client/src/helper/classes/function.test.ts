import { test, expect, describe } from 'bun:test';

import { Helper } from '../index.js';

const { fn } = Helper;

describe('apply', () => {
  test('should call a function with the provided thisArg and argument array', () => {
    const context = { base: 10 };

    function sum(this: typeof context, valueA: number, valueB: number) {
      return this.base + valueA + valueB;
    }

    expect(fn.apply(sum, context, [5, 7])).toBe(22);
  });

  test('should support calling functions with no arguments', () => {
    const context = { label: 'helper' };

    function readLabel(this: typeof context) {
      return this.label;
    }

    expect(fn.apply(readLabel, context, [])).toBe('helper');
  });
});

describe('call', () => {
  test('should call a function with the provided thisArg and variadic arguments', () => {
    const context = { prefix: 'SE' };

    function join(this: typeof context, left: string, right: string) {
      return `${this.prefix}:${left}-${right}`;
    }

    expect(fn.call(join, context, 'foo', 'bar')).toBe('SE:foo-bar');
  });

  test('should preserve this binding when mutating the context object', () => {
    const context = { count: 0 };

    function increment(this: typeof context, amount: number) {
      this.count += amount;
      return this.count;
    }

    expect(fn.call(increment, context, 3)).toBe(3);
    expect(fn.call(increment, context, 2)).toBe(5);
    expect(context.count).toBe(5);
  });
});
