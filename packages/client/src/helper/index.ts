import { ClientEvents, Emote, Provider, StreamElements, Twitch } from '../types/index.js';
import { findClosestColorName, parseToRGBA, rgbaToHex, rgbToHsl } from '../utils/color.js';
import { Data } from '../data/index.js';

export namespace Helper {
  export namespace number {
    /**
     * Translate number to words
     * @param num - Number to translate
     * @param type - Translation type
     * @returns - Number in words
     * @example
     * ```javascript
     * const cardinal = Simulation.number.translate(42, 'cardinal');
     * console.log(cardinal); // "forty-two"
     * ```
     */
    export function translate(
      num: number,
      type: 'cardinal' | 'ordinal' | 'suffix' = 'cardinal',
    ): string {
      const CARDINALS = {
        single: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
        tens: [
          'ten',
          'eleven',
          'twelve',
          'thirteen',
          'fourteen',
          'fifteen',
          'sixteen',
          'seventeen',
          'eighteen',
          'nineteen',
        ],
        decades: ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
      };
      const ORDINALS = {
        single: [
          'zeroth',
          'first',
          'second',
          'third',
          'fourth',
          'fifth',
          'sixth',
          'seventh',
          'eighth',
          'ninth',
        ],
        tens: [
          'tenth',
          'eleventh',
          'twelfth',
          'thirteenth',
          'fourteenth',
          'fifteenth',
          'sixteenth',
          'seventeenth',
          'eighteenth',
          'nineteenth',
        ],
        decades: [
          'twentieth',
          'thirtieth',
          'fortieth',
          'fiftieth',
          'sixtieth',
          'seventieth',
          'eightieth',
          'ninetieth',
        ],
      };
      const SUFFIXES = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
      const SCALES = [
        '',
        'thousand',
        'million',
        'billion',
        'trillion',
        'quadrillion',
        'quintillion',
      ];
      const SCALES_ORD = SCALES.map((s) => (s ? `${s}th` : ''));

      num = Math.abs(Math.floor(num));

      if (type === 'suffix') {
        const rem100 = num % 100;
        if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
        const rem10 = num % 10;
        return `${num}${SUFFIXES[rem10]}`;
      }

      function below100(n: number, kind: 'cardinal' | 'ordinal'): string {
        if (n < 10) return kind === 'ordinal' ? ORDINALS.single[n] : CARDINALS.single[n];
        if (n < 20) return kind === 'ordinal' ? ORDINALS.tens[n - 10] : CARDINALS.tens[n - 10];
        const decade = Math.floor(n / 10);
        const single = n % 10;
        if (single === 0)
          return kind === 'ordinal' ? ORDINALS.decades[decade - 2] : CARDINALS.decades[decade - 2];
        const tensPart = CARDINALS.decades[decade - 2];
        const unitPart = kind === 'ordinal' ? ORDINALS.single[single] : CARDINALS.single[single];
        return `${tensPart}-${unitPart}`;
      }

      function below1000(n: number, kind: 'cardinal' | 'ordinal'): string {
        if (n === 0) return kind === 'ordinal' ? ORDINALS.single[0] : CARDINALS.single[0];
        const hundreds = Math.floor(n / 100);
        const rest = n % 100;
        const parts: string[] = [];
        if (hundreds > 0) {
          if (kind === 'ordinal' && rest === 0)
            parts.push(`${CARDINALS.single[hundreds]} hundredth`);
          else parts.push(`${CARDINALS.single[hundreds]} hundred`);
        }
        if (rest > 0) parts.push(below100(rest, kind));
        return parts.join(' ');
      }

      if (num < 1000) return below1000(num, type);

      const groups: number[] = [];
      let n = num;
      while (n > 0) {
        groups.push(n % 1000);
        n = Math.floor(n / 1000);
      }

      let lastNonZeroIndex = -1;
      for (let i = 0; i < groups.length; i++) if (groups[i] !== 0) lastNonZeroIndex = i;

      const parts: string[] = [];
      for (let i = groups.length - 1; i >= 0; i--) {
        const g = groups[i];
        if (g === 0) continue;
        const scale = SCALES[i];

        if (type === 'cardinal') {
          let segment = below1000(g, 'cardinal');
          if (scale) segment += ` ${scale}`;
          parts.push(segment);
        } else {
          const isLastNonZero = i === lastNonZeroIndex;
          if (isLastNonZero) {
            if (i > 0) {
              const segment = below1000(g, 'cardinal');
              const ordScale = SCALES_ORD[i];
              parts.push(segment ? `${segment} ${ordScale}` : ordScale);
            } else {
              const segment = below1000(g, 'ordinal');
              parts.push(segment);
            }
          } else {
            let segment = below1000(g, 'cardinal');
            if (scale) segment += ` ${scale}`;
            parts.push(segment);
          }
        }
      }

      return parts.join(', ');
    }

    /**
     * Balances a number within a specified range
     * @param amount - Number to balance
     * @param min - Minimum value
     * @param max - Maximum value
     * @param decimals - Number of decimal places to round to (default is 0)
     * @returns - Balanced number
     * @example
     * ```javascript
     * const balancedValue = Simulation.number.balance(150, 0, 100);
     * console.log(balancedValue); // 100
     * ```
     */
    export function balance(
      amount: number,
      min: number = 0,
      max: number = 100,
      decimals: number = 0,
    ): number {
      const result = Math.min(Math.max(amount, min), max);

      return round(result, decimals);
    }

    /**
     * Rounds a number to a specified number of decimal places
     * @param value - Number to round
     * @param decimals - Number of decimal places (default is 2)
     * @returns Rounded number
     * @example
     * ```javascript
     * const roundedValue = Simulation.number.round(3.14159, 3);
     * console.log(roundedValue); // 3.142
     * ```
     */
    export function round(value: number, decimals: number = 2): number {
      const factor = Math.pow(10, decimals);

      return Math.round(value * factor) / factor;
    }

    /**
     * Generate random number
     * @param min - Minimum value
     * @param max - Maximum value
     * @param float - Number of decimal places (0 for integer)
     * @returns - Random number
     * @example
     * ```javascript
     * const intNumber = number.random(1, 10);
     * console.log(intNumber); // e.g. 7
     *
     * const floatNumber = number.random(1, 10, 2);
     * console.log(floatNumber); // e.g. 3.14
     * ```
     */
    export function number(min: number, max: number, float: number = 0): number {
      if (min > max) [min, max] = [max, min];

      const rand = Math.random() * (max - min) + min;
      return float ? Number(rand.toFixed(float)) : Math.round(rand);
    }
  }

  export namespace element {
    export interface ScaleOptions<T extends HTMLElement> {
      /**
       * The parent element to use for scaling calculations. If not provided, the element's parent will be used.
       */
      parent?: HTMLElement;
      /**
       * The preferred dimension to base the scaling on. Can be 'width', 'height', or 'auto' (default).
       */
      prefer?: 'width' | 'height' | 'auto';
      /**
       * The minimum percentage of the parent size to scale to. Default is 0.
       */
      min?: number;
      /**
       * The maximum percentage of the parent size to scale to. Default is 1 (100%).
       */
      max?: number;
      /**
       * A callback function that is called after scaling is applied.
       * @param this - The HTML element being scaled.
       * @param number - The scale factor applied to the element.
       * @param element - The HTML element being scaled.
       * @returns void
       */
      apply?: (this: T, number: number, element: T) => void;
    }

    export type FitTextOptions = {
      minFontSize?: number;
      maxFontSize?: number;
      parent?: HTMLElement;
    };

    /**
     * Merges outer span styles with inner span styles in the provided HTML string.
     * @param outerStyle - The style string to be applied to the outer span.
     * @param innerHTML - The inner HTML string which may contain a span with its own styles.
     * @returns A new HTML string with merged styles applied to a single span.
     * @example
     * ```javascript
     * const result = mergeSpanStyles("color: red; font-weight: bold;", '<span style="font-size: 14px;">Hello World</span>');
     * console.log(result); // Output: '<span style="font-size: 14px; color: red; font-weight: bold;">Hello World</span>'
     * ```
     */
    export function mergeSpanStyles(
      outerStyle: string,
      innerHTML: string,
      className?: string,
    ): string {
      const match = innerHTML.match(/^<span(?: class="[^"]*")? style="([^"]*)">(.*)<\/span>$/s);

      if (match) {
        const innerStyle = match[1];
        const content = match[2];
        const innerClass = match[0].match(/class="([^"]*)"/)?.[1] || '';

        let mergedStyle = [innerStyle, outerStyle]
          .filter((a) => a.length)
          .map((s) => {
            if (s.endsWith(';')) return s.slice(0, -1);
            else return s;
          })
          .join('; ')
          .replace(/\s*;\s*/g, '; ')
          .trim();

        if (!mergedStyle.endsWith(';')) mergedStyle += ';';

        return `<span${innerClass ? ` class="${innerClass} ${className ?? ''}"` : ''}${mergedStyle ? ` style="${mergedStyle}"` : ''}>${content}</span>`;
      } else {
        if (outerStyle && outerStyle.length && !outerStyle.endsWith(';')) outerStyle += ';';

        return `<span${className ? ` class="${className}"` : ''}${outerStyle ? ` style="${outerStyle}"` : ''}>${innerHTML}</span>`;
      }
    }

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
     * scale(element, 0.5, 1, { return: false });
     * ```
     */
    export function scale(
      element: HTMLElement,
      min: number = 0,
      max: number = 1,
      options?: { return: boolean; parent: HTMLElement; base: 'width' | 'height' },
    ): { width: number; height: number; scale: number } | void {
      const { return: returnOnly = false, parent: customParent, base } = options || {};

      const parent = customParent || element.parentElement || document.body;

      if (!parent) {
        throw new Error('No parent element found for scaling');
      }

      const parentRect = parent.getBoundingClientRect();
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      if (elementWidth === 0 || elementHeight === 0) {
        throw new Error('Element has zero width or height, cannot scale');
      }

      // Calculate scales for both dimensions
      const scaleX = (parentRect.width * max) / elementWidth;
      const scaleY = (parentRect.height * max) / elementHeight;

      // Determine final scale based on base option or use smaller scale
      let finalScale =
        base === 'width' ? scaleX : base === 'height' ? scaleY : Math.min(scaleX, scaleY);

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
    }

    /**
     * Scales an HTML element to fit within its parent element based on specified options.
     * @param element - The HTML element to be scaled.
     * @param options - Optional settings for scaling.
     * @returns The scale factor applied to the element.
     * @example
     * ```javascript
     * const element = document.getElementById('myElement');
     * const scaleFactor  scalev2(element, {
     *   min: 0.5,
     *   max: 1,
     *   prefer: 'width',
     *   apply: (scale, el) => el.style.transform = `scale(${scale})`
     * });
     * console.log(`Element scaled by a factor of ${scaleFactor}`);
     * ```
     */
    export function scalev2<T extends HTMLElement>(
      element: T,
      options: ScaleOptions<T> = {},
    ): number {
      const {
        parent = element.parentElement,
        prefer = 'auto',
        min = 0,
        max = 1,
        apply = () => {},
      } = options;

      if (!parent) {
        throw new Error('No parent element found for scaling');
      }

      const parentClientRect = parent.getBoundingClientRect();
      const elementClientRect = element.getBoundingClientRect();

      const parentWidth = parentClientRect.width;
      const parentHeight = parentClientRect.height;

      const elementWidth = elementClientRect.width;
      const elementHeight = elementClientRect.height;

      let scaleXmin = (parentWidth * min) / elementWidth;
      let scaleYmin = (parentHeight * min) / elementHeight;

      let scaleXmax = (parentWidth * max) / elementWidth;
      let scaleYmax = (parentHeight * max) / elementHeight;

      let scaleValue = Math.min(scaleXmax, scaleYmax);

      const minScale = Math.max(scaleXmin, scaleYmin);
      scaleValue = Math.max(scaleValue, minScale);

      const finalScaleX = elementWidth * scaleValue;
      const finalScaleY = elementHeight * scaleValue;

      if (prefer === 'width') {
        scaleValue = Math.max(scaleXmin, Math.min(scaleXmax, parentWidth / elementWidth));
      } else if (prefer === 'height') {
        scaleValue = Math.max(scaleYmin, Math.min(scaleYmax, parentHeight / elementHeight));
      } else {
        if (finalScaleX > parentWidth) {
          scaleValue = Math.max(scaleXmin, Math.min(scaleXmax, parentWidth / elementWidth));
        } else if (finalScaleY > parentHeight) {
          scaleValue = Math.max(scaleYmin, Math.min(scaleYmax, parentHeight / elementHeight));
        }
      }

      apply.apply(element, [scaleValue, element]);

      return scaleValue;
    }

    /**
     * Fits the text within the parent element by adjusting the font size.
     * @param element - The HTML element containing the text to be fitted.
     * @param compressor - A multiplier to adjust the fitting sensitivity (default is 1).
     * @param options - Optional settings for fitting text.
     * @returns The HTML element with adjusted font size.
     * @example
     * ```javascript
     * const element = document.getElementById('myTextElement');
     * fitText(element, 1, { minFontSize: 12, maxFontSize: 36 });
     * console.log(`Adjusted font size: ${element.style.fontSize}`);
     * ```
     */
    export function fitText(
      element: HTMLElement,
      compressor: number = 1,
      options: FitTextOptions = {},
    ) {
      const fontSize = parseFloat(getComputedStyle(element).getPropertyValue('font-size'));

      const settings = {
        minFontSize: options?.minFontSize ?? 0,
        maxFontSize: options?.maxFontSize ?? fontSize,
      };

      const parent = options?.parent || element.parentElement;

      if (!parent) {
        throw new Error('No parent element found for fitting text');
      }

      const parentWidth = parent.clientWidth * compressor;
      const elWidth = element.offsetWidth;

      const ratio = parentWidth / elWidth;
      const value = fontSize * ratio;

      const result = number.balance(value, settings.minFontSize, settings.maxFontSize);

      element.style.fontSize = result + 'px';

      return element;
    }

    /**
     * Wraps formatted HTML text with containers and splits characters into indexed spans.
     * Adds 'container' class and data-index to all parent elements, and wraps each character in a span with class 'char' and data-index.
     * @param htmlString - The input HTML string containing formatted text elements (span, strong, em, etc).
     * @param startIndex - The starting index for the data-index attribute (default is 0).
     * @returns - A new HTML string with containers and character-level indexing.
     * @example
     * ```javascript
     * const result = splitTextToChars('<span>TesTe</span> <strong>bold</strong>', 0);
     * console.log(result);
     * // Output: '<span class="container" data-index="0"><span class="char" data-index="0">T</span><span class="char" data-index="1">e</span>...'
     * ```
     */
    export function splitTextToChars(
      htmlString: string,
      startIndex: number = 0,
      preserveInterElementWhitespace: boolean = false,
    ): string {
      const parser = new DOMParser();
      const processed = document.createElement('div');

      let charIndex = startIndex;

      function processNode(node: Node): Node | DocumentFragment {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';

          const chars = text.split('').map((char, index) => {
            const span = document.createElement('span');

            span.classList.add('char');
            span.dataset.index = String(charIndex);
            span.dataset.exclusivityIndex = String(index);
            span.style.setProperty('--char-index', String(charIndex));
            span.style.setProperty('--exclusivity-index', String(index));

            if (char === ' ' || char === '\n' || char === '\t') {
              span.style.whiteSpace = 'pre-wrap';
            } else {
              charIndex++;
            }

            span.textContent = char;

            return span;
          });

          const fragment = document.createDocumentFragment();
          chars.forEach((char) => fragment.appendChild(char));

          return fragment;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false) as HTMLElement;

          clone.classList.add('container');
          clone.dataset.index = String(charIndex);
          clone.style.setProperty('--char-index', String(charIndex));
          clone.style.setProperty('--exclusivity-index', String(charIndex));

          charIndex++;

          node.childNodes.forEach((child) => {
            const processed = processNode(child);

            clone.appendChild(processed);
          });

          return clone;
        }

        return node.cloneNode(true);
      }

      parser.parseFromString(htmlString, 'text/html').body.childNodes.forEach((node) => {
        if (
          !preserveInterElementWhitespace &&
          node.nodeType === Node.TEXT_NODE &&
          !node.textContent?.trim()
        ) {
          return;
        }

        const result = processNode(node);

        processed.appendChild(result);
      });

      let html = '';

      Array.from(processed.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) html += node.textContent;
        else html += (node as HTMLElement).outerHTML;
      });

      return html;
    }
  }

  export namespace object {
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
    export function flatten(
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
              Object.assign(result, flatten(v, stringify, itemPath));
            } else {
              result[itemPath] = stringify ? String(v) : v;
            }
          });

          continue;
        }

        // Handle nested objects
        if (typeof value === 'object') {
          Object.assign(result, flatten(value, stringify, path));
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
    export function entries<K extends string, V>(obj: Record<K, V>): [K, V][] {
      return Object.entries(obj) as [K, V][];
    }

    /**
     * Returns the values of an object as an array, with proper typing.
     * @param obj - The object to retrieve values from.
     * @returns An array of values from the object, typed as an array of the value type.
     */
    export function values<K extends string, V>(obj: Record<K, V>): V[] {
      return Object.values(obj) as V[];
    }

    /**
     * Returns the keys of an object as an array of strings, with proper typing.
     * @param obj - The object to retrieve keys from.
     * @returns An array of keys from the object, typed as an array of strings.
     */
    export function keys<K extends string, V>(obj: Record<K, V>): K[] {
      return Object.keys(obj) as K[];
    }
  }

  export namespace message {
    export type BadgeOptions =
      | Twitch.roles[]
      | Twitch.roles
      | `${Twitch.roles}/${number}`
      | `${Twitch.roles}/${number}`[];

    export type TwitchResult = {
      keys: Twitch.roles[];
      badges: Twitch.badge[];
      amount: {
        [K in Twitch.roles]?: number;
      };
    };

    export type YouTubeResult = {
      isVerified: boolean;
      isChatOwner: boolean;
      isChatSponsor: boolean;
      isChatModerator: boolean;
    };

    /**
     * Finds emotes in a given text.
     * @param text - The text to search for emotes.
     * @param emotes - An array of emotes to search for. Defaults to Local data emotes.
     * @returns An array of emotes found in the text with their positions.
     */
    export function findEmotesInText(text: string, emotes: Emote[] = Data.emotes): Emote[] {
      const result: Emote[] = [];

      emotes.forEach((emote) => {
        const name = emote.name;

        let searchIndex = 0;
        let start = 0;

        while (searchIndex < text.length) {
          const index = text.indexOf(name, start);

          if (index === -1) break;

          const before = index > 0 ? text[index - 1] : ' ';
          const after = index + name.length < text.length ? text[index + name.length] : ' ';

          if (/\s/.test(before) && /\s/.test(after)) {
            result.push({ ...emote, start: index, end: index + name.length });
          }

          start = index + 1;
        }
      });

      return result.sort((a, b) => a.start - b.start);
    }

    /**
     * Replaces emotes in the text with corresponding HTML image tags.
     * @param text - The text containing emotes.
     * @param emotes - An array of emotes with their positions in the text.
     * @returns The text with emotes replaced by HTML image tags.
     */
    export function replaceEmotesWithHTML(text: string, emotes: Emote[]): string {
      if (!emotes.length) return text;

      let result = '';
      let index = 0;

      emotes.forEach((emote) => {
        result += text.substring(index, emote.start);

        const emotesArray = Array.from({ ...emote.urls, length: 5 })
          .slice(1)
          .reverse()
          .filter(Boolean);

        const imgUrl = emotesArray[0] || emote.urls['1'];

        result += `<img src="${imgUrl}" alt="${emote.name}" class="emote" style="width: auto; height: 1em; vertical-align: middle;" />`;

        index = emote.end;
      });

      result += text.substring(index);

      return result;
    }

    /**
     * Replaces YouTube emotes in the text with corresponding HTML image tags.
     * @param text - The text containing YouTube emotes.
     * @param emotes - An array of YouTube emotes. Defaults to Local data YouTube emotes.
     * @returns The text with YouTube emotes replaced by HTML image tags.
     */
    export function replaceYoutubeEmotesWithHTML(
      text: string,
      emotes = Data.youtube_emotes,
    ): string {
      const emoteCodesInside = Array.from(text.matchAll(/:(.*?):/gim), (x) => x[0]);

      emoteCodesInside.forEach((code) => {
        const emote = emotes.find(
          (e) => e.shortcuts.includes(code) || e.searchTerms.includes(code.slice(1, -1)),
        );

        if (emote) {
          const url = emote.image.thumbnails.at(-1)?.url;
          const alt = emote.image.accessibility.accessibilityData.label;

          if (url) {
            text = text.replace(
              code,
              `<img src="${url}" alt="${alt}" class="emote" style="width: auto; height: 1em; vertical-align: middle;" />`,
            );
          }
        }
      });

      return text;
    }

    /**
     * Generates badge data based on the provided badges and platform.
     * @param badges - The badges to generate. Can be an array or a comma-separated string.
     * @param provider - The platform provider ('twitch' or 'youtube'). Defaults to 'twitch'.
     * @returns A promise that resolves to the generated badge data.
     * @example
     * ```javascript
     * // Generate Twitch badges
     * const twitchBadges = await generateBadges(['broadcaster', 'moderator'], 'twitch');
     * // Generate YouTube badges
     * const youtubeBadges = await generateBadges('sponsor, moderator', 'youtube');
     * ```
     */
    export async function generateBadges<T extends Provider>(
      badges: BadgeOptions = [],
      provider: T,
    ): Promise<T extends 'twitch' ? TwitchResult : YouTubeResult> {
      if (!Array.isArray(badges) && typeof badges === 'string') {
        badges = badges.split(',').map((e) => e.trim()) as Twitch.roles[];
      }

      var clearedBadges = badges.map((badge) => badge.split('/')[0] as Twitch.roles);

      if (!clearedBadges || !clearedBadges.length) {
        var max = random.number(1, 3);

        for await (const _ of Array.from({ length: max }, () => '')) {
          var current = random.array(Object.keys(Data.badges))[0] as Twitch.roles;

          if (!clearedBadges.includes(current) && Array.isArray(clearedBadges)) {
            clearedBadges.push(current);
          } else {
            clearedBadges = [current];
          }
        }
      }

      var result;

      switch (provider) {
        case 'twitch': {
          result = {
            keys: Array.from(clearedBadges).filter((e) => e in Data.badges) as Twitch.roles[],
            badges: Array.from(clearedBadges)
              .slice(0, 3)
              .map((badge) => Data.badges[badge])
              .filter(Boolean) as Twitch.badge[],
            amount: badges.reduce(
              (acc, data) => {
                var [badge, amount = '1'] = data.split('/') as [Twitch.roles, string];

                if (isNaN(parseInt(amount)) || !amount.length) amount = '1';

                acc[badge] = parseInt(amount) || 1;

                return acc;
              },
              {} as { [K in Twitch.roles]?: number },
            ),
          };

          break;
        }

        case 'youtube': {
          var details = {
            'verified': { isVerified: true },
            'broadcaster': { isChatOwner: true },
            'host': { isChatOwner: true },
            'sponsor': { isChatSponsor: true },
            'subscriber': { isChatSponsor: true },
            'moderator': { isChatModerator: true },
          };

          result = Object.entries(clearedBadges).reduce(
            (acc, [key]) => {
              if (key in details) {
                Object.assign(acc, details[key as keyof typeof details]);
              }

              return acc;
            },
            {
              isVerified: false,
              isChatOwner: false,
              isChatSponsor: false,
              isChatModerator: false,
            } as {
              isVerified: boolean;
              isChatOwner: boolean;
              isChatSponsor: boolean;
              isChatModerator: boolean;
            },
          );

          break;
        }
      }

      return result as T extends 'twitch' ? TwitchResult : YouTubeResult;
    }
  }

  export namespace event {
    /**
     * Parses the provider information from the event detail object.
     * @param detail - The event detail object received from the StreamElements event.
     * @returns An object containing the provider and the original event data.
     */
    export function parseProvider(
      detail: StreamElements.Event.onEventReceived,
      _provider?: Provider,
    ): ClientEvents {
      var provider: Provider =
        // @ts-ignore
        _provider ||
        // @ts-ignore
        detail.event?.provider ||
        // @ts-ignore
        detail.event?.service ||
        // @ts-ignore
        detail.event?.data?.provider ||
        // @ts-ignore
        window?.client?.details?.provider ||
        'twitch';

      const actAsStreamElements = [
        'kvstore:update',
        'bot:counter',
        'alertService:toggleSound',
        'tip-latest',
        'event:test',
        'event:skip',
      ] as StreamElements.Event.onEventReceived['listener'][];

      if (actAsStreamElements.some((l) => l === detail.listener)) provider = 'streamelements';

      const received = { provider: provider, data: detail } as ClientEvents;

      return received;
    }
  }

  export namespace string {
    export type Modifier = (
      value: string,
      param: string | null | undefined,
      values: { amount?: number; count?: number },
    ) => string;

    // Global presets that can be configured and reused across templates.
    // Each preset value is a modifier group string, e.g. "BOLD,COLOR:#ff0056".
    export const PRESETS: Record<string, string> = {};

    /**
     * Replaces occurrences in a string based on a pattern with the result of an asynchronous callback function.
     * @param string - The input string to perform replacements on.
     * @param pattern - The pattern to match in the string (can be a string or a regular expression).
     * @param callback - An asynchronous callback function that takes the matched substring and any captured groups as arguments and returns the replacement string.
     * @returns A promise that resolves to the modified string with replacements applied.
     * @example
     * ```javascript
     * const result = await string.replace("Hello World", /World/, async (match) => {
     *   return await fetchSomeData(match); // Assume this function fetches data asynchronously
     * });
     * console.log(result); // Output will depend on the fetched data
     * ```
     */
    export async function replace(
      string: string,
      pattern: string,
      callback: (match: string, ...groups: string[]) => Promise<string> | string,
    ): Promise<string> {
      const promises: Array<Promise<string>> = [];

      string.replace(pattern, (match: string, ...groups: string[]) => {
        const promise = typeof callback === 'function' ? callback(match, ...groups) : match;

        promises.push(Promise.resolve(promise));

        return match;
      });

      const replacements = await Promise.all(promises);

      return string.replace(pattern, () => replacements.shift() ?? '');
    }

    /**
     * Capitalizes the first letter of a given string.
     * @param string - The input string to be capitalized.
     * @returns The capitalized string.
     * @example
     * ```javascript
     * const result = string.capitalize("hello world");
     * console.log(result); // Output: "Hello world"
     * ```
     */
    export function capitalize(string: string): Capitalize<string> {
      return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<string>;
    }

    /**
     * Composes a template string by replacing placeholders with corresponding values and applying optional modifiers.
     * @param template - The template string containing placeholders in the format {key} and optional modifiers in the format [MODIFIER:param=value].
     * @param values - An object containing key-value pairs to replace the placeholders in the template.
     * @param options - Optional settings for the composition process.
     * @returns The composed string with placeholders replaced and modifiers applied.
     * @example
     * ```javascript
     * const { string } = Tixyel.Helper;
     *
     * // Basic usage with placeholders and simple modifiers
     * const template1 = "Hello, {username}! You have {amount} [UPC=messages] and your name is [CAP=name].";
     * const values1 = { username: "john_doe", amount: 5, name: "john" };
     * const result1 = string.compose(template1, values1);
     * // "Hello, john_doe! You have 5 MESSAGES and your name is John."
     *
     * // Multiple modifiers in a single block (HTML enabled)
     * const template2 = "[COLOR:#ff0056,BOLD={username}]";
     * const values2 = { username: "john_doe" };
     * const result2 = string.compose(template2, values2, { html: true });
     * // '<span class="color bold" style="color: #ff0056; font-weight: bold;">john_doe</span>'
     *
     * // Conditional rendering with IF (supports ===, >=, &&, ||, !, etc.)
     * const template3 = "[IF=vip && status === 'live'?VIP Online|Offline]";
     * const values3 = { status: 'live', vip: true };
     * const result3 = string.compose(template3, values3);
     * // "VIP Online"
     *
     * // Pluralization using amount / count or an explicit key
     * const template4 = "You have {amount} [PLURAL=message|messages].";
     * const values4 = { amount: 1 };
     * const values5 = { amount: 3 };
     * const result4a = string.compose(template4, values4); // "You have 1 message."
     * const result4b = string.compose(template4, values5); // "You have 3 messages."
     *
     * // Number formatting
     * const template5 = "Total: [NUMBER:2=amount] {currency}";
     * const values6 = { amount: 1234.5, currency: '$' };
     * const result5 = string.compose(template5, values6);
     * // e.g. "Total: 1,234.50 $" (locale dependent)
     *
     * // Date and time formatting
     * const template6 = "Created at: [DATE:iso=createdAt] ([DATE:relative=createdAt])";
     * const values7 = { createdAt: new Date('2020-01-02T03:04:05.000Z') };
     * const result6 = string.compose(template6, values7);
     * // e.g. "Created at: 2020-01-02T03:04:05.000Z (Xs ago)"
     *
     * // MAP / SWITCH style mapping
     * const template7 = "Status: [MAP:status=live:Online|offline:Offline|default:Unknown]";
     * const values8 = { status: 'offline' };
     * const result7 = string.compose(template7, values8);
     * // "Status: Offline"
     *
     * // Escaping HTML
     * const template8 = "[ESCAPE={message}]";
     * const values9 = { message: '<b>Danger & "HTML"</b>' };
     * const result8 = string.compose(template8, values9);
     * // "&lt;b&gt;Danger &amp; &quot;HTML&quot;&lt;/b&gt;"
     *
     * // Using global presets
     * Helper.string.PRESETS['alert'] = 'BOLD,COLOR:#ff0056';
     * const template10 = "[PRESET:alert={username}]";
     * const values11 = { username: 'john_doe' };
     * const result10 = string.compose(template10, values11, { html: true });
     * // '<span class="color bold" style="color: #ff0056; font-weight: bold;">john_doe</span>'
     * ```
     */
    export function compose(
      template: string,
      values: Record<string, any> = {},
      options: {
        method?: 'loop' | 'index';
        html?: boolean;
        debug?: boolean;
        modifiers?: Record<string, Modifier>;
        aliases?: Record<string, string[]>;
      } = {
        method: 'index',
        html: false,
        debug: false,
        modifiers: {},
        aliases: {},
      },
    ): string {
      const { mergeSpanStyles } = element;

      const span = (style: string, value: string, className?: string) => {
        if (options.html) {
          return mergeSpanStyles(style, value, className);
        } else {
          return value;
        }
      };

      const baseValues = {
        skip: '<br/>',
        newline: '<br/>',
        ...values,
      };

      let defaultCurrency = '$';
      let defaultCurrencyCode = 'USD';

      if (typeof window !== 'undefined') {
        try {
          const client: any = (window as any)?.client;
          const currency = client?.details?.currency;

          if (currency?.symbol) defaultCurrency = String(currency.symbol);
          if (currency?.code) defaultCurrencyCode = String(currency.code);
        } catch {
          // ignore – fall back to defaults
        }
      }

      const flatten: Record<string, string> = Object.entries(object.flatten(baseValues)).reduce(
        (acc, [k, v]) => {
          acc[k] = String(v);

          if (['username', 'name', 'nick', 'nickname', 'sender'].some((e) => k === e)) {
            const username =
              acc?.username || acc?.name || acc?.nick || acc?.nickname || acc?.sender;

            acc['username'] = acc.username || username;
            acc['usernameAt'] = `@${acc.username}`;
            acc['name'] = acc.name || username;
            acc['nick'] = acc.nick || username;
            acc['nickname'] = acc.nickname || username;
            acc['sender'] = acc.sender || username;
            acc['senderAt'] = `@${acc.sender}`;
          }

          if (['amount', 'count'].some((e) => k === e)) {
            acc['amount'] = String(acc?.amount || acc.count || v);
            acc['count'] = String(acc?.count || acc?.amount || v);
          }

          acc['currency'] = acc.currency || defaultCurrency;
          acc['currencyCode'] = acc.currencyCode || defaultCurrencyCode;

          return acc;
        },
        {} as Record<string, string>,
      );

      const REGEX = {
        PLACEHOLDERS: /{([^}]+)}/g,
        MODIFIERS: /\[([^\]=]+)=([^\]]+)\]/g,
      };

      var amount = parseFloat(flatten?.amount ?? flatten?.count ?? 0);

      function getNumericFromKeyOrValue(
        keyOrValue: string,
        valuesMap: Record<string, string>,
      ): number | null {
        const trimmed = keyOrValue?.trim?.() ?? '';
        if (!trimmed.length) return null;

        const fromValues = (valuesMap as any)[trimmed];
        const candidate = fromValues !== undefined ? fromValues : trimmed;
        const num = parseFloat(String(candidate).replace(/\s/g, ''));

        return isNaN(num) ? null : num;
      }

      function formatNumber(
        value: string,
        param: string | null | undefined,
        valuesMap: Record<string, string>,
      ): string {
        const decimals = !isNaN(Number(param)) ? Math.max(0, parseInt(String(param))) : 0;

        const num = getNumericFromKeyOrValue(value, valuesMap);
        if (num === null) return value;

        try {
          return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
        } catch {
          return num.toFixed(decimals);
        }
      }

      function formatRelativeTime(date: Date, now: Date = new Date()): string {
        const diffMs = now.getTime() - date.getTime();
        const past = diffMs >= 0;
        const abs = Math.abs(diffMs);

        const sec = Math.floor(abs / 1000);
        const min = Math.floor(sec / 60);
        const hour = Math.floor(min / 60);
        const day = Math.floor(hour / 24);
        const month = Math.floor(day / 30);
        const year = Math.floor(day / 365);

        const suffix = past ? 'ago' : 'from now';

        if (year > 0) return `${year}y ${suffix}`;
        if (month > 0) return `${month}mo ${suffix}`;
        if (day > 0) return `${day}d ${suffix}`;
        if (hour > 0) return `${hour}h ${suffix}`;
        if (min > 0) return `${min}m ${suffix}`;
        return `${Math.max(sec, 0)}s ${suffix}`;
      }

      function formatDateLike(
        value: string,
        param: string | null | undefined,
        valuesMap: Record<string, string>,
      ): string {
        const keyOrLiteral = value?.trim?.() ?? '';
        if (!keyOrLiteral.length) return value;

        const raw = (valuesMap as any)[keyOrLiteral] ?? keyOrLiteral;
        const date = new Date(raw);

        if (isNaN(date.getTime())) return value;

        const mode = (param ?? 'date').toString().toLowerCase();

        try {
          switch (mode) {
            case 'time':
              return date.toLocaleTimeString();
            case 'datetime':
            case 'full':
              return date.toLocaleString();
            case 'relative':
            case 'ago':
              return formatRelativeTime(date);
            case 'iso':
              return date.toISOString();
            case 'date':
            default:
              return date.toLocaleDateString();
          }
        } catch {
          return value;
        }
      }

      function pluralize(
        value: string,
        param: string | null | undefined,
        valuesMap: Record<string, string>,
      ): string {
        const text = value ?? '';
        const [singular, plural = singular] = text.split('|', 2);

        const key = param?.trim();
        let source: any = undefined;

        if (key && (valuesMap as any)[key] !== undefined) {
          source = (valuesMap as any)[key];
        } else {
          source = (valuesMap as any).amount ?? (valuesMap as any).count;
        }

        const num = parseFloat(String(source));
        if (isNaN(num)) return singular;

        const isPlural = Math.abs(num) !== 1;
        return isPlural ? plural : singular;
      }

      function mapSwitch(
        value: string,
        param: string | null | undefined,
        valuesMap: Record<string, string>,
      ): string {
        const key = param?.trim() ?? '';
        const targetRaw =
          key && (valuesMap as any)[key] !== undefined ? (valuesMap as any)[key] : '';
        const target = String(targetRaw);

        const entries = (value ?? '')
          .split('|')
          .map((p) => p.trim())
          .filter((p) => p.length);
        let defaultResult: string | undefined;

        for (const entry of entries) {
          const idx = entry.indexOf(':');
          if (idx === -1) continue;

          const mapKey = entry.slice(0, idx).trim();
          const mapValue = entry.slice(idx + 1);

          if (!mapKey.length) continue;

          if (mapKey.toLowerCase() === 'default') {
            defaultResult = mapValue;
            continue;
          }

          if (target === mapKey) return mapValue;
        }

        return defaultResult ?? '';
      }

      function escapeHtml(value: string): string {
        return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function parseLiteralOrValue(token: string, valuesMap: Record<string, string>): any {
        let trimmed = token.trim();

        if (!trimmed.length) return undefined;

        const firstChar = trimmed[0];
        const lastChar = trimmed[trimmed.length - 1];

        if ((firstChar === '"' && lastChar === '"') || (firstChar === "'" && lastChar === "'")) {
          return trimmed.slice(1, -1);
        }

        const lowered = trimmed.toLowerCase();
        if (lowered === 'true') return true;
        if (lowered === 'false') return false;

        if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);

        const fromValues = valuesMap?.[trimmed];
        if (fromValues === undefined) return trimmed;

        const fromValuesStr = String(fromValues).trim();
        const fromValuesLower = fromValuesStr.toLowerCase();

        if (fromValuesLower === 'true') return true;
        if (fromValuesLower === 'false') return false;

        if (/^-?\d+(\.\d+)?$/.test(fromValuesStr)) return parseFloat(fromValuesStr);

        return fromValues;
      }

      function coerceToBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (value === null || value === undefined) return false;

        const str = String(value).trim().toLowerCase();
        if (!str.length) return false;

        if (['false', '0', 'no', 'off', 'null', 'undefined', 'nan'].includes(str)) return false;

        return true;
      }

      function evaluateAtomicCondition(
        expression: string,
        valuesMap: Record<string, string>,
      ): boolean {
        let expr = expression.trim();
        if (!expr.length) return false;

        let invert = false;
        while (expr.startsWith('!')) {
          invert = !invert;
          expr = expr.slice(1).trim();
        }

        const operators = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
        let op: string | null = null;
        let left = expr;
        let right = '';

        for (const candidate of operators) {
          const idx = expr.indexOf(candidate);
          if (idx !== -1) {
            op = candidate;
            left = expr.slice(0, idx);
            right = expr.slice(idx + candidate.length);
            break;
          }
        }

        let result: boolean;

        if (!op) {
          const value = parseLiteralOrValue(left, valuesMap);
          result = coerceToBoolean(value);
        } else {
          const leftVal = parseLiteralOrValue(left, valuesMap);
          const rightVal = parseLiteralOrValue(right, valuesMap);

          switch (op) {
            case '===':
              result = leftVal === rightVal;
              break;
            case '!==':
              result = leftVal !== rightVal;
              break;
            case '==':
              // eslint-disable-next-line eqeqeq
              result = (leftVal as any) == (rightVal as any);
              break;
            case '!=':
              // eslint-disable-next-line eqeqeq
              result = (leftVal as any) != (rightVal as any);
              break;
            case '>=':
              result = (leftVal as any) >= (rightVal as any);
              break;
            case '<=':
              result = (leftVal as any) <= (rightVal as any);
              break;
            case '>':
              result = (leftVal as any) > (rightVal as any);
              break;
            case '<':
              result = (leftVal as any) < (rightVal as any);
              break;
            default:
              result = false;
              break;
          }
        }

        return invert ? !result : result;
      }

      function evaluateConditionExpression(
        expression: string,
        valuesMap: Record<string, string>,
      ): boolean {
        let expr = expression.trim();
        if (!expr.length) return false;

        let invert = false;
        while (expr.startsWith('!')) {
          invert = !invert;
          expr = expr.slice(1).trim();
        }

        const orParts = expr
          .split('||')
          .map((p) => p.trim())
          .filter((p) => p.length);
        if (!orParts.length) return invert ? true : false;

        let result = false;

        for (const orPart of orParts) {
          const andParts = orPart
            .split('&&')
            .map((p) => p.trim())
            .filter((p) => p.length);
          if (!andParts.length) continue;

          let andResult = true;
          for (const andPart of andParts) {
            const partResult = evaluateAtomicCondition(andPart, valuesMap);
            andResult = andResult && partResult;
            if (!andResult) break;
          }

          result = result || andResult;
          if (result) break;
        }

        return invert ? !result : result;
      }

      const HTML_MODIFIERS: Record<string, Modifier> = {
        COLOR: (value, param) =>
          span(param && !!color.validate(param) ? `color: ${param}` : '', value, 'color'),
        WEIGHT: (value, param) =>
          span(param && !isNaN(parseInt(param)) ? `font-weight: ${param}` : '', value, 'weight'),
        SEMIBOLD: (value) => span('font-weight: 600', value, 'semibold'),
        BOLD: (value) => span('font-weight: bold', value, 'bold'),
        BLACK: (value) => span('font-weight: 900', value, 'black'),
        LIGHT: (value) => span('font-weight: lighter', value, 'light'),
        STRONG: (value) => span('font-weight: bolder', value, 'strong'),
        ITALIC: (value) => span('font-style: italic', value, 'italic'),
        UNDERLINE: (value) => span('text-decoration: underline', value, 'underline'),
        STRIKETHROUGH: (value) => span('text-decoration: line-through', value, 'strikethrough'),
        SUB: (value) => span('vertical-align: sub', value, 'sub'),
        SUP: (value) => span('vertical-align: super', value, 'sup'),
        LARGER: (value) => span('font-size: larger', value, 'larger'),
        SMALL: (value) => span('font-size: smaller', value, 'small'),
        SHADOW: (value, param) => span(`text-shadow: ${param}`, value, 'shadow'),
        SIZE: (value, param) => span(param ? `font-size: ${param}` : '', value, 'size'),
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
        NUMBER: (value, param, valuesMap) =>
          formatNumber(value, param, valuesMap as Record<string, string>),
        PLURAL: (value, param, valuesMap) =>
          pluralize(value, param, valuesMap as Record<string, string>),
        DATE: (value, param, valuesMap) =>
          formatDateLike(value, param, valuesMap as Record<string, string>),
        MAP: (value, param, valuesMap) =>
          mapSwitch(value, param, valuesMap as Record<string, string>),
        ESCAPE: (value) => escapeHtml(value),
        IF: (value, _param, valuesMap) => {
          const text = value ?? '';

          const [rawCondition, rest] = text.split('?', 2);
          if (!rest) return text;

          const [whenTrue, whenFalse = ''] = rest.split('|', 2);

          const condition = evaluateConditionExpression(
            rawCondition,
            valuesMap as Record<string, string>,
          );

          return condition ? whenTrue : whenFalse;
        },
        PRESET: (value, param) => {
          const name = param?.trim() ?? '';
          if (!name.length) return value;

          const group = PRESETS[name];
          if (!group || !group.length) return value;

          const modifiers = group
            .split(',')
            .map((part) => part.trim())
            .filter((part) => part.length)
            .map((part) => {
              const [mName, mParam] = part.split(':');
              return { name: mName.trim(), param: mParam?.trim() ?? null };
            });

          let result = value;
          for (const { name: mName, param: mParam } of modifiers) {
            result = applyModifier(result, mName, mParam);
          }

          return result;
        },
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
        NUMBER: ['NUMBER', 'NUM', 'FORMAT_NUMBER', 'FMT_NUM'],
        PLURAL: ['PLURAL', 'PL', 'PLR'],
        DATE: ['DATE', 'DATETIME', 'TIME', 'DT'],
        MAP: ['MAP', 'SWITCH'],
        ESCAPE: ['ESCAPE', 'ESC', 'ESC_HTML', 'ESCAPE_HTML'],
        PRESET: ['PRESET', 'STYLE', 'THEME'],
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
        IF: ['IF', 'COND', 'CONDITION'],
        ...(options.aliases ?? {}),
      };

      function applyModifier(
        value: string,
        name: string,
        param: string | null | undefined,
      ): string {
        const canonical = Object.entries(ALIASES).find(([key, aliases]) => {
          if (aliases.some((alias) => alias.toUpperCase() === name.toUpperCase())) return true;
          else if (key.toUpperCase() === name.toUpperCase()) return true;
          else return false;
        });
        const use = canonical ? canonical[0] : name.toUpperCase();

        try {
          if (MODIFIERS[use])
            return MODIFIERS[use](value, typeof param === 'string' ? param.trim() : null, flatten);
          else if (options?.html) return span('', value, use.toLowerCase());
          else return value;
        } catch (error) {
          if (
            options?.debug &&
            typeof console !== 'undefined' &&
            typeof console.error === 'function'
          ) {
            console.error('[Helper.string.compose] Modifier error', { name, param, error });
          }
          return value;
        }
      }

      function replaceAll(string: string): string {
        let str = string;
        let match;

        while ((match = REGEX.MODIFIERS.exec(str)) !== null) {
          const [fullMatch, modifierGroup, value] = match;

          const modifiers = modifierGroup
            .split(',')
            .map((part) => part.trim())
            .filter((part) => part.length)
            .map((part) => {
              const [name, param] = part.split(':');
              return { name: name.trim(), param: param?.trim() ?? null };
            });

          let newValue = replaceAll(value);

          for (const { name, param } of modifiers) {
            newValue = applyModifier(newValue, name, param);
          }

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
          const modifiers: { name: string; param: string | null }[] = [];

          while (i < len && str[i] !== '=') {
            if (str[i] === ',') {
              i++;
              continue;
            }

            let name = '';
            while (i < len && /[A-Za-z0-9]/.test(str[i])) name += str[i++];

            let param: string | null = null;
            if (str[i] === ':') {
              i++;
              const paramStart = i;
              while (i < len && str[i] !== ',' && str[i] !== '=') i++;
              param = str.slice(paramStart, i);
            }

            if (name.length) {
              modifiers.push({ name, param });
            }

            if (str[i] === ',') {
              i++;
            }
          }

          if (str[i] === '=') i++;

          const value = parseText(']');

          return modifiers.reduce((val, { name, param }) => applyModifier(val, name, param), value);
        }

        return parseText();
      }

      let result = template.replace(REGEX.PLACEHOLDERS, (_, key: string) =>
        typeof flatten[key] === 'string' || typeof flatten[key] === 'number'
          ? String(flatten[key])
          : (key ?? key),
      );

      result = options.method === 'loop' ? replaceAll(result) : parseModifiers(result);

      return result;
    }
  }

  export namespace sound {
    export let playing: boolean = false;
    export let audio: AudioContext;

    /**
     * Play sound from URL with optional volume and replace parameters
     * @param url - Sound URL to play
     * @param volume - Volume level from 0 to 100 (default: 100)
     * @param replace - If true, replaces currently playing sound (default: false)
     */
    export function play(url: string, volume: number = 100, replace = false) {
      if (!url || !url.length) {
        throw new Error('No sound URL provided');
      }

      try {
        if (replace && playing && audio && audio.state !== 'closed') audio.close();

        let ctx = new AudioContext();
        let gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);

        if (replace) {
          audio = ctx;
          playing = true;
        }

        fetch(url)
          .then((data) => data.arrayBuffer())
          .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
          .then((decodedAudio) => {
            if (ctx.state !== 'closed') {
              const playSound = ctx.createBufferSource();
              playSound.buffer = decodedAudio;
              playSound.connect(gainNode);
              gainNode.gain.value = volume / 100;
              playSound.start(ctx.currentTime);
            }
          });
      } catch (error) {
        throw new Error(`Error playing sound: ${error}`);
      }
    }
  }

  export namespace color {
    /**
     * Generate opacity hex value
     * @param opacity - Opacity value from 0 to 100
     * @param color - Hex color code
     * @returns - Hex color code with opacity
     */
    export function opacity(opacity: number = 100, color: string = '') {
      color = color.length > 7 ? color?.substring(0, 6) : color;
      opacity = opacity > 1 ? opacity / 100 : opacity;

      let result = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
        .toString(16)
        .toLowerCase()
        .padStart(2, '0');

      return color + result;
    }

    /**
     * Extract color and opacity from hex code
     * @param hex - Hex color code
     * @returns - Object with color and opacity
     */
    export function extract(hex: string) {
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
    }

    /**
     * Validate color string format
     * @param str - Color string to validate
     * @returns Detected color format or false if invalid
     * @example
     * ```javascript
     * const format1 = color.validate("#FF5733"); // "hex"
     * const format2 = color.validate("rgb(255, 87, 51)"); // "rgb"
     * const format3 = color.validate("hsl(14, 100%, 60%)"); // "hsl"
     * const format4 = color.validate("orangered"); // "css-color-name"
     * const format5 = color.validate("invalid-color"); // false
     * ```
     */
    export function validate(str: string) {
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

      if (Data.css_color_names.includes(s.toLowerCase())) {
        return 'css-color-name';
      }

      return false;
    }

    /**
     * Convert color to different format
     * @param str - Color string to convert (e.g. "#FF5733", "rgb(255, 87, 51)")
     * @param format - Target format
     * @returns - Converted color string
     * @example
     * ```javascript
     * const hexColor = color.convert("rgb(255, 87, 51)", "hex"); // "#FF5733"
     * const rgbColor = color.convert("#FF5733", "rgb"); // "rgb(255, 87, 51)"
     * const hslColor = color.convert("#FF5733", "hsl"); // "hsl(14, 100%, 60%)"
     * const colorName = color.convert("#FF5733", "css-color-name"); // "orangered"
     * ```
     */
    export async function convert(
      str: string,
      format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-color-name',
    ): Promise<string | null> {
      const valid = validate(str);

      if (!valid) throw new Error(`Invalid color format: ${str}`);

      if (valid === format) throw new Error(`Color is already in the desired format: ${format}`);

      const rgba = parseToRGBA(str.trim(), valid);

      if (!rgba) throw new Error(`Failed to parse color: ${str}`);

      switch (format) {
        case 'hex': {
          return rgbaToHex(rgba, false);
        }
        case 'rgb': {
          return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
        }
        case 'rgba': {
          return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
        }
        case 'hsl': {
          const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
          return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        }
        case 'hsla': {
          const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
          return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${rgba.a})`;
        }
        case 'css-color-name': {
          return await findClosestColorName(rgba.r, rgba.g, rgba.b);
        }
        default: {
          return null;
        }
      }
    }
  }

  export namespace random {
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
    export function color(
      type: 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-color-name' = 'hex',
    ) {
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
          var names = Data.css_color_names;

          return array(names)[0];
        }
      }
    }

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
    export function number(min: number, max: number, float: number = 0): number {
      if (min > max) [min, max] = [max, min];

      const rand = Math.random() * (max - min) + min;
      return float ? Number(rand.toFixed(float)) : Math.round(rand);
    }

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
    export function boolean(threshold: number = 0.5): boolean {
      return Math.random() > threshold;
    }

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
    export function string(
      length: number,
      chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    ): string {
      let result = '';

      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return result;
    }

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
    export function array<T>(arr: T[]): [value: T, index: number] {
      const index = number(0, arr.length - 1);

      return [arr[index], index];
    }

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
    export function date(start: Date = new Date(2000, 0, 1), end: Date = new Date()): Date {
      const date = new Date(number(start.getTime(), end.getTime()));

      return date;
    }

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
    export function daysOffset(daysAgo: number): string {
      const now = Date.now();
      const past = now - number(0, daysAgo * 24 * 60 * 60 * 1000);

      return new Date(past).toISOString();
    }

    /**
     * Generate UUID v4
     * @returns - UUID string
     * @example
     * ```javascript
     * const uuid = random.uuid();
     * console.log(uuid); // e.g. "3b12f1df-5232-4e3a-9a0c-3f9f1b1b1b1b"
     * ```
     */
    export function uuid(): string {
      return crypto.randomUUID();
    }
  }

  export namespace fn {
    /**
     * Apply function with given thisArg and arguments
     * @param fn - Function to apply
     * @param thisArg - Value to use as this when calling fn
     * @param args - Arguments to pass to fn
     * @returns Result of calling fn with thisArg and args
     */
    export function apply<TThis, TArgs extends unknown[], TReturn>(
      fn: (this: TThis, ...args: TArgs) => TReturn,
      thisArg: TThis,
      args: TArgs,
    ): TReturn {
      return fn.apply(thisArg, args);
    }

    /**
     * Call function with given thisArg and arguments
     * @param fn - Function to call
     * @param thisArg - Value to use as this when calling fn
     * @param args - Arguments to pass to fn
     * @returns Result of calling fn with thisArg and args
     */
    export function call<TThis, TArgs extends unknown[], TReturn>(
      fn: (this: TThis, ...args: TArgs) => TReturn,
      thisArg: TThis,
      ...args: TArgs
    ): TReturn {
      return fn.call(thisArg, ...args);
    }
  }

  export namespace utils {
    /**
     * Delays execution for a specified number of milliseconds.
     * @param ms - The number of milliseconds to delay.
     * @returns A Promise that resolves after the specified delay.
     */
    export function delay<R extends any, M extends number>(
      ms: M,
      callback?: () => R,
    ): Promise<R | null> {
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
    export function typedEntries<K extends string, V>(obj: Record<K, V> | Array<V>): [K, V][] {
      return Object.entries(obj) as [K, V][];
    }

    /**
     * Returns typed values of an object.
     * @param obj - The object to get values from.
     * @returns An array of values from the object.
     */
    export function typedValues<K extends string, V>(obj: Record<K, V> | Array<V>): V[] {
      return Object.values(obj) as V[];
    }

    /**
     * Returns typed keys of an object.
     * @param obj - The object to get keys from.
     * @returns An array of keys from the object.
     */
    export function typedKeys<K extends string, V>(obj: Record<K, V> | Array<V>): K[] {
      return Object.keys(obj) as K[];
    }

    /**
     * Selects an item based on weighted probabilities.
     * @param items - An object where keys are items and values are their weights.
     * @returns A randomly selected item based on the given probabilities.
     */
    export function probability<K extends string, V extends number>(
      items: Record<K, V>,
    ): K | undefined {
      const total = (Object.values(items) as number[]).reduce((acc, val) => acc + val, 0);
      const sorted = typedEntries(items).sort((a, b) => b[1] - a[1]);
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
}
