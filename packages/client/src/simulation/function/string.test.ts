import { test, it, expect } from 'bun:test';
import { string } from './string.js';

it('Generate string template correctly', async () => {
  const template = '[TEST=abc] [UPC={username}]';

  const data = { username: 'username' };

  const result = string.compose(template, data, { html: false });

  console.log(result);

  expect(result).toBe('abc USERNAME');
});

it('Generate string template with HTML correctly', async () => {
  const template = '[TEST=abc] [UPC={username}]';

  const data = { username: 'username' };

  const result = string.compose(template, data, { html: true });

  console.log(result);

  expect(result).toBe('<span class="test">abc</span> USERNAME');
});
