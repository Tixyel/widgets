import { NumberHelper } from './number.js';

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

export class ElementHelper {
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
  mergeSpanStyles(outerStyle: string, innerHTML: string, className?: string): string {
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
  scale(
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
  scalev2<T extends HTMLElement>(element: T, options: ScaleOptions<T> = {}): number {
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
  fitText(element: HTMLElement, compressor: number = 1, options: FitTextOptions = {}) {
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

    const number = new NumberHelper();
    const result = number.balance(value, settings.minFontSize, settings.maxFontSize);

    element.style.fontSize = result + 'px';

    return element;
  }

  /**
   * Wraps formatted HTML text with containers and splits characters into indexed spans.
   * Adds 'container' class and data-index to all parent elements, and wraps each character in a span with class 'char' and data-index.
   * @param htmlString - The input HTML string containing formatted text elements (span, strong, em, etc).
   * @param startIndex - The starting index for the data-index attribute (default is 0).
   * @param preserveInterElementWhitespace - Whether to preserve whitespace between elements (default is false).
   * @param options - Optional settings for splitting text, including skipWhitespaceIndex to control index incrementing for whitespace characters.
   * @returns - A new HTML string with containers and character-level indexing.
   * @example
   * ```javascript
   * const result = splitTextToChars('<span>TesTe</span> <strong>bold</strong>', 0);
   * console.log(result);
   * // Output: '<span class="container" data-index="0"><span class="char" data-index="0">T</span><span class="char" data-index="1">e</span>...'
   *
   * // Example with skipWhitespaceIndex
   * const resultSkipWhitespace = splitTextToChars('<span>Hello World</span>', 0, false, { skipWhitespaceIndex: true });
   * // The space character will have data-index but won't increment index for subsequent characters
   * ```
   */
  splitTextToChars(
    htmlString: string,
    startIndex: number = 0,
    preserveInterElementWhitespace: boolean = false,
    options: {
      /**
       * If true, skips incrementing the index for whitespace characters (space, newline, tab).
       * These characters will still have a data-index, but it won't be incremented for subsequent characters.
       * Default is true.
       */
      skipWhitespaceIndex?: boolean;
    } = {},
  ): string {
    const { skipWhitespaceIndex = true } = options;
    const parser = new DOMParser();
    const processed = document.createElement('div');

    let charIndex = startIndex;

    function processNode(node: Node): Node | DocumentFragment {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        let exclusivityIndex = 0;

        const chars = text.split('').map((char) => {
          const span = document.createElement('span');

          span.classList.add('char');
          span.dataset.index = String(charIndex);
          span.dataset.exclusivityIndex = String(exclusivityIndex);
          span.dataset.type = 'char';
          span.style.setProperty('--char-index', String(charIndex));
          span.style.setProperty('--exclusivity-index', String(exclusivityIndex));

          const isWhitespace = char === ' ' || char === '\n' || char === '\t';

          if (isWhitespace) {
            span.style.whiteSpace = 'pre-wrap';

            span.classList.remove('char');
            span.classList.add('whitespace');

            span.dataset.type = 'whitespace';
          }

          if (!isWhitespace || !skipWhitespaceIndex) {
            charIndex++;
            exclusivityIndex++;
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
        clone.dataset.type = 'container';
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

  /**
   * Retrieves CSS variables defined in the stylesheets of the document for a given selector, with optional filtering and helper variable exclusion.
   * @param selector - The CSS selector to search for (default is ':root' to target global variables).
   * @param filter - A function to filter the retrieved CSS variables. It receives each variable as a [key, value] pair, along with its index and the full array of variables. Should return true to include the variable in the results.
   * @param options - Optional settings for retrieving CSS variables, including filterHelpers to exclude common helper variables (those ending with -min, -max, or -step).
   * @returns - An array of [key, value] pairs representing the CSS variables that match the selector and filter criteria.
   * @example
   * ```javascript
   * // Retrieve all CSS variables defined under :root
   * const variables = getElementCSSVariables();
   * console.log(variables);
   * // Retrieve CSS variables defined under a specific selector, e.g., .my-class
   * const classVariables = getElementCSSVariables('.my-class');
   * console.log(classVariables);
   * // Retrieve CSS variables with a custom filter, e.g., only variables that include 'color' in their name
   * const colorVariables = getElementCSSVariables(':root', ([key]) => key.includes('color'));
   * console.log(colorVariables);
   */
  getElementCSSVariables(
    selector: string = ':root',
    filter: ([k, v]: [string, string], i: number, array: [string, string][]) => boolean = () =>
      true,
    options?: { filterHelpers?: boolean },
  ) {
    const stylesheets = Array.from(document.styleSheets);
    let orderedVars: [string, string][] = [];

    for (const sheet of stylesheets) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if ((rule as CSSStyleRule)?.selectorText === selector) {
            const cssText = (rule as CSSStyleRule).cssText;
            const matches = [...cssText.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)];

            orderedVars = matches.map((m) => [m[1], m[2].trim()]);
          }
        }
      } catch (error) {}
      if (orderedVars.length) break;
    }

    return orderedVars
      .filter(([k]) => {
        if (!options?.filterHelpers) return true;

        if (k.endsWith('-min')) return false;
        else if (k.endsWith('-max')) return false;
        else if (k.endsWith('-step')) return false;

        return true;
      })
      .filter(filter);
  }

  /**
   * Applies CSS styles to an HTML or SVG element, supporting both standard and custom properties, as well as '!important' values.
   * @param element - The target HTML or SVG element to which the styles will be applied.
   * @param styles - An object containing CSS property-value pairs. Property names can be in camelCase or kebab-case, and values can include '!important'.
   * @example
   * ```javascript
   * CSS(document.getElementById('myElement'), {
   *   backgroundColor: 'red',
   *   '--custom-var': '10px',
   *   color: 'blue !important',
   * });
   * ```
   */
  CSS(
    element: HTMLElement | SVGElement,
    styles: Partial<Record<keyof CSSStyleProperties | `--${string}`, CSSValue>>,
  ): void {
    const normalizePropertyName = (name: string): string => {
      if (name.startsWith('--')) return name;
      return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    };

    for (const [rawName, rawValue] of Object.entries(styles)) {
      const propertyName = normalizePropertyName(rawName);

      if (rawValue === null || rawValue === undefined) {
        element.style.setProperty(propertyName, '');
        continue;
      }

      const value = String(rawValue).trim();

      if (value.endsWith('!important')) {
        const importantValue = value.replace(/\s*!important\s*$/, '').trim();
        element.style.setProperty(propertyName, importantValue, 'important');
        continue;
      }

      element.style.setProperty(propertyName, value);
    }
  }

  /**
   * Escapes special HTML characters in a string to prevent XSS attacks and ensure safe rendering in HTML contexts.
   * @param value - The input string that may contain special HTML characters such as &, <, >, ", and '.
   * @returns A new string with special HTML characters replaced by their corresponding HTML entities.
   * @example
   * ```javascript
   * const unsafeString = '<script>alert("XSS")</script>';
   * const safeString = escapeHtml(unsafeString);
   * console.log(safeString); // Output: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
   * ```
   */
  escapeHtml(value: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return value.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Get the relative position of a square
   * @param dimensions - The square dimensions and positions
   * @returns All the relative positions
   * @example
   * ```js
   * const positions = relativePositions({ width: 10, height: 10, left: 20, top: 20 });
   * // positions.center = { x: 25, y: 25 }
   * // positions.bottom = { x: 25, y: 30 }
   * // ...
   * ```
   */
  relativePositions({
    width,
    height,
    left,
    top,
  }: {
    width: number;
    height: number;
    left: number;
    top: number;
  }) {
    const positions = {
      'center': { x: left + width / 2, y: top + height / 2 },
      'top': { x: left + width / 2, y: top },
      'bottom': { x: left + width / 2, y: top + height },
      'left': { x: left, y: top + height / 2 },
      'right': { x: left + width, y: top + height / 2 },
      'top-left': { x: left, y: top },
      'top-right': { x: left + width, y: top },
      'bottom-left': { x: left, y: top + height },
      'bottom-right': { x: left + width, y: top + height },
    };

    return positions;
  }

  getRelativePositionToAncestor(
    element: HTMLElement,
    ancestor: HTMLElement,
  ): { left: number; top: number; width: number; height: number } {
    const elRect = element.getBoundingClientRect();
    const ancRect = ancestor.getBoundingClientRect();

    const ancIsBody = ancestor === document.body;
    const ancIsRoot = ancestor === document.documentElement;

    const bodyOrRootScrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    const bodyOrRootScrollTop =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

    const ancScrollLeft = ancIsRoot || ancIsBody ? bodyOrRootScrollLeft : ancestor.scrollLeft;
    const ancScrollTop = ancIsRoot || ancIsBody ? bodyOrRootScrollTop : ancestor.scrollTop;

    const ancClientLeft = ancestor.clientLeft || 0;
    const ancClientTop = ancestor.clientTop || 0;

    const left = elRect.left - ancRect.left + ancScrollLeft - ancClientLeft;
    const top = elRect.top - ancRect.top + ancScrollTop - ancClientTop;

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(elRect.width),
      height: Math.round(elRect.height),
    };
  }

  svg = {
    getDimensionsFromViewBox(svgElement: SVGElement | string): { width: number; height: number } {
      let viewBox: number[];

      if (typeof svgElement === 'string') {
        const svg = svgElement;
        const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);

        if (!viewBoxMatch) {
          throw new Error('Invalid SVG: viewBox not found');
        }

        viewBox = viewBoxMatch[1].split(' ').map(Number);
      } else {
        const viewBoxMatch = svgElement.getAttribute('viewBox');

        if (!viewBoxMatch) throw new Error('Invalid SVG: viewBox not found');

        viewBox = viewBoxMatch.split(' ').map(Number);
      }

      const width = viewBox[2];
      const height = viewBox[3];

      return { width, height };
    },
  };
}

type CSSValue = string | number | null | undefined;
