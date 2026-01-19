import { color } from './color.js';
import { element } from './element.js';
import { object } from './object.js';

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
   * const result = await string.replace("Hello World", /World/, async (match) => {
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
   * const result = string.capitalize("hello world");
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
   * const result = string.compose(template, values);
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

    const span = (style: string, value: string, className?: string) => {
      if (options.html) {
        return mergeSpanStyles(style, value, className);
      } else {
        return value;
      }
    };

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
          acc['amount'] = String(acc?.amount || acc.count || v);
          acc['count'] = String(acc?.count || acc?.amount || v);
        }

        acc['currency'] = acc.currency || window?.client?.details.currency.symbol || '$';
        acc['currencyCode'] = acc.currencyCode || window?.client?.details.currency.code || 'USD';

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
      COLOR: (value, param) => span(param && !!color.validate(param) ? `color: ${param}` : '', value, 'color'),
      WEIGHT: (value, param) => span(param && !isNaN(parseInt(param)) ? `font-weight: ${param}` : '', value, 'weight'),
      BOLD: (value) => span('font-weight: bold', value, 'bold'),
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

      try {
        if (MODIFIERS[use]) return MODIFIERS[use](value, typeof param === 'string' ? param.trim() : null, flatten);
        else if (options?.html) return span('', value, use.toLowerCase());
        else return value;
      } catch (error) {
        return value;
      }
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
