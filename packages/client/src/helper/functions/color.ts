import { findClosestColorName, parseToRGBA, rgbaToHex, rgbToHsl } from '../../utils/color.js';
import { css_color_names } from '../../data/collection/css.js';
import random from './random.js';

const functions = {
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

    if (css_color_names.includes(s.toLowerCase())) {
      return 'css-color-name';
    }

    return false;
  },

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
  async convert(str: string, format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-color-name'): Promise<string | null> {
    const valid = this.validate(str);

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
  },
  /**
   * Generate random color
   * @param type - Color format
   * @returns - Random color in specified format
   * @example
   * ```javascript
   * const hexColor = color.random('hex');
   * console.log(hexColor); // e.g. #3e92cc
   *
   * const rgbColor = color.random('rgb');
   * console.log(rgbColor); // e.g. rgb(62, 146, 204)
   * ```
   */
  random: random.color,
};

export default functions;
