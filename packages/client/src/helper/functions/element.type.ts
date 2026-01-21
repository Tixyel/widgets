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
