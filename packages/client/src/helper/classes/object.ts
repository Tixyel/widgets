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
}
