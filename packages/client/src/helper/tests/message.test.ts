import { describe, it, expect } from 'bun:test';
import { Helper } from '../index.js';

const { message } = Helper;

describe('message functions', () => {
  it('findEmotesInText should find non-emoji emotes with whitespace boundaries', () => {
    const text = 'Kappa hi KappaKappa Kappa';

    const emotes = [
      {
        type: 'twitch',
        name: 'Kappa',
        id: '25',
        gif: false,
        urls: {
          '1': 'https://example.com/kappa-1x.png',
          '2': 'https://example.com/kappa-2x.png',
          '4': 'https://example.com/kappa-4x.png',
        },
        start: 0,
        end: 5,
      },
      {
        type: 'emoji',
        name: '1f60a',
        id: '1f60a',
        gif: false,
        urls: {
          '1': 'https://twemoji.maxcdn.com/36x36/1f60a.png',
        },
      },
    ] as any;

    const result = message.findEmotesInText(text, emotes);
    const positioned = result.filter(
      (emote: any) => typeof emote.start === 'number' && typeof emote.end === 'number',
    ) as Array<{ start: number; end: number }>;

    expect(positioned.length).toBe(2);
    expect(positioned[0].start).toBe(0);
    expect(positioned[0].end).toBe(5);
    expect(positioned[1].start).toBe(20);
    expect(positioned[1].end).toBe(25);
  });

  it('replaceEmotesWithHTML should keep unicode emoji unchanged', () => {
    const text = 'I hear a cutie 😊';

    const emotes = [
      {
        type: 'emoji',
        name: '1f60a',
        id: '1f60a',
        gif: false,
        urls: {
          '1': 'https://twemoji.maxcdn.com/36x36/1f60a.png',
        },
      },
    ] as any;

    const result = message.replaceEmotesWithHTML(text, emotes);

    expect(result).toBe('I hear a cutie 😊');
  });

  it('replaceEmotesWithHTML should replace regular emotes with valid positions', () => {
    const text = 'hello Kappa world';

    const emotes = [
      {
        type: 'twitch',
        name: 'Kappa',
        id: '25',
        gif: false,
        urls: {
          '1': 'https://example.com/kappa-1x.png',
          '2': 'https://example.com/kappa-2x.png',
          '4': 'https://example.com/kappa-4x.png',
        },
        start: 6,
        end: 11,
      },
    ] as any;

    const result = message.replaceEmotesWithHTML(text, emotes);

    expect(result).toBe(
      'hello <img src="https://example.com/kappa-4x.png" alt="Kappa" class="emote" style="width: auto; height: 1em; vertical-align: middle;" /> world',
    );
  });

  it('hasOnlyEmotes should return true when text contains only emotes and spaces', () => {
    const text = 'Kappa PogChamp';

    const emotes = [
      {
        type: 'twitch',
        name: 'Kappa',
        id: '25',
        gif: false,
        urls: {
          '1': 'https://example.com/kappa-1x.png',
          '2': 'https://example.com/kappa-2x.png',
          '4': 'https://example.com/kappa-4x.png',
        },
        start: 0,
        end: 5,
      },
      {
        type: 'twitch',
        name: 'PogChamp',
        id: '88',
        gif: false,
        urls: {
          '1': 'https://example.com/pogchamp-1x.png',
          '2': 'https://example.com/pogchamp-2x.png',
          '4': 'https://example.com/pogchamp-4x.png',
        },
        start: 6,
        end: 14,
      },
    ] as any;

    const result = message.hasOnlyEmotes(text, emotes);

    expect(result).toBe(true);
  });

  it('hasOnlyEmotes should return false when text has regular words', () => {
    const text = 'Kappa hello';

    const emotes = [
      {
        type: 'twitch',
        name: 'Kappa',
        id: '25',
        gif: false,
        urls: {
          '1': 'https://example.com/kappa-1x.png',
          '2': 'https://example.com/kappa-2x.png',
          '4': 'https://example.com/kappa-4x.png',
        },
        start: 0,
        end: 5,
      },
    ] as any;

    const result = message.hasOnlyEmotes(text, emotes);

    expect(result).toBe(false);
  });

  it('replaceYoutubeEmotesWithHTML should replace known youtube emote codes', () => {
    const text = 'Hi :smile: friend';

    const youtubeEmotes = [
      {
        shortcuts: [':smile:'],
        searchTerms: ['smile'],
        image: {
          thumbnails: [{ url: 'https://example.com/smile-1.png' }],
          accessibility: {
            accessibilityData: {
              label: 'Smile',
            },
          },
        },
      },
    ] as any;

    const result = message.replaceYoutubeEmotesWithHTML(text, youtubeEmotes);

    expect(result).toBe(
      'Hi <img src="https://example.com/smile-1.png" alt="Smile" class="emote" style="width: auto; height: 1em; vertical-align: middle;" /> friend',
    );
  });

  it('replaceYoutubeEmotesWithHTML should keep unknown codes unchanged', () => {
    const text = 'Hi :unknown: friend';
    const result = message.replaceYoutubeEmotesWithHTML(text, [] as any);

    expect(result).toBe('Hi :unknown: friend');
  });

  it('generateBadges should build twitch badges and amounts from badge list', async () => {
    const result = await message.generateBadges(['moderator/2', 'subscriber/10'], 'twitch');

    expect(result.keys.includes('moderator')).toBe(true);
    expect(result.keys.includes('subscriber')).toBe(true);
    expect(result.amount.moderator).toBe(2);
    expect(result.amount.subscriber).toBe(10);
    expect(Array.isArray(result.badges)).toBe(true);
  });

  it('generateBadges should return youtube result shape', async () => {
    const result = await message.generateBadges(['moderator', 'verified'], 'youtube');

    expect(typeof result.isVerified).toBe('boolean');
    expect(typeof result.isChatOwner).toBe('boolean');
    expect(typeof result.isChatSponsor).toBe('boolean');
    expect(typeof result.isChatModerator).toBe('boolean');
  });
});
