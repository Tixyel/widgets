import { test, it, expect } from 'bun:test';
import { element } from './element.js';

it('Apply className and styles correctly when merging span styles', async () => {
  const innerHTML = '<span class="inner-class" style="color: red;">Content</span>';

  const result = element.mergeSpanStyles('font-weight: bold;', innerHTML, 'outer-class');

  console.log(result);

  expect(result).toBe('<span class="inner-class outer-class" style="color: red; font-weight: bold;">Content</span>');
});

it('Split HTML text into separated chars correctly', async () => {
  const html = '<span class="test">Hello</span> World';

  const result = element.splitTextToChars(html);

  const hello = 'Hello'.split('').map((e, i) => `<span class="char" data-index="${i}" data-exclusivity-index="${i}">${e}</span>`);
  const world = ' World'.split('').map((e, i) => `<span class="char" data-index="${hello.length + i}" data-exclusivity-index="${i}">${e}</span>`);

  expect(result).toEqual(`<span class="test">${hello.join('')}</span><span>${world.join('')}</span>`);
});
