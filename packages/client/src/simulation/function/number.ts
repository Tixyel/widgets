export const number = {
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
  translate(num: number, type: 'cardinal' | 'ordinal' | 'suffix' = 'cardinal'): string {
    const CARDINALS = {
      single: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      tens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
      decades: ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
    };
    const ORDINALS = {
      single: ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      tens: ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'],
      decades: ['twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth'],
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
      if (single === 0) return kind === 'ordinal' ? ORDINALS.decades[decade - 2] : CARDINALS.decades[decade - 2];
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
  },

  /**
   * Balances a number within a specified range
   * @param amount - Number to balance
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns - Balanced number
   * @example
   * ```javascript
   * const balancedValue = Simulation.number.balance(150, 0, 100);
   * console.log(balancedValue); // 100
   * ```
   */
  balance(amount: number, min: number = 0, max: number = 100) {
    return Math.min(Math.max(amount, min), max);
  },
};
