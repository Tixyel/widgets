import { it, expect } from 'bun:test';
import { Helper } from '../index.js';

const { element } = Helper;

it('splitTextToChars adds container class to parent elements', () => {
  const html = '<span>Test</span>';

  const result = element.splitTextToChars(html);

  expect(result).toContain('class="container"');
  expect(result).toContain('class="char"');
  expect(result).toContain('data-index="0"');
});

it('splitTextToChars splits all characters with data-index', () => {
  const html = '<span>Hi</span>';

  const result = element.splitTextToChars(html);

  expect(result).toContain('data-index="0"');
  expect(result).toContain('data-index="1"');
  expect(result).toContain('>H</span>');
  expect(result).toContain('>i</span>');
});

it('splitTextToChars handles multiple elements with formatting', () => {
  const html = '<span>AB</span> <strong>CD</strong>';

  const result = element.splitTextToChars(html);

  // Check for container classes
  expect(result).toContain('class="container"');

  // Check that both span and strong preserve their tags
  expect(result).toMatch(/<span[^>]*class="[^"]*container[^"]*"/);
  expect(result).toMatch(/<strong[^>]*class="[^"]*container[^"]*"/);

  // Check for char spans
  expect(result).toContain('class="char"');
});

it('splitTextToChars applies custom startIndex', () => {
  const html = '<span>AB</span>';

  const result = element.splitTextToChars(html, 10);

  expect(result).toContain('data-index="10"');
  expect(result).toContain('data-index="11"');
});

it('splitTextToChars preserves nested structure', () => {
  const html = '<div><em>Test</em></div>';

  const result = element.splitTextToChars(html);

  expect(result).toContain('class="container"');
  expect(result).toContain('<em');
  expect(result).toContain('<div');
  expect(result).toContain('class="char"');
});

it('splitCharsWithContainers handles whitespace correctly', () => {
  const html = '<span>A B</span>';

  const result = element.splitTextToChars(html);

  // Should have 3 characters: 'A', ' ', 'B'
  expect(result).toContain('data-index="0"');
  expect(result).toContain('data-index="1"');
  expect(result).toContain('data-index="2"');
  expect(result).toContain('white-space: pre-wrap');
});

it('splitTextToChars applies --char-index CSS variable', () => {
  const html = '<span>Hi</span>';

  const result = element.splitTextToChars(html);

  expect(result).toContain('--char-index');
});

it('splitTextToChars handles complex HTML with multiple nested elements and long text', () => {
  const html = `<div class="test">
    <p class="top">Hello <strong>world</strong>!</p>
    <span class="mid">This is a <em>complex</em> test with <u>multiple</u> elements.</span>
    <div class="bottom">Nested <strong>bold <em>and italic</em></strong> text.</div>
  </div>`;

  const result = element.splitTextToChars(html);

  console.log(result);

  // Verify all element types are preserved
  expect(result).toContain('<div class="test container"');
  expect(result).toContain('<p class="top container"');
  expect(result).toContain('<strong');
  expect(result).toContain('<em');
  expect(result).toContain('<u');
  expect(result).toContain('<span class="mid container"');
  // Verify char class is applied to all characters
  expect(result).toContain('class="char"');

  // Count approximate number of char spans (should have many)
  const charMatches = result.match(/class="char"/g);
  expect(charMatches).toBeTruthy();
  expect(charMatches!.length).toBeGreaterThan(50); // Long text should have many chars

  // Verify data-index attributes exist and increment
  expect(result).toContain('data-index="0"');
  expect(result).toContain('data-index="10"');
  expect(result).toContain('data-index="20"');

  // Verify CSS variables are set
  expect(result).toContain('--char-index');

  // Verify whitespace preservation
  expect(result).toContain('white-space: pre-wrap');

  // Verify nested structure is maintained (strong inside em or vice versa)
  expect(result).toMatch(/<strong[^>]*>.*<em[^>]*>.*<\/em>.*<\/strong>/);
});
