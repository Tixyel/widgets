export type Point = {
  x: number;
  y: number;
};

export type AnimOptions = {
  /** Duration in seconds. Default: `1` */
  duration?: number;
  fps?: number;
  easing?: (t: number) => number;
};

export type AnimResult = {
  x: number[];
  y: number[];
};

export type QuadraticParams = AnimOptions & {
  from: Point;
  to: Point;
  control: Point;
};

export type CubicParams = AnimOptions & {
  from: Point & { control: Point };
  to: Point & { control: Point };
};

export type ControlledPoint = Point & { control: Point };

export type MultiCubicPoint = Point & {
  control?: Point;
  controlIn?: Point;
  controlOut?: Point;
};

export type MultiCubicParams = AnimOptions & {
  points: [MultiCubicPoint, MultiCubicPoint, MultiCubicPoint, ...MultiCubicPoint[]];
};

export type CircleParams = AnimOptions & {
  center: Point;
  radius: number;
  from?: number;
  to?: number;
};

export type SpiralParams = AnimOptions & {
  center: Point;
  radius: { from: number; to: number };
  turns?: number;
};

export class AnimateHelper {
  /**
   * Interpolate a number from start to end
   * @example
   * ```ts
   * const value = animate.lerp(0, 100, 0.5);
   * console.log(value); // 50
   * // Clamped between 0 and 1
   * const clamped = animate.lerp(0, 100, 1.5);
   * console.log(clamped); // 100
   * const clamped2 = animate.lerp(0, 100, -0.5);
   * console.log(clamped2); // 0
   * const easeIn = animate.lerp(0, 100, (t) => t * t);
   * console.log(easeIn); // 25 at t=0.5
   * const linear = animate.lerp(0, 100, 0.5);
   * console.log(linear); // 50 at t=0.5
   * // Ease-in should be less than linear at t=0.5
   * console.log(easeIn < linear); // true
   * ```
   */
  lerp(start: number, end: number, t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return start + (end - start) * clamped;
  }

  /**
   * Create a quadratic Bezier path between two positions using a control point.
   * Returns sampled x/y coordinates for the animation timeline.
   * @example
   * ```ts
   * const { x, y } = animate.quadratic({
   *   from: { x: 0, y: 0 },
   *   to: { x: 100, y: 0 },
   *   control: { x: 50, y: 50 },
   *   duration: 1,
   *   fps: 60,
   *   easing: Motion.easeInOut,
   * });
   *
   * // Use with Motion.animate
   * Motion.animate(element, { x, y }, { duration: 1 });
   * ```
   */
  quadratic({
    from,
    to,
    control,
    duration = 1,
    fps = 60,
    easing = (t) => t,
  }: QuadraticParams): AnimResult {
    const steps = Math.max(2, Math.round(duration * fps));
    const xPoints: number[] = [];
    const yPoints: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = easing(i / steps);
      xPoints.push((1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * control.x + t * t * to.x);
      yPoints.push((1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * control.y + t * t * to.y);
    }

    return { x: xPoints, y: yPoints };
  }

  /**
   * Create a cubic Bezier path between two positions using two control points.
   * Returns sampled x/y coordinates for the animation timeline.
   * @example
   * ```ts
   * const { x, y } = animate.cubic({
   *   from: { x: 0, y: 0, control: { x: 50, y: 100 } },
   *   to: { x: 200, y: 0, control: { x: 150, y: 100 } },
   *   duration: 2,
   *   fps: 60,
   *   easing: Motion.easeInOut,
   * });
   * ```
   */
  cubic({ from, to, duration = 1, fps = 60, easing = (t) => t }: CubicParams): AnimResult {
    const steps = Math.max(2, Math.round(duration * fps));
    const xPoints: number[] = [];
    const yPoints: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = easing(i / steps);
      const mt = 1 - t;
      // Cubic Bezier: P = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
      xPoints.push(
        mt * mt * mt * from.x +
          3 * mt * mt * t * from.control.x +
          3 * mt * t * t * to.control.x +
          t * t * t * to.x,
      );
      yPoints.push(
        mt * mt * mt * from.y +
          3 * mt * mt * t * from.control.y +
          3 * mt * t * t * to.control.y +
          t * t * t * to.y,
      );
    }

    return { x: xPoints, y: yPoints };
  }

  private getMultiCubicOutgoingControl(point: MultiCubicPoint, index: number): Point {
    const control = point.controlOut ?? point.control;
    if (control) {
      return control;
    }

    if (index === 0) {
      throw new Error('The first multiCubic point requires `control` or `controlOut`.');
    }

    throw new Error(
      `The multiCubic point at index ${index} requires \`controlOut\` or a shared \`control\`.`,
    );
  }

  private getMultiCubicIncomingControl(
    point: MultiCubicPoint,
    index: number,
    lastIndex: number,
  ): Point {
    const control = point.controlIn ?? point.control;
    if (control) {
      return control;
    }

    if (index === lastIndex) {
      throw new Error('The last multiCubic point requires `control` or `controlIn`.');
    }

    throw new Error(
      `The multiCubic point at index ${index} requires \`controlIn\` or a shared \`control\`.`,
    );
  }

  /**
   * Create a chained cubic Bezier path using 3 or more points.
   * First and last points use a single control handle.
   * Middle points can use separate incoming and outgoing handles.
   *
   * Every consecutive pair creates one cubic segment:
   * `P0 = points[i]`, `P1 = points[i].controlOut`, `P2 = points[i + 1].controlIn`, `P3 = points[i + 1]`.
   *
   * For compatibility, `control` is treated as a shared handle when `controlIn` or `controlOut`
   * are not provided.
   * @example
   * ```ts
   * const { x, y } = animate.multiCubic({
   *   points: [
   *     { x: 0, y: 0, control: { x: 20, y: 40 } },
   *     {
   *       x: 100,
   *       y: 0,
   *       controlIn: { x: 80, y: 60 },
   *       controlOut: { x: 120, y: -20 },
   *     },
   *     { x: 200, y: 50, control: { x: 160, y: 120 } },
   *   ],
   *   duration: 2,
   *   fps: 60,
   *   easing: Motion.easeInOut,
   * });
   * ```
   */
  multiCubic({ points, duration = 1, fps = 60, easing = (t) => t }: MultiCubicParams): AnimResult {
    if (points.length < 3) {
      throw new Error('multiCubic requires at least 3 points.');
    }

    const segmentCount = points.length - 1;
    const lastIndex = points.length - 1;
    const totalSteps = Math.max(2, Math.round(duration * fps));
    const baseStepsPerSegment = Math.max(1, Math.floor(totalSteps / segmentCount));
    let remainingSteps = totalSteps % segmentCount;

    const xPoints: number[] = [];
    const yPoints: number[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const from = points[i];
      const to = points[i + 1];
      const fromControl = this.getMultiCubicOutgoingControl(from, i);
      const toControl = this.getMultiCubicIncomingControl(to, i + 1, lastIndex);
      const stepsForSegment = baseStepsPerSegment + (remainingSteps > 0 ? 1 : 0);
      if (remainingSteps > 0) {
        remainingSteps--;
      }

      // Skip the first frame of following segments to avoid duplicate join points.
      const start = i === 0 ? 0 : 1;

      for (let s = start; s <= stepsForSegment; s++) {
        const t = easing(s / stepsForSegment);
        const mt = 1 - t;

        xPoints.push(
          mt * mt * mt * from.x +
            3 * mt * mt * t * fromControl.x +
            3 * mt * t * t * toControl.x +
            t * t * t * to.x,
        );

        yPoints.push(
          mt * mt * mt * from.y +
            3 * mt * mt * t * fromControl.y +
            3 * mt * t * t * toControl.y +
            t * t * t * to.y,
        );
      }
    }

    return { x: xPoints, y: yPoints };
  }

  /**
   * Create a circular path around a center point.
   * Angles in degrees. Default: `from: 0`, `to: 360`.
   * @example
   * ```ts
   * const { x, y } = animate.circle({
   *   center: { x: 100, y: 100 },
   *   radius: 50,
   *   from: 0,
   *   to: 360,
   *   duration: 3,
   *   fps: 60,
   * });
   * ```
   */
  circle({
    center,
    radius,
    from = 0,
    to = 360,
    duration = 1,
    fps = 60,
    easing = (t) => t,
  }: CircleParams): AnimResult {
    const steps = Math.max(2, Math.round(duration * fps));
    const xPoints: number[] = [];
    const yPoints: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = easing(i / steps);
      const angle = from + (to - from) * t;
      const rad = (angle * Math.PI) / 180;
      xPoints.push(center.x + radius * Math.cos(rad));
      yPoints.push(center.y + radius * Math.sin(rad));
    }

    return { x: xPoints, y: yPoints };
  }

  /**
   * Create a spiral path around a center point.
   * @example
   * ```ts
   * const { x, y } = animate.spiral({
   *   center: { x: 0, y: 0 },
   *   radius: { from: 10, to: 100 },
   *   turns: 3,
   *   duration: 2,
   *   fps: 60,
   *   easing: (t) => 1 - (1 - t) * (1 - t),
   * });
   *
   * // This will create a spiral that starts at radius 10 and expands to radius 100 over 3 turns.
   * ```
   */
  spiral({
    center,
    radius,
    turns = 1,
    duration = 1,
    fps = 60,
    easing = (t) => t,
  }: SpiralParams): AnimResult {
    const steps = Math.max(2, Math.round(duration * fps));
    const xPoints: number[] = [];
    const yPoints: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = easing(i / steps);
      const r = this.lerp(radius.from, radius.to, t);
      const angle = t * turns * 360;
      const rad = (angle * Math.PI) / 180;
      xPoints.push(center.x + r * Math.cos(rad));
      yPoints.push(center.y + r * Math.sin(rad));
    }

    return { x: xPoints, y: yPoints };
  }

  /**
   * Chain multiple animation paths together sequentially.
   * @example
   * ```ts
   * const path1 = animate.quadratic({
   *   from: { x: 0, y: 0 },
   *   to: { x: 100, y: 0 },
   *   control: { x: 50, y: 50 },
   *   duration: 1,
   *   fps: 60,
   * });
   *
   * const path2 = animate.circle({
   *   center: { x: 100, y: 0 },
   *   radius: 30,
   *   from: 0,
   *   to: 180,
   *   duration: 1,
   *   fps: 60,
   * });
   *
   * const combined = animate.chain(path1, path2);
   * ```
   */
  chain(...animations: AnimResult[]): AnimResult {
    const x: number[] = [];
    const y: number[] = [];

    for (const anim of animations) {
      x.push(...anim.x);
      y.push(...anim.y);
    }

    return { x, y };
  }

  /**
   * Execute multiple animations in sequence with optional delays between them.
   * Each animation will be sampled and delays will add repeating the last coordinate.
   * @example
   * ```ts
   * const path1 = animate.quadratic({ from: { x: 0, y: 0 }, to: { x: 50, y: 0 }, control: { x: 25, y: 25 }, duration: 0.5, fps: 30 });
   * const path2 = animate.quadratic({ from: { x: 50, y: 0 }, to: { x: 100, y: 0 }, control: { x: 75, y: 25 }, duration: 0.5, fps: 30 });
   *
   * // 30 frames delay between animations
   * const sequenced = animate.sequence([path1, path2], 30);
   * ```
   */
  sequence(animations: AnimResult[], delayFrames: number | number[] = 0): AnimResult {
    const x: number[] = [];
    const y: number[] = [];

    const delays = Array.isArray(delayFrames)
      ? delayFrames
      : animations.map(() => delayFrames as number);

    for (let i = 0; i < animations.length; i++) {
      const anim = animations[i];
      const delay = delays[i] ?? 0;

      // Add delay by repeating first frame
      for (let d = 0; d < delay; d++) {
        x.push(anim.x[0]);
        y.push(anim.y[0]);
      }

      // Add animation
      x.push(...anim.x);
      y.push(...anim.y);
    }

    return { x, y };
  }
}

