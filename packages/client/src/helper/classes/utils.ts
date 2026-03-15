export class UtilsHelper {
  /**
   * Delays execution for a specified number of milliseconds.
   * @param ms - The number of milliseconds to delay.
   * @returns A Promise that resolves after the specified delay.
   */
  delay<R extends any, M extends number>(ms: M, callback?: () => R): Promise<R | null> {
    return new Promise((resolve) =>
      setTimeout(() => {
        if (callback) {
          const result = callback();
          resolve(result ?? null);
        } else resolve(null);
      }, ms),
    );
  }

  /**
   * Returns typed entries of an object.
   * @param obj - The object to get entries from.
   * @returns An array of key-value pairs from the object.
   */
  typedEntries<K extends string, V>(obj: Record<K, V> | Array<V>): [K, V][] {
    return Object.entries(obj) as [K, V][];
  }

  /**
   * Returns typed values of an object.
   * @param obj - The object to get values from.
   * @returns An array of values from the object.
   */
  typedValues<K extends string, V>(obj: Record<K, V> | Array<V>): V[] {
    return Object.values(obj) as V[];
  }

  /**
   * Returns typed keys of an object.
   * @param obj - The object to get keys from.
   * @returns An array of keys from the object.
   */
  typedKeys<K extends string, V>(obj: Record<K, V> | Array<V>): K[] {
    return Object.keys(obj) as K[];
  }

  /**
   * Selects an item based on weighted probabilities.
   * @param items - An object where keys are items and values are their weights.
   * @returns A randomly selected item based on the given probabilities.
   */
  probability<K extends string, V extends number>(items: Record<K, V>): K | undefined {
    const total = (Object.values(items) as number[]).reduce((acc, val) => acc + val, 0);
    const sorted = this.typedEntries(items).sort((a, b) => b[1] - a[1]);
    const rand = Math.random() * total;

    let cumulative = 0;

    for (const [item, weight] of sorted) {
      cumulative += weight;

      if (rand < cumulative) {
        return item;
      }
    }

    return undefined;
  }
}
