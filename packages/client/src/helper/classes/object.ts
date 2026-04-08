import { PathValue } from '../../types.js';

export class ObjectHelper {
  /**
   * Flattens a nested object into a single-level object with dot-separated keys.
   * @param obj - The nested object to be flattened.
   * @param prefix  - The prefix to be added to each key (used for recursion).
   * @returns A flattened object with dot-separated keys.
   * @example
   * ```javascript
   * const nestedObj = { a: { b: 1, c: { d: 2 } }, e: [3, 4] };
   * const flatObj = flatten(nestedObj);
   * console.log(flatObj);
   * // Output: { 'a.b': '1', 'a.c.d': '2', 'e:0': '3', 'e:1': '4' }
   * ```
   */
  flatten(
    obj: Record<string, any>,
    stringify: boolean = true,
    prefix: string = '',
  ): Record<string, typeof stringify extends true ? string : string | number | boolean> {
    const result = {} as Record<
      string,
      typeof stringify extends true ? string : string | number | boolean
    >;

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;

      // Handle null and undefined
      if (value === null || value === undefined) {
        result[path] = String(value);

        continue;
      }

      if (typeof value === 'number' && isNaN(value)) {
        result[path] = 'NaN';

        continue;
      }

      if (typeof value === 'number' && !isNaN(value)) {
        result[path] = stringify ? String(value) : value;

        continue;
      }

      // Handle Date objects
      if (value instanceof Date) {
        result[path] = value.toISOString();

        continue;
      }

      // Handle Map objects
      if (value instanceof Map) {
        value.forEach((v, k) => {
          result[`${path}.${k}`] = JSON.stringify(v);
        });

        continue;
      }

      // Handle Array objects
      if (Array.isArray(value)) {
        value.forEach((v, i) => {
          const itemPath = `${path}:${i}`;

          if (typeof v === 'object') {
            Object.assign(result, this.flatten(v, stringify, itemPath));
          } else {
            result[itemPath] = stringify ? String(v) : v;
          }
        });

        continue;
      }

      // Handle nested objects
      if (typeof value === 'object') {
        Object.assign(result, this.flatten(value, stringify, path));
        continue;
      }

      // Handle primitive values (string, number, boolean, etc.)
      result[path] = String(value);
    }

    return result;
  }

  /**
   * Returns the entries of an object as an array of key-value pairs, with proper typing.
   * @param obj - The object to retrieve entries from.
   * @returns An array of key-value pairs from the object, typed as an array of tuples with key and value types.
   */
  entries<K extends string, V>(obj: Record<K, V>): [K, V][] {
    return Object.entries(obj) as [K, V][];
  }

  /**
   * Returns the values of an object as an array, with proper typing.
   * @param obj - The object to retrieve values from.
   * @returns An array of values from the object, typed as an array of the value type.
   */
  values<K extends string, V>(obj: Record<K, V>): V[] {
    return Object.values(obj) as V[];
  }

  /**
   * Returns the keys of an object as an array of strings, with proper typing.
   * @param obj - The object to retrieve keys from.
   * @returns An array of keys from the object, typed as an array of strings.
   */
  keys<K extends string, V>(obj: Record<K, V>): K[] {
    return Object.keys(obj) as K[];
  }

  /**
   * Updates a value in a nested object at the specified path, with an option to create missing intermediate objects.
   * @param obj - The target object to update.
   * @param path - The path to the property being updated.
   * @param value - The value to set at the specified path.
   * @param createMissing - Whether to create missing intermediate objects along the path if they don't exist.
   * @returns The updated object with the new value set at the specified path.
   * @example
   * ```javascript
   * const obj1 = { a: { b: 1 }, c: 2 };
   * updateViaPath(obj1, 'a.d', 9999, false);
   * console.log(obj1);
   * // Output: { a: { b: 1, d: 9999 }, c: 2 }
   *
   * const obj2 = { a: { b: 1 }, c: 2 };
   * updateViaPath(obj2, 'a.e.f', 8888, true);
   * console.log(obj2);
   * // Output: { a: { b: 1, e: { f: 8888 } }, c: 2 }
   * ```
   * @returns The updated object with the new value set at the specified path.
   */
  updateViaPath<P extends string, T extends object>(
    obj: T,
    path: P,
    value: PathValue<T, P>,
    createMissing: boolean = false,
  ): T {
    const keys = path.split('.');
    let current: any = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof current[keys[i]] !== 'object' || current[keys[i]] == null) {
        if (createMissing) {
          current[keys[i]] = {};
        } else {
          throw new Error(`Path ${keys.slice(0, i + 1).join('.')} does not exist in the object.`);
        }
      }

      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;

    return obj;
  }

  /**
   * Compares two values for differences, with an option to use JSON stringification for comparison.
   * @param a - The first value to compare.
   * @param b - The second value to compare.
   * @param method - The method to use for comparison, either 'json' for JSON stringification or 'default' for a recursive comparison.
   * @returns A boolean indicating whether the two values are different based on the specified comparison method.
   */
  isDiff(a: any, b: any, method: 'json' | 'default' = 'default'): boolean {
    if (method === 'json') {
      return JSON.stringify(a) !== JSON.stringify(b);
    }

    if (Object.is(a, b)) return false;

    if (typeof a !== typeof b) return true;

    if (a == null || b == null) return a !== b;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() !== b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return true;

      for (let i = 0; i < a.length; i++) {
        if (this.isDiff(a[i], b[i], method)) {
          return true;
        }
      }

      return false;
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);

      if (aKeys.length !== bKeys.length) return true;
      for (const key of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || this.isDiff(a[key], b[key], method)) {
          return true;
        }
      }
      return false;
    }

    return a !== b;
  }
}
