import { css_color_names } from '../../data/collection/css.js';

const functions = {
  /**
   * Generate random color
   * @param type - Color format
   * @returns - Random color in specified format
   * @example
   * ```javascript
   * const hexColor = random.color('hex');
   * console.log(hexColor); // e.g. #3e92cc
   *
   * const rgbColor = random.color('rgb');
   * console.log(rgbColor); // e.g. rgb(62, 146, 204)
   * ```
   */
  color(type: 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-color-name' = 'hex') {
    switch (type) {
      default:
      case 'hex': {
        return `#${Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, '0')}`;
      }
      case 'hexa': {
        const hex = `#${Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, '0')}`;

        const alpha = Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0');

        return hex + alpha;
      }
      case 'rgb': {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        return `rgb(${r}, ${g}, ${b})`;
      }
      case 'rgba': {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = Math.random().toFixed(2);

        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      case 'hsl': {
        const h = Math.floor(Math.random() * 361);
        const s = Math.floor(Math.random() * 101);
        const l = Math.floor(Math.random() * 101);

        return `hsl(${h}, ${s}%, ${l}%)`;
      }
      case 'hsla': {
        const h = Math.floor(Math.random() * 361);
        const s = Math.floor(Math.random() * 101);
        const l = Math.floor(Math.random() * 101);
        const a = Math.random().toFixed(2);

        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
      }
      case 'css-color-name': {
        var names = css_color_names;

        return this.array(names)[0];
      }
    }
  },

  /**
   * Generate random number
   * @param min - Minimum value
   * @param max - Maximum value
   * @param float - Number of decimal places (0 for integer)
   * @returns - Random number
   * @example
   * ```javascript
   * const intNumber = random.number(1, 10);
   * console.log(intNumber); // e.g. 7
   *
   * const floatNumber = random.number(1, 10, 2);
   * console.log(floatNumber); // e.g. 3.14
   * ```
   */
  number(min: number, max: number, float: number = 0): number {
    if (min > max) [min, max] = [max, min];

    const rand = Math.random() * (max - min) + min;
    return float ? Number(rand.toFixed(float)) : Math.round(rand);
  },

  /**
   * Generate random boolean
   * @param threshold - Threshold between 0 and 1
   * @returns - Random boolean
   * @example
   * ```javascript
   * const boolValue = random.boolean(0.7);
   * console.log(boolValue); // e.g. true (70% chance)
   * ```
   */
  boolean(threshold: number = 0.5): boolean {
    return Math.random() > threshold;
  },

  /**
   * Generate random string
   * @param length - Length of the string
   * @param chars - Characters to use
   * @returns - Random string
   * @example
   * ```javascript
   * const randString = random.string(10);
   * console.log(randString); // e.g. "aZ3bT9xYqP"
   * ```
   */
  string(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  },

  /**
   * Pick random element from array
   * @param arr - Array to pick from
   * @returns - Random element and its index
   * @example
   * ```javascript
   * const [element, index] = random.array(['apple', 'banana', 'cherry']);
   * console.log(element, index); // e.g. "banana", 1
   * ```
   */
  array<T>(arr: T[]): [value: T, index: number] {
    const index = this.number(0, arr.length - 1);

    return [arr[index], index];
  },

  /**
   * Generate random date
   * @param start - Start date
   * @param end - End date
   * @returns - Random date between start and end
   * @example
   * ```javascript
   * const randDate = random.date(new Date(2020, 0, 1), new Date());
   * console.log(randDate); // e.g. 2022-05-15T10:30:00.000Z
   * ```
   */
  date(start: Date = new Date(2000, 0, 1), end: Date = new Date()): Date {
    const date = new Date(this.number(start.getTime(), end.getTime()));

    return date;
  },

  /**
   * Generate ISO date string offset by days
   * @param daysAgo - Number of days to go back
   * @returns - ISO date string
   * @example
   * ```javascript
   * const isoDate = random.daysOffset(7);
   * console.log(isoDate); // e.g. "2024-06-10T14:23:45.678Z"
   *
   * const isoDate30 = random.daysOffset(30);
   * console.log(isoDate30); // e.g. "2024-05-18T09:15:30.123Z"
   * ```
   */
  daysOffset(daysAgo: number): string {
    const now = Date.now();
    const past = now - this.number(0, daysAgo * 24 * 60 * 60 * 1000);

    return new Date(past).toISOString();
  },

  /**
   * Generate UUID v4
   * @returns - UUID string
   * @example
   * ```javascript
   * const uuid = random.uuid();
   * console.log(uuid); // e.g. "3b12f1df-5232-4e3a-9a0c-3f9f1b1b1b1b"
   * ```
   */
  uuid(): string {
    return crypto.randomUUID();
  },
};

export default functions;
