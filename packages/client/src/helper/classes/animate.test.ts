import { test, expect, describe } from 'bun:test';

import { Helper } from '../index.js';

const { animate } = Helper;

describe('lerp', () => {
  test('should interpolate between two numbers', () => {
    expect(animate.lerp(0, 10, 0)).toBe(0);
    expect(animate.lerp(0, 10, 0.5)).toBe(5);
    expect(animate.lerp(0, 10, 1)).toBe(10);
    expect(animate.lerp(100, 200, 0.25)).toBe(125);
  });

  test('should clamp values out of range', () => {
    expect(animate.lerp(0, 10, -0.5)).toBe(0);
    expect(animate.lerp(0, 10, 1.5)).toBe(10);
  });
});

describe('quadratic', () => {
  test('should return sampled coordinates including start and end', () => {
    const result = animate.quadratic({
      from: { x: 0, y: 0 },
      to: { x: 10, y: 0 },
      control: { x: 5, y: 10 },
      duration: 1,
      fps: 2,
    });

    expect(result.x.length).toBe(3);
    expect(result.y.length).toBe(3);

    expect(result.x[0]).toBe(0);
    expect(result.y[0]).toBe(0);

    expect(result.x[1]).toBe(5);
    expect(result.y[1]).toBe(5);

    expect(result.x[2]).toBe(10);
    expect(result.y[2]).toBe(0);
  });

  test('should apply easing to interpolation progress', () => {
    const linear = animate.quadratic({
      from: { x: 0, y: 0 },
      to: { x: 100, y: 0 },
      control: { x: 50, y: 100 },
      duration: 1,
      fps: 4,
    });

    const easeIn = animate.quadratic({
      from: { x: 0, y: 0 },
      to: { x: 100, y: 0 },
      control: { x: 50, y: 100 },
      duration: 1,
      fps: 4,
      easing: (t) => t * t,
    });

    expect(easeIn.x[1]).toBeLessThan(linear.x[1]);
    expect(easeIn.y[1]).toBeLessThan(linear.y[1]);
  });
});

describe('cubic', () => {
  test('should create a cubic Bezier path with two control points', () => {
    const result = animate.cubic({
      from: { x: 0, y: 0, control: { x: 30, y: 100 } },
      to: { x: 100, y: 0, control: { x: 70, y: 100 } },
      duration: 1,
      fps: 2,
    });

    expect(result.x.length).toBe(3);
    expect(result.y.length).toBe(3);
    expect(result.x[0]).toBe(0);
    expect(result.y[0]).toBe(0);
    expect(result.x[2]).toBe(100);
    expect(result.y[2]).toBe(0);
  });
});

describe('multiCubic', () => {
  test('should use separate incoming and outgoing controls on middle points', () => {
    const result = animate.multiCubic({
      points: [
        { x: 0, y: 0, control: { x: 20, y: 40 } },
        {
          x: 100,
          y: 0,
          controlIn: { x: 80, y: 60 },
          controlOut: { x: 120, y: -20 },
        },
        { x: 200, y: 50, control: { x: 160, y: 120 } },
      ],
      duration: 1,
      fps: 4,
    });

    const firstSegment = animate.cubic({
      from: { x: 0, y: 0, control: { x: 20, y: 40 } },
      to: { x: 100, y: 0, control: { x: 80, y: 60 } },
      duration: 0.5,
      fps: 4,
    });

    const secondSegment = animate.cubic({
      from: { x: 100, y: 0, control: { x: 120, y: -20 } },
      to: { x: 200, y: 50, control: { x: 160, y: 120 } },
      duration: 0.5,
      fps: 4,
    });

    expect(result.x).toEqual([...firstSegment.x, ...secondSegment.x.slice(1)]);
    expect(result.y).toEqual([...firstSegment.y, ...secondSegment.y.slice(1)]);
  });

  test('should distribute frames across multiple segments and keep total samples consistent', () => {
    const result = animate.multiCubic({
      points: [
        { x: 0, y: 0, control: { x: 10, y: 20 } },
        {
          x: 40,
          y: 20,
          controlIn: { x: 30, y: 30 },
          controlOut: { x: 48, y: 12 },
        },
        {
          x: 80,
          y: 10,
          controlIn: { x: 70, y: 40 },
          controlOut: { x: 92, y: 4 },
        },
        { x: 120, y: 0, control: { x: 110, y: 10 } },
      ],
      duration: 1,
      fps: 5,
    });

    expect(result.x.length).toBe(6);
    expect(result.y.length).toBe(6);

    expect(result.x[0]).toBe(0);
    expect(result.y[0]).toBe(0);
    expect(result.x[result.x.length - 1]).toBe(120);
    expect(result.y[result.y.length - 1]).toBe(0);
  });

  test('should still accept a shared control on middle points for compatibility', () => {
    const result = animate.multiCubic({
      points: [
        { x: 0, y: 0, control: { x: 10, y: 30 } },
        { x: 50, y: 10, control: { x: 40, y: 40 } },
        { x: 100, y: 0, control: { x: 90, y: 20 } },
      ],
      duration: 1,
      fps: 4,
    });

    expect(result.x[0]).toBe(0);
    expect(result.y[0]).toBe(0);
    expect(result.x[2]).toBe(50);
    expect(result.y[2]).toBe(10);
    expect(result.x[4]).toBe(100);
    expect(result.y[4]).toBe(0);
  });
});

describe('circle', () => {
  test('should create a circular path', () => {
    const result = animate.circle({
      center: { x: 50, y: 50 },
      radius: 25,
      from: 0,
      to: 360,
      duration: 1,
      fps: 4,
    });

    expect(result.x.length).toBe(5);
    expect(result.y.length).toBe(5);

    // Starting at angle 0 should be at rightmost point
    expect(result.x[0]).toBeCloseTo(75, 1);
    expect(result.y[0]).toBeCloseTo(50, 1);

    // Ending at 360 should be back at start
    expect(result.x[4]).toBeCloseTo(75, 1);
    expect(result.y[4]).toBeCloseTo(50, 1);

    // Midpoint (180deg) should be at leftmost point
    expect(result.x[2]).toBeCloseTo(25, 1);
    expect(result.y[2]).toBeCloseTo(50, 1);
  });
});

describe('spiral', () => {
  test('should create a spiral from radius start to end', () => {
    const result = animate.spiral({
      center: { x: 0, y: 0 },
      radius: { from: 10, to: 50 },
      turns: 2,
      duration: 1,
      fps: 4,
    });

    expect(result.x.length).toBe(5);
    expect(result.y.length).toBe(5);

    const startRadius = Math.hypot(result.x[0], result.y[0]);
    const endRadius = Math.hypot(result.x[4], result.y[4]);

    expect(startRadius).toBeCloseTo(10, 1);
    expect(endRadius).toBeCloseTo(50, 1);
  });
});

describe('chain', () => {
  test('should concatenate multiple animation paths', () => {
    const path1 = animate.quadratic({
      from: { x: 0, y: 0 },
      to: { x: 5, y: 0 },
      control: { x: 2.5, y: 2.5 },
      duration: 0.5,
      fps: 2,
    });

    const path2 = animate.quadratic({
      from: { x: 5, y: 0 },
      to: { x: 10, y: 0 },
      control: { x: 7.5, y: 2.5 },
      duration: 0.5,
      fps: 2,
    });

    const chained = animate.chain(path1, path2);

    // Total should be combined
    expect(chained.x.length).toBeGreaterThan(path1.x.length);
    expect(chained.x[0]).toBe(0);
    expect(chained.x[chained.x.length - 1]).toBe(10);
  });
});

describe('sequence', () => {
  test('should add delays between animations', () => {
    const path1 = animate.quadratic({
      from: { x: 0, y: 0 },
      to: { x: 5, y: 0 },
      control: { x: 2.5, y: 2.5 },
      duration: 0.5,
      fps: 2,
    });

    const path2 = animate.quadratic({
      from: { x: 5, y: 0 },
      to: { x: 10, y: 0 },
      control: { x: 7.5, y: 2.5 },
      duration: 0.5,
      fps: 2,
    });

    const sequenced = animate.sequence([path1, path2], 3);

    // Should have delays (3 frames) before each animation
    expect(sequenced.x.length).toBeGreaterThan(path1.x.length + path2.x.length);

    // First 3 frames should repeat start position
    expect(sequenced.x[0]).toBe(path1.x[0]);
    expect(sequenced.x[1]).toBe(path1.x[0]);
    expect(sequenced.x[2]).toBe(path1.x[0]);
  });
});

