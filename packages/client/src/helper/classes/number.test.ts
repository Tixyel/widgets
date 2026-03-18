import { test, expect } from 'bun:test';

import { Helper } from '../index.js';

const { number } = Helper;

test('Convert numbers to cardinal words correctly', () => {
  expect(number.translate(0, 'cardinal')).toBe('zero');
  expect(number.translate(15, 'cardinal')).toBe('fifteen');
  expect(number.translate(42, 'cardinal')).toBe('forty-two');
  expect(number.translate(100, 'cardinal')).toBe('one hundred');
  expect(number.translate(305, 'cardinal')).toBe('three hundred five');
  expect(number.translate(1234, 'cardinal')).toBe('one thousand, two hundred thirty-four');
  expect(number.translate(1000000, 'cardinal')).toBe('one million');
  expect(number.translate(1002003, 'cardinal')).toBe('one million, two thousand, three');
});

test('Convert numbers to ordinal words correctly', () => {
  expect(number.translate(5, 'ordinal')).toBe('fifth');
  expect(number.translate(21, 'ordinal')).toBe('twenty-first');
  expect(number.translate(100, 'ordinal')).toBe('one hundredth');
  expect(number.translate(342, 'ordinal')).toBe('three hundred forty-second');
});

test('Convert numbers to sufixed ordinal words correctly', () => {
  expect(number.translate(23, 'suffix')).toBe('23rd');
  expect(number.translate(11, 'suffix')).toBe('11th');
  expect(number.translate(42, 'suffix')).toBe('42nd');
  expect(number.translate(103, 'suffix')).toBe('103rd');
});

test('Balance number correctly', async () => {
  expect(number.balance(0.1, 0.2)).toBe(0.2);
  expect(number.balance(999, 0, 500)).toBe(500);
  expect(number.balance(-100, 50, 0)).toBe(0);
  expect(number.balance(75, 0, 100)).toBe(75);
  expect(number.balance(150, 0, 100)).toBe(100);
});

test('Rounds a number to specified decimal places correctly', () => {
  expect(number.round(3.14159, 2)).toBe(3.14);
  expect(number.round(2.71828, 3)).toBe(2.718);
  expect(number.round(1.005, 2)).toBe(1);
  expect(number.round(1.005, 3)).toBe(1.005);
  expect(number.round(-2.675, 2)).toBe(-2.67);
});
