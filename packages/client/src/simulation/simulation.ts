import type { Provider } from '../types/client.js';
import { Alejo } from '../types/alejo.js';
import { names, messages, avatars, emotes, badges, tts, items, tiers } from './data/index.js';
import { type BadgeOptions, findEmotesInText, generateBadges, replaceEmotesWithHTML } from '../utils/Message.js';
import { StreamElements } from '../types/streamelements/main.js';

export namespace Simulation {
  export const data = {
    names,
    messages,
    tiers,
    avatars,
    emotes,
    badges,
    items,
    tts,
    pronouns: Alejo.Pronouns.map,
    css_color_names: [
      'aliceblue',
      'antiquewhite',
      'aqua',
      'aquamarine',
      'azure',
      'beige',
      'bisque',
      'black',
      'blanchedalmond',
      'blue',
      'blueviolet',
      'brown',
      'burlywood',
      'cadetblue',
      'chartreuse',
      'chocolate',
      'coral',
      'cornflowerblue',
      'cornsilk',
      'crimson',
      'cyan',
      'darkblue',
      'darkcyan',
      'darkgoldenrod',
      'darkgray',
      'darkgreen',
      'darkgrey',
      'darkkhaki',
      'darkmagenta',
      'darkolivegreen',
      'darkorange',
      'darkorchid',
      'darkred',
      'darksalmon',
      'darkseagreen',
      'darkslateblue',
      'darkslategray',
      'darkslategrey',
      'darkturquoise',
      'darkviolet',
      'deeppink',
      'deepskyblue',
      'dimgray',
      'dimgrey',
      'dodgerblue',
      'firebrick',
      'floralwhite',
      'forestgreen',
      'fuchsia',
      'gainsboro',
      'ghostwhite',
      'gold',
      'goldenrod',
      'gray',
      'green',
      'greenyellow',
      'grey',
      'honeydew',
      'hotpink',
      'indianred',
      'indigo',
      'ivory',
      'khaki',
      'lavender',
      'lavenderblush',
      'lawngreen',
      'lemonchiffon',
      'lightblue',
      'lightcoral',
      'lightcyan',
      'lightgoldenrodyellow',
      'lightgray',
      'lightgreen',
      'lightgrey',
      'lightpink',
      'lightsalmon',
      'lightseagreen',
      'lightskyblue',
      'lightslategray',
      'lightslategrey',
      'lightsteelblue',
      'lightyellow',
      'lime',
      'limegreen',
      'linen',
      'magenta',
      'maroon',
      'mediumaquamarine',
      'mediumblue',
      'mediumorchid',
      'mediumpurple',
      'mediumseagreen',
      'mediumslateblue',
      'mediumspringgreen',
      'mediumturquoise',
      'mediumvioletred',
      'midnightblue',
      'mintcream',
      'mistyrose',
      'moccasin',
      'navajowhite',
      'navy',
      'oldlace',
      'olive',
      'olivedrab',
      'orange',
      'orangered',
      'orchid',
      'palegoldenrod',
      'palegreen',
      'paleturquoise',
      'palevioletred',
      'papayawhip',
      'peachpuff',
      'peru',
      'pink',
      'plum',
      'powderblue',
      'purple',
      'rebeccapurple',
      'red',
      'rosybrown',
      'royalblue',
      'saddlebrown',
      'salmon',
      'sandybrown',
      'seagreen',
      'seashell',
      'sienna',
      'silver',
      'skyblue',
      'slateblue',
      'slategray',
      'slategrey',
      'snow',
      'springgreen',
      'steelblue',
      'tan',
      'teal',
      'thistle',
      'tomato',
      'turquoise',
      'violet',
      'wheat',
      'white',
      'whitesmoke',
      'yellow',
      'yellowgreen',
      'transparent',
    ],
  };

  export const color = {
    /**
     * Generate opacity hex value
     * @param opacity - Opacity value from 0 to 100
     * @param color - Hex color code
     * @returns - Hex color code with opacity
     */
    opacity(opacity: number = 100, color: string = '') {
      color = color.length > 7 ? color?.substring(0, 6) : color;
      opacity = opacity > 1 ? opacity / 100 : opacity;

      let result = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
        .toString(16)
        .toLowerCase()
        .padStart(2, '0');

      return color + result;
    },

    /**
     * Extract color and opacity from hex code
     * @param hex - Hex color code
     * @returns - Object with color and opacity
     */
    extract(hex: string) {
      if (!hex.startsWith('#') || hex.length <= 7) {
        return {
          color: hex,
          opacity: 100,
        };
      }

      var color = hex.slice(-2);
      var decimal = parseInt(color, 16) / 255;
      var percentage = Math.round(decimal * 100);
      var color = hex.length > 7 ? hex.slice(0, 7) : hex;

      return {
        color: color,
        opacity: percentage,
      };
    },

    validate(str: string) {
      if (typeof str !== 'string' || !String(str).trim().length) return false;

      const s = str.trim();

      // HEX (#FFF, #FFFFFF, #FFFFFFFF)
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(s) || /^#([A-Fa-f0-9]{4}|[A-Fa-f0-9]{8})$/.test(s)) {
        return 'hex';
      }

      // rgb(255, 255, 255)
      if (/^rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)$/.test(s)) {
        return 'rgb';
      }

      // rgba(255, 255, 255, 0.5)
      if (/^rgba\(\s*(?:\d{1,3}\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)$/.test(s)) {
        return 'rgba';
      }

      // hsl(360, 100%, 100%)
      if (/^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/.test(s)) {
        return 'hsl';
      }

      // hsla(360, 100%, 100%, 0.5)
      if (/^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)$/.test(s)) {
        return 'hsla';
      }

      if (data.css_color_names.includes(s.toLowerCase())) {
        return 'css-color-name';
      }

      return false;
    },
  };

  export const rand = {
    /**
     * Generate random color
     * @param type - Color format
     * @returns - Random color in specified format
     * @example
     * ```javascript
     * const hexColor = Simulation.rand.color('hex');
     * console.log(hexColor); // e.g. #3e92cc
     *
     * const rgbColor = Simulation.rand.color('rgb');
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
          var names = data.css_color_names;

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
     * const intNumber = Simulation.rand.number(1, 10);
     * console.log(intNumber); // e.g. 7
     *
     * const floatNumber = Simulation.rand.number(1, 10, 2);
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
     * const boolValue = Simulation.rand.boolean(0.7);
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
     * const randString = Simulation.rand.string(10);
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
     * const [element, index] = Simulation.rand.array(['apple', 'banana', 'cherry']);
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
     * const randDate = Simulation.rand.date(new Date(2020, 0, 1), new Date());
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
     * const isoDate = Simulation.rand.daysOffset(7);
     * console.log(isoDate); // e.g. "2024-06-10T14:23:45.678Z"
     *
     * const isoDate30 = Simulation.rand.daysOffset(30);
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
     * const uuid = Simulation.rand.uuid();
     * console.log(uuid); // e.g. "3b12f1df-5232-4e3a-9a0c-3f9f1b1b1b1b"
     * ```
     */
    uuid(): string {
      return window.crypto && typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
            (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
          );
    },
  };

  type Modifier = (value: string, param: string | null | undefined, values: { amount?: number; count?: number }) => string;

  export const string = {
    /**
     * Replaces occurrences in a string based on a pattern with the result of an asynchronous callback function.
     * @param string - The input string to perform replacements on.
     * @param pattern - The pattern to match in the string (can be a string or a regular expression).
     * @param callback - An asynchronous callback function that takes the matched substring and any captured groups as arguments and returns the replacement string.
     * @returns A promise that resolves to the modified string with replacements applied.
     * @example
     * ```javascript
     * const result = await Simulation.string.replace("Hello World", /World/, async (match) => {
     *   return await fetchSomeData(match); // Assume this function fetches data asynchronously
     * });
     * console.log(result); // Output will depend on the fetched data
     * ```
     */
    async replace(string: string, pattern: string, callback: (match: string, ...groups: string[]) => Promise<string> | string): Promise<string> {
      const promises: Array<Promise<string>> = [];

      string.replace(pattern, (match: string, ...groups: string[]) => {
        const promise = typeof callback === 'function' ? callback(match, ...groups) : match;

        promises.push(Promise.resolve(promise));

        return match;
      });

      const replacements = await Promise.all(promises);

      return string.replace(pattern, () => replacements.shift() ?? '');
    },

    /**
     * Capitalizes the first letter of a given string.
     * @param string - The input string to be capitalized.
     * @returns The capitalized string.
     * @example
     * ```javascript
     * const result = Simulation.string.capitalize("hello world");
     * console.log(result); // Output: "Hello world"
     * ```
     */
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * Composes a template string by replacing placeholders with corresponding values and applying optional modifiers.
     * @param template - The template string containing placeholders in the format {key} and optional modifiers in the format [MODIFIER:param=value].
     * @param values - An object containing key-value pairs to replace the placeholders in the template.
     * @param options - Optional settings for the composition process.
     * @returns The composed string with placeholders replaced and modifiers applied.
     * @example
     * ```javascript
     * const template = "Hello, {username}! You have {amount} [UPPERCASE=messages] and your name is [CAPITALIZE=name].";
     * const values = { username: "john_doe", amount: 5, name: "john" };
     * const result = Simulation.string.compose(template, values);
     * console.log(result); // Output: "Hello, john_doe! You have 5 MESSAGES and your name is John."
     * ```
     */
    compose(
      template: string,
      values: Record<string, any> = {},
      options: {
        method?: 'loop' | 'index';
        html?: boolean;
        modifiers?: Record<string, Modifier>;
        aliases?: Record<string, string[]>;
      } = {
        method: 'index',
        html: false,
        modifiers: {},
        aliases: {},
      },
    ): string {
      const { mergeSpanStyles } = element;

      values.skip = '<br/>';
      values.newline = '<br/>';

      const flatten: Record<string, string> = Object.entries(object.flatten(values)).reduce(
        (acc, [k, v]) => {
          acc[k] = String(v);

          if (['username', 'name', 'nick', 'nickname', 'sender'].some((e) => k === e)) {
            const username = acc?.username || acc?.name || acc?.nick || acc?.nickname || acc?.sender;

            acc['username'] = acc.username || username;
            acc['usernameAt'] = `@${acc.username}`;
            acc['name'] = acc.name || username;
            acc['nick'] = acc.nick || username;
            acc['nickname'] = acc.nickname || username;
            acc['sender'] = acc.sender || username;
            acc['senderAt'] = `@${acc.sender}`;
          }

          if (['amount', 'count'].some((e) => k === e)) {
            acc['amount'] = String(amount);
            acc['count'] = String(acc?.count || amount);
          }

          acc['currency'] = acc.currency || window.client?.details.currency.symbol || '$';
          acc['currencyCode'] = acc.currencyCode || window.client?.details.currency.code || 'USD';

          return acc;
        },
        {} as Record<string, string>,
      );

      const REGEX = {
        PLACEHOLDERS: /{([^}]+)}/g,
        MODIFIERS: /\[(\w+)(:[^=]+)?=([^\]]+)\]/g,
      };

      var amount = parseFloat(flatten?.amount ?? flatten?.count ?? 0);

      const HTML_MODIFIERS: Record<string, Modifier> = {
        COLOR: (value, param) => mergeSpanStyles(param && !!color.validate(param) ? `color: ${param}` : '', value),
        WEIGHT: (value, param) => mergeSpanStyles(param && !isNaN(parseInt(param)) ? `font-weight: ${param}` : '', value),
        BOLD: (value) => mergeSpanStyles('font-weight: bold', value),
        LIGHT: (value) => mergeSpanStyles('font-weight: lighter', value),
        STRONG: (value) => mergeSpanStyles('font-weight: bolder', value),
        ITALIC: (value) => mergeSpanStyles('font-style: italic', value),
        UNDERLINE: (value) => mergeSpanStyles('text-decoration: underline', value),
        STRIKETHROUGH: (value) => mergeSpanStyles('text-decoration: line-through', value),
        SUB: (value) => mergeSpanStyles('vertical-align: sub', value),
        SUP: (value) => mergeSpanStyles('vertical-align: super', value),
        LARGER: (value) => mergeSpanStyles('font-size: larger', value),
        SMALL: (value) => mergeSpanStyles('font-size: smaller', value),
        SHADOW: (value, param) => mergeSpanStyles(`text-shadow: ${param}`, value),
        SIZE: (value, param) => mergeSpanStyles(param ? `font-size: ${param}` : '', value),
      };

      const STRING_MODIFIERS: Record<string, Modifier> = {
        BT1: (value) => (amount > 1 ? value : ''),
        BT0: (value) => (amount > 0 ? value : ''),
        ST1: (value) => (amount < 1 ? value : ''),
        ST0: (value) => (amount < 0 ? value : ''),
        UPC: (value) => value.toUpperCase(),
        LOW: (value) => value.toLowerCase(),
        REV: (value) => value.split('').reverse().join(''),
        CAP: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        FALLBACK: (value, param) => (value.length ? value : (param ?? value)),
      };

      const MODIFIERS: Record<string, Modifier> = {
        ...STRING_MODIFIERS,
        ...(options?.html ? HTML_MODIFIERS : {}),
        ...(options.modifiers ?? {}),
      };

      const ALIASES = {
        UPC: ['UPPERCASE', 'UPPER', 'UPP'],
        LOW: ['LOWERCASE', 'LOWER', 'LWC'],
        REV: ['REVERSE', 'RVS'],
        CAP: ['CAPITALIZE', 'CAPITAL'],
        BT1: ['BIGGER_THAN_1', 'GREATER_THAN_1', 'GT1'],
        BT0: ['BIGGER_THAN_0', 'GREATER_THAN_0', 'GT0'],
        ST1: ['SMALLER_THAN_1', 'LESS_THAN_1', 'LT1'],
        ST0: ['SMALLER_THAN_0', 'LESS_THAN_0', 'LT0'],
        COLOR: ['COLOUR', 'CLR', 'HIGHLIGHT'],
        BOLD: ['BOLDEN', 'B'],
        STRONG: ['STRONGEN', 'STRONG'],
        ITALIC: ['ITALICIZE', 'ITALIC', 'I'],
        UNDERLINE: ['U', 'INS', 'INSET', 'I'],
        STRIKETHROUGH: ['STRIKE', 'S', 'DELETE', 'D'],
        SUB: ['SUBSCRIPT', 'SUBS'],
        SUP: ['SUPERSCRIPT', 'SUPS'],
        LARGER: ['LARGER', 'LG'],
        SMALL: ['SMALLER', 'SM'],
        SHADOW: ['SHADOW', 'SHD'],
        FALLBACK: ['FALLBACK', 'FB'],
        ...(options.aliases ?? {}),
      };

      function applyModifier(value: string, name: string, param: string | null | undefined): string {
        const canonical = Object.entries(ALIASES).find(([key, aliases]) => {
          if (aliases.some((alias) => alias.toUpperCase() === name.toUpperCase())) return true;
          else if (key.toUpperCase() === name.toUpperCase()) return true;
          else return false;
        });
        const use = canonical ? canonical[0] : name.toUpperCase();

        if (MODIFIERS[use]) return MODIFIERS[use](value, typeof param === 'string' ? param.trim() : null, flatten);
        else return value;
      }

      function replaceAll(string: string): string {
        let str = string;
        let match;

        while ((match = REGEX.MODIFIERS.exec(str)) !== null) {
          const [fullMatch, modifier, param, value] = match;

          const newValue = applyModifier(replaceAll(value), modifier, param);

          str = str.replace(fullMatch, newValue ?? '');

          REGEX.MODIFIERS.lastIndex = 0;
        }

        return str;
      }

      function parseModifiers(str: string): string {
        let i = 0;
        const len = str.length;

        function parseText(stopChar?: string): string {
          let out = '';
          while (i < len) {
            if (str[i] === '\\') {
              if (i + 1 < len) {
                out += str[i + 1];
                i += 2;
              } else {
                i++;
              }
            } else if (str[i] === '[' && (!stopChar || stopChar !== '[')) {
              out += parseModifier();
            } else if (stopChar && str[i] === stopChar) {
              i++;
              break;
            } else {
              out += str[i++];
            }
          }
          return out;
        }

        function parseModifier(): string {
          i++;
          let name = '';
          while (i < len && /[A-Za-z0-9]/.test(str[i])) name += str[i++];
          let param: string | null = null;
          if (str[i] === ':') {
            i++;
            const paramStart = i;
            while (i < len && str[i] !== '=') i++;
            param = str.slice(paramStart, i);
          }
          if (str[i] === '=') i++;
          const value = parseText(']');
          return applyModifier(value, name, param);
        }

        return parseText();
      }

      let result = template.replace(REGEX.PLACEHOLDERS, (_, key: string) =>
        typeof flatten[key] === 'string' || typeof flatten[key] === 'number' ? String(flatten[key]) : (key ?? key),
      );

      result = options.method === 'loop' ? replaceAll(result) : parseModifiers(result);

      return result;
    },
  };

  export const element = {
    /**
     * Merges outer span styles with inner span styles in the provided HTML string.
     * @param outerStyle - The style string to be applied to the outer span.
     * @param innerHTML - The inner HTML string which may contain a span with its own styles.
     * @returns A new HTML string with merged styles applied to a single span.
     * @example
     * ```javascript
     * const result = Simulation.element.mergeSpanStyles("color: red; font-weight: bold;", '<span style="font-size: 14px;">Hello World</span>');
     * console.log(result); // Output: '<span style="font-size: 14px; color: red; font-weight: bold;">Hello World</span>'
     * ```
     */
    mergeSpanStyles(outerStyle: string, innerHTML: string): string {
      const match = innerHTML.match(/^<span style="([^"]*)">(.*)<\/span>$/s);

      if (match) {
        const innerStyle = match[1];
        const content = match[2];

        const mergedStyle = [innerStyle, outerStyle]
          .filter(Boolean)
          .join('; ')
          .replace(/\s*;\s*/g, '; ')
          .trim();

        return `<span style="${mergedStyle}">${content}</span>`;
      } else {
        return `<span style="${outerStyle}">${innerHTML}</span>`;
      }
    },

    /**
     * Scales an HTML element to fit within its parent element based on specified minimum and maximum scale factors.
     * @param element - The HTML element to be scaled.
     * @param min - Minimum scale factor (default is 0).
     * @param max - Maximum scale factor (default is 1).
     * @param options - Optional settings for scaling.
     * @returns - An object containing the new width, height, and scale factor, or void if not applied.
     * @example
     * ```javascript
     * const element = document.getElementById('myElement');
     * Simulation.element.scale(element, 0.5, 1, { return: false });
     * ```
     */
    scale(
      element: HTMLElement,
      min: number = 0,
      max: number = 1,
      options?: { return: boolean; parent: HTMLElement; base: 'width' | 'height' },
    ): { width: number; height: number; scale: number } | void {
      const { return: returnOnly = false, parent: customParent, base } = options || {};

      const parent = customParent || element.parentElement || document.body;

      if (!parent) {
        Tixyel.logger.warn('No parent element found for scaling');
        return;
      }

      const parentRect = parent.getBoundingClientRect();
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      if (elementWidth === 0 || elementHeight === 0) {
        Tixyel.logger.warn('Element has zero width or height, cannot scale');
        return;
      }

      // Calculate scales for both dimensions
      const scaleX = (parentRect.width * max) / elementWidth;
      const scaleY = (parentRect.height * max) / elementHeight;

      // Determine final scale based on base option or use smaller scale
      let finalScale = base === 'width' ? scaleX : base === 'height' ? scaleY : Math.min(scaleX, scaleY);

      // Apply minimum constraint if needed
      if (min > 0) {
        const minScaleX = (parentRect.width * min) / elementWidth;
        const minScaleY = (parentRect.height * min) / elementHeight;
        const minScale = Math.max(minScaleX, minScaleY);

        finalScale = Math.max(minScale, finalScale);
      }

      const result = {
        width: elementWidth * finalScale,
        height: elementHeight * finalScale,
        scale: finalScale,
      };

      if (returnOnly) {
        return result;
      }

      element.style.transform = `scale(${finalScale})`;
      element.style.transformOrigin = 'center center';

      return result;
    },

    /**
     * Splits the text content of an HTML string into individual characters wrapped in span elements with a data-index attribute.
     * @param htmlString - The input HTML string to be processed.
     * @param startIndex - The starting index for the data-index attribute (default is 0).
     * @returns - A new HTML string with each character wrapped in a span element.
     * @example
     * ```javascript
     * const result = Simulation.element.splitTextToChars("<p>Hello</p>", 0);
     * console.log(result);
     * // Output: '<p><span class="char" data-index="0">H</span><span class="char" data-index="1">e</span><span class="char" data-index="2">l</span><span class="char" data-index="3">l</span><span class="char" data-index="4">o</span></p>'
     * ```
     */
    splitTextToChars(htmlString: string, startIndex: number = 0): string {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      let charIndex = startIndex;

      function processNode(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;

          const chars = text?.split('').map((char) => {
            const span = document.createElement('span');

            span.className = 'char';
            span.dataset.index = String(charIndex++);

            span.textContent = char;

            charIndex++;

            return span.outerHTML;
          });

          const wrapper = document.createElement('span');

          wrapper.innerHTML = chars?.join('') ?? '';

          return wrapper;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);

          node.childNodes.forEach((child) => {
            const processed = processNode(child);

            if (processed instanceof Node) {
              Array.from(processed.childNodes).forEach((childNode) => {
                clone.appendChild(childNode);
              });
            }
          });

          return clone;
        }

        return node.cloneNode(true);
      }

      const body = doc.body;
      const processed = document.createElement('div');

      body.childNodes.forEach((node) => {
        const result = processNode(node);

        if (result instanceof Node) {
          processed.appendChild(result);
        }
      });

      return processed.innerHTML;
    },
  };

  export const object = {
    /**
     * Flattens a nested object into a single-level object with dot-separated keys.
     * @param obj - The nested object to be flattened.
     * @param prefix  - The prefix to be added to each key (used for recursion).
     * @returns A flattened object with dot-separated keys.
     * @example
     * ```javascript
     * const nestedObj = { a: { b: 1, c: { d: 2 } }, e: [3, 4] };
     * const flatObj = Simulation.object.flatten(nestedObj);
     * console.log(flatObj);
     * // Output: { 'a.b': '1', 'a.c.d': '2', 'e:0': '3', 'e:1': '4' }
     * ```
     */
    flatten(obj: Record<string, any>, prefix: string = ''): Record<string, string> {
      const result = {} as Record<string, string>;

      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];
        const path = prefix ? `${prefix}.${key}` : key;

        // Handle null and undefined
        if (value === null || value === undefined) {
          result[path] = String(value);

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
              Object.assign(result, this.flatten(v, itemPath));
            } else {
              result[itemPath] = String(v);
            }
          });

          continue;
        }

        // Handle nested objects
        if (typeof value === 'object') {
          Object.assign(result, this.flatten(value, path));

          continue;
        }

        // Handle primitive values (string, number, boolean, etc.)
        result[path] = String(value);
      }

      return result;
    },
  };

  export const generate = {
    session: {
      types: {
        name: { type: 'string', options: Simulation.data.names.filter((e) => e.length) },
        tier: { type: 'string', options: Simulation.data.tiers.filter((e) => e.length) },
        message: { type: 'string', options: Simulation.data.messages.filter((e) => e.length) },
        item: { type: 'array', options: Simulation.data.items },
        avatar: { type: 'string', options: Simulation.data.avatars.filter((e) => e.length) },
      } as Record<string, StreamElements.Session.Config.Any>,

      available(): StreamElements.Session.Config.Available.Data {
        const types = this.types;

        return {
          follower: {
            latest: { name: types.name },
            session: { count: { type: 'int', min: 50, max: 200 } },
            week: { count: { type: 'int', min: 200, max: 1000 } },
            month: { count: { type: 'int', min: 1000, max: 3000 } },
            goal: { amount: { type: 'int', min: 3000, max: 7000 } },
            total: { count: { type: 'int', min: 7000, max: 10000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: { name: types.name, createdAt: { type: 'date', range: 400 } },
            },
          },
          subscriber: {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              tier: types.tier,
              message: types.message,
            },
            'new-latest': {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              message: types.message,
            },
            'resub-latest': {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              message: types.message,
            },
            'gifted-latest': {
              name: types.name,
              amount: { type: 'int', min: 10, max: 30 },
              message: types.message,
              tier: types.tier,
              sender: types.name,
            },
            session: { count: { type: 'int', min: 10, max: 40 } },
            'new-session': { count: { type: 'int', min: 10, max: 40 } },
            'resub-session': { count: { type: 'int', min: 10, max: 40 } },
            'gifted-session': { count: { type: 'int', min: 10, max: 40 } },
            week: { count: { type: 'int', min: 40, max: 100 } },
            month: { count: { type: 'int', min: 100, max: 200 } },
            goal: { amount: { type: 'int', min: 200, max: 300 } },
            total: { count: { type: 'int', min: 300, max: 400 } },
            points: { amount: { type: 'int', min: 100, max: 400 } },
            'alltime-gifter': { name: types.name, amount: { type: 'int', min: 300, max: 400 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 10, max: 30 },
                tier: types.tier,
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          host: {
            latest: { name: types.name, amount: { type: 'int', min: 1, max: 10 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 1, max: 10 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          raid: {
            latest: { name: types.name, amount: { type: 'int', min: 0, max: 100 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 0, max: 100 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          charityCampaignDonation: {
            latest: { name: types.name, amount: { type: 'int', min: 50, max: 150 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 50, max: 200 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 200, max: 500 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 500, max: 800 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 800, max: 1000 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 50, max: 200 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 500 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 500, max: 800 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 800, max: 1000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 50, max: 150 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          cheer: {
            latest: { name: types.name, amount: { type: 'int', min: 200, max: 800 }, message: types.message },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 200, max: 1000 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 1000, max: 5000 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 5000, max: 12000 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 12000, max: 20000 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 1000 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 1000, max: 5000 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 5000, max: 12000 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 12000, max: 20000 } },
            session: { amount: { type: 'int', min: 200, max: 1000 } },
            week: { amount: { type: 'int', min: 1000, max: 5000 } },
            month: { amount: { type: 'int', min: 5000, max: 12000 } },
            goal: { amount: { type: 'int', min: 12000, max: 18000 } },
            total: { amount: { type: 'int', min: 18000, max: 20000 } },
            count: { count: { type: 'int', min: 200, max: 1000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 200, max: 800 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          cheerPurchase: {
            latest: { name: types.name, amount: { type: 'int', min: 200, max: 400 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 200, max: 400 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 400, max: 800 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 800, max: 1500 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 1500, max: 2000 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 200, max: 400 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 400, max: 800 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 800, max: 1500 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 1500, max: 2000 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 200, max: 400 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          superchat: {
            latest: { name: types.name, amount: { type: 'int', min: 100, max: 400 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            session: { amount: { type: 'int', min: 100, max: 500 } },
            week: { amount: { type: 'int', min: 500, max: 1000 } },
            month: { amount: { type: 'int', min: 1000, max: 2000 } },
            goal: { amount: { type: 'int', min: 2000, max: 2300 } },
            total: { amount: { type: 'int', min: 2300, max: 2500 } },
            count: { count: { type: 'int', min: 100, max: 500 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 100, max: 400 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          hypetrain: {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              active: { type: 'int', min: 0, max: 1 },
              level: { type: 'int', min: 5, max: 10 },
              levelChanged: { type: 'int', min: 0, max: 5 },
              _type: { type: 'array', options: ['follower', 'subscriber', 'cheer', 'donation'] },
            },
            'level-goal': { amount: { type: 'int', min: 0, max: 100 } },
            'level-progress': { amount: { type: 'int', min: 0, max: 100 }, percent: { type: 'int', min: 0, max: 100 } },
            total: { amount: { type: 'int', min: 0, max: 100 } },
            'latest-top-contributors': { type: 'recent', amount: 25, value: { name: types.name } },
          },
          'channel-points': {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              message: types.message,
              redemption: { type: 'array', options: ['Reward 1', 'Reward 2', 'Reward 3'] },
            },
          },
          tip: {
            latest: { name: types.name, amount: { type: 'int', min: 100, max: 400 } },
            'session-top-donation': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donation': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donation': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donation': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            'session-top-donator': { name: types.name, amount: { type: 'int', min: 100, max: 500 } },
            'weekly-top-donator': { name: types.name, amount: { type: 'int', min: 500, max: 1000 } },
            'monthly-top-donator': { name: types.name, amount: { type: 'int', min: 1000, max: 2000 } },
            'alltime-top-donator': { name: types.name, amount: { type: 'int', min: 2000, max: 2500 } },
            session: { amount: { type: 'int', min: 100, max: 500 } },
            week: { amount: { type: 'int', min: 500, max: 1000 } },
            month: { amount: { type: 'int', min: 1000, max: 2000 } },
            goal: { amount: { type: 'int', min: 2000, max: 2300 } },
            total: { amount: { type: 'int', min: 2300, max: 2500 } },
            count: { count: { type: 'int', min: 100, max: 500 } },
            recent: {
              type: 'recent',
              amount: 25,
              value: {
                name: types.name,
                amount: { type: 'int', min: 100, max: 400 },
                createdAt: { type: 'date', range: 400 },
              },
            },
          },
          merch: {
            latest: { name: types.name, amount: { type: 'int', min: 0, max: 100 }, items: types.item },
            'goal-orders': { amount: { type: 'int', min: 0, max: 100 } },
            'goal-items': { amount: { type: 'int', min: 0, max: 100 } },
            'goal-total': { amount: { type: 'int', min: 0, max: 100 } },
            recent: { type: 'recent', amount: 25, value: { name: types.name } },
          },
          purchase: {
            latest: {
              name: types.name,
              amount: { type: 'int', min: 0, max: 100 },
              items: types.item,
              avatar: types.avatar,
              message: types.message,
            },
          },
        };
      },

      async get(): Promise<StreamElements.Session.Data> {
        const available = this.available();

        const generate = (
          available: StreamElements.Session.Config.Available.Data | StreamElements.Session.Config.Available.Category | StreamElements.Session.Config.Any,
        ): any => {
          const generateRecentData = (config: StreamElements.Session.Config.Any): Array<any> => {
            if (!config || !('amount' in config)) return [];

            const items: Array<{ createdAt: string }> = [];

            for (let i = 0; i < config.amount; i++) {
              items.push(generate(config.value));
            }

            return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          };

          const generateObjectData = (config: Record<string, any>): Record<string, any> => {
            const result: Record<string, any> = {};

            for (const key in config) {
              const processedKey = key.replace('_type', 'type');

              result[processedKey] = generate(config[key]);
            }

            return result;
          };

          const processTypedConfig = (config: StreamElements.Session.Config.Any): any => {
            if (!config) return config;

            switch (config.type) {
              case 'int':
                return Simulation.rand.number(config.min, config.max);
              case 'string':
                return Simulation.rand.array(config.options)[0];
              case 'date':
                return Simulation.rand.daysOffset(config.range);
              case 'array':
                return Simulation.rand.array(config.options)[0];
              case 'recent':
                return generateRecentData(config);
              default:
                return config;
            }
          };

          // Main generation logic

          // Handle primitive values (non-objects)
          if (typeof available !== 'object' || available === null) {
            return available;
          }

          // Handle typed configurations (objects with a 'type' property)
          if ('type' in available && typeof available.type === 'string') {
            return processTypedConfig(available);
          }

          // Handle generic objects - recursively process each property
          return generateObjectData(available);
        };

        var session: StreamElements.Session.Data = Object.entries(generate(available)).reduce(
          (acc, [key, value]) => {
            Object.entries(value as any).forEach(
              ([subKey, subValue]) =>
                //
                (acc[`${key}-${subKey}`] = subValue),
            );

            return acc;
          },
          {} as Record<string, any>,
        ) as StreamElements.Session.Data;

        return session;
      },
    },
    event: {
      /**
       * Simulates the onWidgetLoad event for a widget.
       * @param fields - The field values to be included in the event.
       * @param session - The session data to be included in the event.
       * @param currency - The currency to be used (default is 'USD').
       * @returns A Promise that resolves to the simulated onWidgetLoad event data.
       */
      async onWidgetLoad(
        fields: Record<string, StreamElements.CustomField.Value>,
        session: StreamElements.Session.Data,
        currency: 'BRL' | 'USD' | 'EUR' = 'USD',
      ): Promise<StreamElements.Event.onWidgetLoad> {
        const currencies = {
          BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
          USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
          EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
        };

        return {
          channel: {
            username: 'local',
            apiToken: '',
            id: '',
            providerId: '',
            avatar: '',
          },
          currency: currencies[currency] ?? currencies.USD,
          fieldData: fields,
          recents: [],
          session: {
            data: session,
            settings: {
              autoReset: false,
              calendar: false,
              resetOnStart: false,
            },
          },
          overlay: {
            isEditorMode: true,
            muted: false,
          },
          emulated: true,
        };
      },
      /**
       * Simulates the onSessionUpdate event for a widget.
       * @param session - The session data to be included in the event.
       * @returns A Promise that resolves to the simulated onSessionUpdate event data.
       */
      async onSessionUpdate(session?: StreamElements.Session.Data): Promise<StreamElements.Event.onSessionUpdate> {
        session ??= await Simulation.generate.session.get();

        return { session };
      },
      /**
       * Simulates the onEventReceived event for a widget.
       * @param provider - The provider of the event (default is 'random').
       * @param type - The type of event to simulate (default is 'random').
       * @param options - Additional options to customize the event data.
       * @returns A Promise that resolves to the simulated onEventReceived event data, or null if the event type is not supported.
       * @example
       * ```javascript
       * // Simulate a random event
       * const randomEvent = await Simulation.generate.event.onEventReceived();
       *
       * // Simulate a Twitch message event with custom options
       * const twitchMessageEvent = await Simulation.generate.event.onEventReceived('twitch', 'message', { name: 'Streamer', message: 'Hello World!' });
       * ```
       */
      async onEventReceived(
        provider: Provider | 'random' = 'random',
        type: StreamElements.Event.onEventReceived['listener'] | 'random' | 'tip' | 'cheer' | 'follower' | 'raid' | 'subscriber' = 'random',
        options: Record<string, string | number | boolean> = {},
      ): Promise<StreamElements.Event.onEventReceived | null> {
        const available: Record<Provider, string[]> = {
          twitch: ['message', 'follower-latest', 'cheer-latest', 'raid-latest', 'subscriber-latest'],
          streamelements: ['tip-latest'],
          youtube: ['message', 'superchat-latest', 'subscriber-latest', 'sponsor-latest'],
          kick: [],
          facebook: [],
        };

        switch (provider) {
          default:
          case 'random': {
            var randomProvider = Simulation.rand.array(Object.keys(available).filter((e) => available[e as Provider].length))[0] as Provider;
            var randomEvent = Simulation.rand.array(available[randomProvider])[0] as StreamElements.Event.onEventReceived['listener'];

            return this.onEventReceived(randomProvider, randomEvent);
          }

          case 'twitch': {
            switch (type as StreamElements.Event.Provider.Twitch.Events['listener'] | 'random' | 'cheer' | 'follower' | 'raid' | 'subscriber') {
              default:
              case 'random': {
                var randomEvent = Simulation.rand.array(available[provider])[0] as StreamElements.Event.onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'message': {
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                var badges = await generateBadges((options?.badges as BadgeOptions) ?? [], provider);

                var emotes = findEmotesInText(message);
                var renderedText = replaceEmotesWithHTML(message, emotes);

                var color = (options?.color as string) ?? Simulation.rand.color('hex');
                var userId = (options?.userId as string) ?? Simulation.rand.number(10000000, 99999999).toString();
                var time = Date.now();

                const event: StreamElements.Event.Provider.Twitch.Message = {
                  listener: 'message',
                  event: {
                    service: provider,
                    data: {
                      time: time,
                      tags: {
                        'badge-info': `${badges.keys.map((key) => `${key}/${Simulation.rand.number(1, 5)}`).join(',')}`,
                        'badges': badges.keys.join('/1,'),

                        'mod': badges.keys.includes('moderator') ? '1' : '0',
                        'subscriber': badges.keys.includes('subscriber') ? '1' : '0',
                        'turbo': badges.keys.includes('turbo') ? '1' : '0',

                        'tmi-sent-ts': time.toString(),

                        'user-id': userId,
                        'user-type': '',

                        'color': color,
                        'display-name': name,
                        'emotes': '',

                        'client-nonce': Simulation.rand.string(16),
                        'flags': '',
                        'id': Simulation.rand.uuid(),
                        'first-msg': '0',
                        'returning-chatter': '0',
                      },
                      nick: name.toLowerCase(),
                      displayName: name,
                      displayColor: color,
                      channel: 'local',
                      text: message,
                      isAction: false,
                      userId: userId,
                      msgId: Simulation.rand.uuid(),
                      badges: badges.badges,
                      emotes: emotes,
                    },
                    renderedText: renderedText,
                  },
                };

                return event;
              }
              case 'cheer':
              case 'cheer-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(100, 10000);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.Twitch.Cheer = {
                  listener: 'cheer-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    message: message,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'cheer',
                    originalEventName: 'cheer-latest',
                  },
                };

                return event;
              }
              case 'follower':
              case 'follower-latest': {
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.Twitch.Follower = {
                  listener: 'follower-latest',
                  event: {
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'follower',
                    originalEventName: 'follower-latest',
                  },
                };

                return event;
              }
              case 'raid':
              case 'raid-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(1, 100);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.Twitch.Raid = {
                  listener: 'raid-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'raid',
                    originalEventName: 'raid-latest',
                  },
                };

                return event;
              }
              case 'subscriber':
              case 'subscriber-latest': {
                var tier = (options?.tier as string) ?? Simulation.rand.array(['1000', '2000', '3000'])[0];
                var amount = (options?.amount as number) ?? Simulation.rand.number(1, 24);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var sender = (options?.sender as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length && e !== name))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                var addons = {
                  default: {
                    avatar,
                    tier,
                    playedAsCommunityGift: false,
                  },
                  gift: {
                    sender,
                    gifted: true,
                  } as StreamElements.Event.Provider.Twitch.gift,
                  community: {
                    message,
                    sender,
                    bulkGifted: true,
                  } as StreamElements.Event.Provider.Twitch.community,
                  spam: {
                    sender,
                    gifted: true,
                    isCommunityGift: true,
                  } as StreamElements.Event.Provider.Twitch.spam,
                };

                var subTypes = ['default', 'gift', 'community', 'spam'];
                var subType = (options?.subType as string) ?? Simulation.rand.array(subTypes)[0];

                subType = subTypes.includes(subType) ? subType : 'default';

                const event: StreamElements.Event.Provider.Twitch.Subscriber = {
                  listener: 'subscriber-latest',
                  event: {
                    amount,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',

                    ...addons.default,
                    ...addons[subType as keyof typeof addons],

                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'subscriber',
                    originalEventName: 'subscriber-latest',
                  },
                };

                return event;
              }
              case 'delete-message': {
                const event: StreamElements.Event.Provider.Twitch.DeleteMessage = {
                  listener: 'delete-message',
                  event: {
                    msgId: (options?.id as string) ?? Simulation.rand.uuid(),
                  },
                };

                return event;
              }
              case 'delete-messages': {
                const event: StreamElements.Event.Provider.Twitch.DeleteMessages = {
                  listener: 'delete-messages',
                  event: {
                    userId: (options?.id as string) ?? Simulation.rand.number(10000000, 99999999).toString(),
                  },
                };

                return event;
              }
            }
          }

          case 'streamelements': {
            switch (type as StreamElements.Event.Provider.StreamElements.Events['listener'] | 'random' | 'tip' | 'mute' | 'unmute' | 'skip') {
              default:
              case 'random': {
                var randomEvent = Simulation.rand.array(available[provider])[0] as StreamElements.Event.onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'tip':
              case 'tip-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(100, 4000);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.StreamElements.Tip = {
                  listener: 'tip-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'tip',
                    originalEventName: 'tip-latest',
                  },
                };

                return event;
              }
              case 'kvstore:update': {
                const event: StreamElements.Event.Provider.StreamElements.KVStore = {
                  listener: 'kvstore:update',
                  event: {
                    data: {
                      key: `customWidget.${(options?.key as string) ?? 'sampleKey'}`,
                      value: (options?.value as string) ?? 'sampleValue',
                    },
                  },
                };

                return event;
              }
              case 'bot:counter': {
                const event: StreamElements.Event.Provider.StreamElements.BotCounter = {
                  listener: 'bot:counter',
                  event: {
                    counter: (options?.counter as string) ?? 'sampleCounter',
                    value: (options?.value as number) ?? Simulation.rand.number(0, 100),
                  },
                };

                return event;
              }
              case 'mute':
              case 'unmute':
              case 'alertService:toggleSound': {
                var muted = (options?.muted as boolean) ?? !client.details.overlay.muted;

                const event: StreamElements.Event.Provider.StreamElements.AlertService = {
                  listener: 'alertService:toggleSound',
                  event: { muted },
                };

                return event;
              }
              case 'skip':
              case 'event:skip': {
                const event: StreamElements.Event.Provider.StreamElements.EventSkip = {
                  listener: 'event:skip',
                  event: {},
                };

                return event;
              }
            }
          }

          case 'youtube': {
            switch (type as StreamElements.Event.Provider.YouTube.Events['listener'] | 'random' | 'message' | 'superchat' | 'subscriber' | 'sponsor') {
              default:
              case 'random': {
                var randomEvent = Simulation.rand.array(available[provider])[0] as StreamElements.Event.onEventReceived['listener'];

                return this.onEventReceived(provider, randomEvent);
              }
              case 'message': {
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                const badges = await generateBadges((options?.badges as BadgeOptions) ?? [], provider);

                var emotes = findEmotesInText(message);
                var renderedText = replaceEmotesWithHTML(message, emotes);

                var color = (options?.color as string) ?? Simulation.rand.color('hex');
                var userId = (options?.userId as string) ?? Simulation.rand.number(10000000, 99999999).toString();
                var time = Date.now();

                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];

                const event: StreamElements.Event.Provider.YouTube.Message = {
                  listener: 'message',
                  event: {
                    service: 'youtube',
                    data: {
                      kind: '',
                      etag: '',
                      id: '',
                      snippet: {
                        type: '',
                        liveChatId: '',
                        authorChannelId: 'local',
                        publishedAt: new Date().toISOString(),
                        hasDisplayContent: true,
                        displayMessage: message,
                        textMessageDetails: {
                          messageText: message,
                        },
                      },
                      authorDetails: {
                        channelId: 'local',
                        channelUrl: '',
                        displayName: name,
                        profileImageUrl: avatar,
                        ...badges,
                      },
                      msgId: Simulation.rand.uuid(),
                      userId: Simulation.rand.uuid(),
                      nick: name.toLowerCase(),
                      badges: [],
                      displayName: name,
                      isAction: false,
                      time: Date.now(),
                      tags: [],
                      displayColor: Simulation.rand.color('hex'),
                      channel: 'local',
                      text: message,
                      avatar: avatar,
                      emotes: [],
                    },
                    renderedText: message,
                  },
                };

                return event;
              }
              case 'subscriber':
              case 'subscriber-latest': {
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.YouTube.Subscriber = {
                  listener: 'subscriber-latest',
                  event: {
                    avatar,
                    displayName: name,
                    name: name.toLowerCase(),
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'subscriber',
                    originalEventName: 'subscriber-latest',
                  },
                };

                return event;
              }
              case 'superchat':
              case 'superchat-latest': {
                var amount = (options?.amount as number) ?? Simulation.rand.number(100, 4000);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];

                const event: StreamElements.Event.Provider.YouTube.Superchat = {
                  listener: 'superchat-latest',
                  event: {
                    amount,
                    avatar,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',
                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'superchat',
                    originalEventName: 'superchat-latest',
                  },
                };

                return event;
              }
              case 'sponsor':
              case 'sponsor-latest': {
                var tier = (options?.tier as string) ?? Simulation.rand.array(['1000', '2000', '3000'])[0];
                var amount = (options?.amount as number) ?? Simulation.rand.number(1, 24);
                var avatar = (options?.avatar as string) ?? Simulation.rand.array(Simulation.data.avatars)[0];
                var name = (options?.name as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length))[0];
                var sender = (options?.sender as string) ?? Simulation.rand.array(Simulation.data.names.filter((e) => e.length && e !== name))[0];
                var message = (options?.message as string) ?? Simulation.rand.array(Simulation.data.messages.filter((e) => e.length))[0];

                var addons = {
                  default: {
                    avatar,
                    tier,
                    playedAsCommunityGift: false,
                  },
                  gift: {
                    sender,
                    gifted: true,
                  } as StreamElements.Event.Provider.YouTube.gift,
                  community: {
                    message,
                    sender,
                    bulkGifted: true,
                  } as StreamElements.Event.Provider.YouTube.community,
                  spam: {
                    sender,
                    gifted: true,
                    isCommunityGift: true,
                  } as StreamElements.Event.Provider.YouTube.spam,
                };

                var subTypes = ['default', 'gift', 'community', 'spam'];
                var subType = (options?.subType as string) ?? Simulation.rand.array(subTypes)[0];

                subType = subTypes.includes(subType) ? subType : 'default';

                const event: StreamElements.Event.Provider.YouTube.Sponsor = {
                  listener: 'sponsor-latest',
                  event: {
                    amount,
                    name: name.toLowerCase(),
                    displayName: name,
                    providerId: '',

                    ...addons.default,
                    ...addons[subType as keyof typeof addons],

                    _id: Simulation.rand.uuid(),
                    sessionTop: false,
                    type: 'sponsor',
                    originalEventName: 'sponsor-latest',
                  },
                };

                return event;
              }
            }
          }
        }
      },
    },
  };

  export const emulate = {
    twitch: {
      message(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('twitch', 'message', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      follower(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('twitch', 'follower-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      raid(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('twitch', 'raid-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      cheer(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('twitch', 'cheer-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      subscriber(data: Record<string, string | number | boolean> & { subType?: 'default' | 'gift' | 'community' | 'spam' } = {}) {
        Simulation.generate.event.onEventReceived('twitch', 'subscriber-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
    },
    streamelements: {
      tip(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('streamelements', 'tip-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
    },
    youtube: {
      message(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('youtube', 'message', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      subscriber(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('youtube', 'subscriber-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      superchat(data: Record<string, string | number | boolean> = {}) {
        Simulation.generate.event.onEventReceived('youtube', 'superchat-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
      sponsor(data: Record<string, string | number | boolean> & { subType?: 'default' | 'gift' | 'community' | 'spam' } = {}) {
        Simulation.generate.event.onEventReceived('youtube', 'sponsor-latest', data).then((event) => {
          if (event) {
            Simulation.emulate.send('onEventReceived', event);
          }
        });
      },
    },
    kick: {},
    facebook: {},

    send<T extends 'onEventReceived' | 'onSessionUpdate' | 'onWidgetLoad'>(
      listener: T,
      event: T extends 'onEventReceived'
        ? StreamElements.Event.onEventReceived
        : T extends 'onSessionUpdate'
          ? StreamElements.Event.onSessionUpdate
          : StreamElements.Event.onWidgetLoad,
    ): void {
      window.dispatchEvent(new CustomEvent(listener, { detail: event }));
    },
  };

  export async function start(
    fieldsFile: string[] = ['fields.json', 'cf.json', 'field.json', 'customfields.json'],
    dataFiles: string[] = ['data.json', 'fielddata.json', 'fd.json', 'DATA.json'],
  ) {
    const localFiles = {
      fields: fieldsFile.find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
      data: dataFiles.find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
    };

    const data: Record<string, string | number | boolean> = await fetch('./' + (localFiles.data ?? 'data.json'), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .catch(() => ({}));

    await fetch('./' + (localFiles.fields ?? 'fields.json'), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then(async (customfields: Record<string, StreamElements.CustomField.Schema>) => {
        const fields = Object.entries(customfields)
          .filter(([_, { value }]) => value != undefined)
          .reduce(
            (acc, [key, { value }]) => {
              if (data && data[key] !== undefined) value = data[key];

              acc[key] = value;

              return acc;
            },
            {
              ...data,
            } as Record<string, StreamElements.CustomField.Value>,
          );

        const load = await Simulation.generate.event.onWidgetLoad(fields, await Simulation.generate.session.get());

        window.dispatchEvent(new CustomEvent('onWidgetLoad', { detail: load }));
      });
  }
}
