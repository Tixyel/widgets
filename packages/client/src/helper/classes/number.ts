/**
 * NumberHelper class provides utility methods for working with numbers, including translation to words, balancing within a range, rounding, and generating random numbers.
 */
export class NumberHelper {
  /**
   * Translate number to words
   * @param num - Number to translate
   * @param type - Translation type
   * @returns - Number in words
   * @example
   * ```javascript
   * const cardinal = translate(42, 'cardinal');
   * console.log(cardinal); // "forty-two"
   * const ordinal = translate(42, 'ordinal');
   * console.log(ordinal); // "forty-second"
   * const suffix = translate(42, 'suffix');
   * console.log(suffix); // "42nd"
   * ```
   */
  translate(num: number, type: 'cardinal' | 'ordinal' | 'suffix' = 'cardinal'): string {
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
    const SCALES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion'];
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
        if (kind === 'ordinal' && rest === 0) parts.push(`${CARDINALS.single[hundreds]} hundredth`);
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
   * const balancedValue = balance(150, 0, 100);
   * console.log(balancedValue); // 100
   * ```
   */
  balance(amount: number, min: number = 0, max: number = 100, decimals: number = 0): number {
    const result = Math.min(Math.max(amount, min), max);

    return this.round(result, decimals);
  }

  /**
   * Rounds a number to a specified number of decimal places
   * @param value - Number to round
   * @param decimals - Number of decimal places (default is 2)
   * @returns Rounded number
   * @example
   * ```javascript
   * const roundedValue = round(3.14159, 3);
   * console.log(roundedValue); // 3.142
   * const roundedValueDefault = round(3.14159);
   * console.log(roundedValueDefault); // 3.14
   * const roundedValueZero = round(3.14159, 0);
   * console.log(roundedValueZero); // 3
   * ```
   */
  round(value: number, decimals: number = 2): number {
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
   * const intNumber = random(1, 10);
   * console.log(intNumber); // e.g. 7
   *
   * const floatNumber = random(1, 10, 2);
   * console.log(floatNumber); // e.g. 3.14
   * ```
   */
  random(min: number, max: number, float: number = 0): number {
    if (min > max) [min, max] = [max, min];

    const rand = Math.random() * (max - min) + min;
    return float ? Number(rand.toFixed(float)) : Math.round(rand);
  }
}
