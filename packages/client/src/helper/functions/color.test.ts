import { test, expect } from 'bun:test';
import color from './color.js';

test('color.validate should correctly identify color formats', () => {
  expect(color.validate('#FF5733')).toBe('hex');
  expect(color.validate('#FF573399')).toBe('hex');
  expect(color.validate('rgb(255, 87, 51)')).toBe('rgb');
  expect(color.validate('rgba(255, 87, 51, 0.5)')).toBe('rgba');
  expect(color.validate('hsl(14, 100%, 60%)')).toBe('hsl');
  expect(color.validate('hsla(14, 100%, 60%, 0.5)')).toBe('hsla');
  expect(color.validate('orangered')).toBe('css-color-name');
  expect(color.validate('invalid-color')).toBe(false);
});

test('color.convert should convert colors between formats', async () => {
  expect(await color.convert('rgb(255, 87, 51)', 'hex')).toBe('#ff5733');
  expect(await color.convert('#FF5733', 'rgb')).toBe('rgb(255, 87, 51)');
  expect(await color.convert('#FF5733', 'hsl')).toBe('hsl(11, 100%, 60%)');
  expect(await color.convert('rgb(255, 87, 51)', 'css-color-name')).toBe('tomato');
  expect(await color.convert('#ff0056', 'css-color-name')).toBe('crimson');
  expect(await color.convert('#c3a7e2', 'css-color-name')).toBe('plum');
  expect(await color.convert('#FF5733', 'invalid-format' as any)).toBe(null);
  expect(color.convert('invalid-color', 'rgb')).rejects.toThrow('Invalid color format: invalid-color');
  expect(color.convert('#FF5733', 'hex')).rejects.toThrow('Color is already in the desired format: hex');
});

test('color.random should generate random colors in specified formats', () => {
  const randHex = color.random('hex');
  expect(randHex).toMatch(/^#([0-9A-Fa-f]{6})$/);

  const randHexa = color.random('hexa');
  expect(randHexa).toMatch(/^#([0-9A-Fa-f]{8})$/);

  const randRgb = color.random('rgb');
  expect(randRgb).toMatch(/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/);

  const randRgba = color.random('rgba');
  expect(randRgba).toMatch(/^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (0|0?\.\d+|1(\.0)?)\)$/);
});
