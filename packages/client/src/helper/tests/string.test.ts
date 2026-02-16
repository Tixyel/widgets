import { describe, it, expect } from 'bun:test';
import { Helper } from '../index.js';

const { string } = Helper;

describe('string functions', () => {
  it('Generate string template correctly', async () => {
    const template = '[TEST=abc] [UPC={username}]';

    const data = { username: 'username' };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('abc USERNAME');
  });

  it('Generate string template with HTML correctly', async () => {
    const template = '[TEST=abc] [UPC={username}]';

    const data = { username: 'username' };

    const result = string.compose(template, data, { html: true });

    expect(result).toBe('<span class="test">abc</span> USERNAME');
  });

  it('Generate string template with HTML and color correctly', async () => {
    const template = '[COLOR:#ff0056={username}]';

    const data = { username: 'username' };

    const result = string.compose(template, data, { html: true });

    expect(result).toBe('<span class="color" style="color: #ff0056;">username</span>');
  });

  it('Generate string template with multiple modifiers correctly', async () => {
    const template = '[COLOR:#ff0056,BOLD={username}]';

    const data = { username: 'username' };

    const result = string.compose(template, data, { html: true });

    expect(result).toBe('<span class="color bold" style="color: #ff0056; font-weight: bold;">username</span>');
  });

  it('Generate string template with more modifiers correctly', async () => {
    const template = '[COLOR:#ff0056,BOLD,ITALIC={username}]';

    const data = { username: 'username' };

    const result = string.compose(template, data, { html: true });

    expect(result).toBe('<span class="color bold italic" style="color: #ff0056; font-weight: bold; font-style: italic;">username</span>');
  });
});
