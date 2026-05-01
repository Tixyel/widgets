import { ColorHelper } from './color.js';
import { ElementHelper } from './element.js';
import { ObjectHelper } from './object.js';

export type Modifier = (
  value: string,
  param: string | null | undefined,
  values: { amount?: number; count?: number },
) => string;

export class StringHelper {
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
  async replace(
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
  capitalize(string: string): Capitalize<string> {
    return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<string>;
  }

  PRESETS: Record<string, string> = {};

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
  compose(
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
    const { mergeSpanStyles } = new ElementHelper();

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

    const object = new ObjectHelper();

    const flatten: Record<string, string> = Object.entries(object.flatten(baseValues)).reduce(
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
      const targetRaw = key && (valuesMap as any)[key] !== undefined ? (valuesMap as any)[key] : '';
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

    const color = new ColorHelper();

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

        const group = this.PRESETS[name];
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

    function applyModifier(value: string, name: string, param: string | null | undefined): string {
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

  /**
   * Removes newline characters from a string and replaces them with spaces.
   * @param string - The input string from which to remove newline characters.
   * @returns The modified string with newline characters replaced by spaces.
   * @example
   * ```javascript
   * const result = string.removeNewlines("Hello\nWorld\r\nThis is a test.");
   * console.log(result); // Output: "Hello World This is a test."
   * ```
   */
  removeNewlines(string: string): string {
    return string.replace(/\r?\n|\r/g, ' ');
  }

  removeExtraSpaces(string: string): string {
    return string.replace(/\s+/g, ' ').trim();
  }
}
