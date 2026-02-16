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

  it('Generate string template with IF truthy condition correctly', async () => {
    const template = '[IF=offline?offline|online]';

    const data = { offline: true };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('offline');
  });

  it('Generate string template with IF falsy condition correctly', async () => {
    const template = '[IF=offline?offline|online]';

    const data = { offline: false };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('online');
  });

  it('Generate string template with IF equality comparison correctly', async () => {
    const template = '[IF=status === "live"?online|offline]';

    const data = { status: 'live' };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('online');
  });

  it('Generate string template with IF equality comparison falsy condition correctly', async () => {
    const template = '[IF=status === "live"?online|offline]';

    const data = { status: 'offline' };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('offline');
  });

  it('Generate string templates with multiple IF conditions correctly', async () => {
    const template = '[IF=status === "live"?[IF=vip?VIP Online|Online]|Offline]';

    const data = { status: 'live', vip: true };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('VIP Online');
  });

  it('Generate string templates with multiple IF conditions falsy inner condition correctly', async () => {
    const template = '[IF=status === "live"?[IF=vip?VIP Online|Online]|Offline]';

    const data = { status: 'live', vip: false };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('Online');
  });

  it('Generate string templates with IF conditions falsy outer condition without spaces correctly', async () => {
    const template = '[IF=status==="live"?online|offline]';

    const data = { status: 'offline', vip: true };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('offline');
  });

  it('Generate string template with IF greater than comparison correctly', async () => {
    const template = '[IF=amount > 1?Many|One]';

    const data = { amount: 1 };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('One');
  });

  it('Generate string template with IF greater than comparison falsy condition correctly', async () => {
    const template = '[IF=amount >= 1?Many|One]';

    const data = { amount: 1 };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('Many');
  });

  it('Generate string template with IF logical AND correctly', async () => {
    const template = '[IF=vip && status === "live"?VIP Live|Not VIP Live]';

    const data = { status: 'live', vip: true };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('VIP Live');
  });

  it('Generate string template with IF logical OR correctly', async () => {
    const template = '[IF=vip || status === "live"?Highlighted|Normal]';

    const data = { status: 'offline', vip: true };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('Highlighted');
  });

  it('Generate string template with pluralization based on amount correctly', async () => {
    const template = '[PLURAL=message|messages]';

    const data = { amount: 1 };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('message');
  });

  it('Generate string template with pluralization based on count correctly', async () => {
    const template = '[PLURAL=message|messages]';

    const data = { count: 5 };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('messages');
  });

  it('Generate string template with pluralization using explicit key correctly', async () => {
    const template = '[PLURAL:items=item|items]';

    const data = { items: 2 };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('items');
  });

  it('Generate string template with number formatting correctly', async () => {
    const template = '[NUMBER:2=amount]';

    const data = { amount: 1234.5 };

    const result = string.compose(template, data, { html: false });

    // Locale-dependent grouping, but must include two decimals
    expect(result.endsWith('34.50') || result.endsWith('34,50')).toBe(true);
  });

  it('Generate string template with date formatting correctly', async () => {
    const template = '[DATE:iso=createdAt]';

    const data = { createdAt: new Date('2020-01-02T03:04:05.000Z') };

    const result = string.compose(template, data, { html: false });

    expect(result.startsWith('2020-01-02')).toBe(true);
  });

  it('Generate string template with map/switch correctly', async () => {
    const template = '[MAP:status=live:Online|offline:Offline|default:Unknown]';

    const data = { status: 'offline' };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('Offline');
  });

  it('Generate string template with HTML escaping correctly', async () => {
    const template = '[ESCAPE={message}]';

    const data = { message: '<b>Test & "message"</b>' };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('&lt;b&gt;Test &amp; &quot;message&quot;&lt;/b&gt;');
  });

  it('Generate string template with PRESET correctly', async () => {
    const template = '[PRESET:alert={username}]';

    Helper.string.PRESETS['alert'] = 'BOLD';

    const data = { username: 'user' };

    const result = string.compose(template, data, { html: false });

    expect(result).toBe('user');
  });
});
