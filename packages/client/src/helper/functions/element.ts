import type { FitTextOptions, ScaleOptions } from './element.type.js';
import number from './number.js';

const functions = {
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
    const { parent = element.parentElement, prefer = 'auto', min = 0, max = 1, apply = () => {} } = options;

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
  },

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

    const result = number.balance(value, settings.minFontSize, settings.maxFontSize);

    element.style.fontSize = result + 'px';

    return element;
  },

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
  splitTextToChars(htmlString: string, startIndex: number = 0): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    let charIndex = startIndex;

    function processNode(node: Node): Node | DocumentFragment {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';

        // Split only non-whitespace or preserve whitespace if it's significant
        const chars = text.split('').map((char, index) => {
          const span = document.createElement('span');

          span.classList.add('char');
          span.dataset.index = String(charIndex);
          span.dataset.exclusivityIndex = String(charIndex);
          span.style.setProperty('--char-index', String(charIndex));
          span.style.setProperty('--exclusivity-index', String(charIndex));

          if (char === ' ' || char === '\n' || char === '\t') {
            span.style.whiteSpace = 'pre-wrap';
          }

          span.textContent = char;

          charIndex++;

          return span;
        });

        const fragment = document.createDocumentFragment();
        chars.forEach((char) => fragment.appendChild(char));

        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false) as HTMLElement;

        // Add container class and data-index to parent elements
        clone.classList.add('container');
        clone.dataset.index = String(charIndex);
        clone.style.setProperty('--char-index', String(charIndex));

        // Process child nodes
        node.childNodes.forEach((child) => {
          const processed = processNode(child);

          if (processed instanceof DocumentFragment) {
            clone.appendChild(processed);
          } else if (processed instanceof Node) {
            clone.appendChild(processed);
          }
        });

        return clone;
      }

      return node.cloneNode(true);
    }

    const body = doc.body;
    const processed = document.createElement('div');

    body.childNodes.forEach((node) => {
      // Skip empty text nodes at the root level
      if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
        return;
      }

      const result = processNode(node);

      if (result instanceof DocumentFragment) {
        processed.appendChild(result);
      } else if (result instanceof Node) {
        processed.appendChild(result);
      }
    });

    // Join root-level text nodes and elements while preserving spacing
    let html = '';
    Array.from(processed.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        html += node.textContent;
      } else {
        html += (node as HTMLElement).outerHTML;
      }
    });

    return html;
  },
};

export default functions;
