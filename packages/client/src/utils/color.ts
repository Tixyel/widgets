import { css_color_names } from '../data/collection/css.js';

/**
 * Parse a color string to RGBA components
 * @param str - color string
 * @param format - format of the input color string
 * @returns - RGBA components or null if parsing fails
 */
export function parseToRGBA(
  str: string,
  format: string | false,
): { r: number; g: number; b: number; a: number } | null {
  if (!format) return null;

  switch (format) {
    case 'hex': {
      const hex = str.replace('#', '');
      let r = 0,
        g = 0,
        b = 0,
        a = 1;

      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (hex.length === 4) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
        a = parseInt(hex[3] + hex[3], 16) / 255;
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16) / 255;
      }

      return { r, g, b, a };
    }

    case 'rgb':
    case 'rgba': {
      const match = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
      if (!match) return null;

      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }

    case 'hsl':
    case 'hsla': {
      const match = str.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)/);
      if (!match) return null;

      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);
      const a = match[4] ? parseFloat(match[4]) : 1;

      const rgb = hslToRgb(h, s, l);
      return { ...rgb, a };
    }

    case 'css-color-name': {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = str;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

      return { r, g, b, a: 1 };
    }

    default:
      return null;
  }
}

/**
 * Convert RGBA to Hex
 * @param rgba - RGBA components
 * @param includeAlpha - Whether to include alpha in the hex string
 * @returns Hex color string
 */
export function rgbaToHex(
  rgba: { r: number; g: number; b: number; a: number },
  includeAlpha: boolean = true,
): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

  let hex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;

  if (includeAlpha && rgba.a < 1) {
    hex += toHex(rgba.a * 255);
  }

  return hex;
}

/**
 * Convert RGB to HSL
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSL components
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns RGB components
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Find the closest CSS color name to the given RGB values
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Closest CSS color name
 */
export async function findClosestColorName(r: number, g: number, b: number): Promise<string> {
  const cssColors = css_color_names;

  let closestColor = cssColors[0];
  let minDistance = Infinity;

  for await (const colorName of cssColors) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;

    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    ctx.fillStyle = colorName;
    ctx.fillRect(0, 0, 1, 1);

    const [cr, cg, cb] = ctx.getImageData(0, 0, 1, 1).data;

    const distance = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2));

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }

    if (distance === 0) break;
  }

  return closestColor;
}
