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

      var mergedStyle = [innerStyle, outerStyle]
        .filter((a) => a.length)
        .map((s) => {
          if (s.endsWith(';')) {
            return s.slice(0, -1);
          } else {
            return s;
          }
        })
        .join('; ')
        .replace(/\s*;\s*/g, '; ')
        .trim();

      if (!mergedStyle.endsWith(';')) {
        mergedStyle += ';';
      }

      return `<span${innerClass ? ` class="${innerClass} ${className ?? ''}"` : ''}${mergedStyle ? ` style="${mergedStyle}"` : ''}>${content}</span>`;
    } else {
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
      return;
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

        const chars = text?.split('').map((char) => {
          const span = document.createElement('span');

          span.className = 'char';
          span.dataset.index = String(charIndex++);

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
