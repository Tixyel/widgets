import { test, it, expect } from 'bun:test';
import { element } from './element.js';

it('Apply className and styles correctly when merging span styles', async () => {
  const innerHTML = '<span class="inner-class" style="color: red;">Content</span>';

  const result = element.mergeSpanStyles('font-weight: bold;', innerHTML, 'outer-class');

  console.log(result);

  expect(result).toBe('<span class="inner-class outer-class" style="color: red; font-weight: bold;">Content</span>');
});
