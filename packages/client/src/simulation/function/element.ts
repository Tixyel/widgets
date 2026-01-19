import { number } from './number.js';

export const element = {
  /**
   * Merges outer span styles with inner span styles in the provided HTML string.
   * @param outerStyle - The style string to be applied to the outer span.
   * @param innerHTML - The inner HTML string which may contain a span with its own styles.
   * @returns A new HTML string with merged styles applied to a single span.
   * @example
   * ```javascript
   * const result = element.mergeSpanStyles("color: red; font-weight: bold;", '<span style="font-size: 14px;">Hello World</span>');
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
   * element.scale(element, 0.5, 1, { return: false });
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
   * const scaleFactor = element.scalev2(element, {
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

  fitText(
    element: HTMLElement,
    compressor: number = 1,
    options: {
      minFontSize?: number;
      maxFontSize?: number;
      parent?: HTMLElement;
    } = {},
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
  },

  /**
   * Splits the text content of an HTML string into individual characters wrapped in span elements with a data-index attribute.
   * @param htmlString - The input HTML string to be processed.
   * @param startIndex - The starting index for the data-index attribute (default is 0).
   * @returns - A new HTML string with each character wrapped in a span element.
   * @example
   * ```javascript
   * const result = element.splitTextToChars("<p>Hello</p>", 0);
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

        const chars = text?.split('').map((char, index) => {
          const span = document.createElement('span');

          span.className = 'char';
          span.dataset.index = String(charIndex);
          span.dataset.exclusivityIndex = String(index);

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

interface ScaleOptions<T extends HTMLElement> {
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
