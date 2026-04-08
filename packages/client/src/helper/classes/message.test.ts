import { describe, it, expect } from 'bun:test';

import { MessageHelper } from './message.js';

const message = new MessageHelper();

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

    console.log(result);

    expect(positioned.length).toBe(2);
    expect(positioned[0].start).toBe(0);
    expect(positioned[0].end).toBe(5);
    expect(positioned[1].start).toBe(20);
    expect(positioned[1].end).toBe(25);
  });

  it('should not bug lol', () => {
    const emotes = [
      {
        type: 'twitch',
        name: 'mimi20Hipswing',
        id: 'emotesv2_447975666ff14fcaa9942f317758f5c2',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/3.0',
        },
        start: 0,
        end: 13,
      },
      {
        type: 'twitch',
        name: 'mimi20Hipswing',
        id: 'emotesv2_447975666ff14fcaa9942f317758f5c2',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/3.0',
        },
        start: 15,
        end: 28,
      },
      {
        type: 'twitch',
        name: 'mimi20Hipswing',
        id: 'emotesv2_447975666ff14fcaa9942f317758f5c2',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/3.0',
        },
        start: 30,
        end: 43,
      },
      {
        type: 'twitch',
        name: 'mimi20Hipswing',
        id: 'emotesv2_447975666ff14fcaa9942f317758f5c2',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/3.0',
        },
        start: 45,
        end: 58,
      },
      {
        type: 'twitch',
        name: 'mimi20Hipswing',
        id: 'emotesv2_447975666ff14fcaa9942f317758f5c2',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_447975666ff14fcaa9942f317758f5c2/default/dark/3.0',
        },
        start: 60,
        end: 73,
      },
      {
        type: 'twitch',
        name: 'mimi20Helepop',
        id: 'emotesv2_fc38a0748fd14876863f5763ae5d2be4',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_fc38a0748fd14876863f5763ae5d2be4/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_fc38a0748fd14876863f5763ae5d2be4/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_fc38a0748fd14876863f5763ae5d2be4/default/dark/3.0',
        },
        start: 75,
        end: 87,
      },
      {
        type: 'twitch',
        name: 'mimi20Helepop',
        id: 'emotesv2_fc38a0748fd14876863f5763ae5d2be4',
        gif: false,
        urls: {
          '1': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_fc38a0748fd14876863f5763ae5d2be4/default/dark/1.0',
          '2': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_fc38a0748fd14876863f5763ae5d2be4/default/dark/2.0',
          '4': 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_fc38a0748fd14876863f5763ae5d2be4/default/dark/3.0',
        },
        start: 89,
        end: 101,
      },
    ];

    const text =
      'mimi20Hipswing mimi20Hipswing mimi20Hipswing mimi20Hipswing mimi20Hipswing mimi20Helepop mimi20Helepop';

    const result = message.replaceEmotesWithHTML(text, emotes as any);

    console.log(result);

    expect((result.match(/<img /g) || []).length).toBe(7);
    expect(result.includes('/>g')).toBe(false);
    expect(result.includes('/>p')).toBe(false);
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

    console.log(result);

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

    console.log(result);

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

    console.log(result);

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

    console.log(result);

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

    console.log(result);

    expect(result).toBe(
      'Hi <img src="https://example.com/smile-1.png" alt="Smile" class="emote" style="width: auto; height: 1em; vertical-align: middle;" /> friend',
    );
  });

  it('replaceYoutubeEmotesWithHTML should keep unknown codes unchanged', () => {
    const text = 'Hi :unknown: friend';
    const result = message.replaceYoutubeEmotesWithHTML(text, [] as any);

    console.log(result);

    expect(result).toBe('Hi :unknown: friend');
  });

  it('generateBadges should build twitch badges and amounts from badge list', async () => {
    const result = await message.generateBadges(['moderator/2', 'subscriber/10'], 'twitch');

    console.log(result);

    expect(result.keys.includes('moderator')).toBe(true);
    expect(result.keys.includes('subscriber')).toBe(true);
    expect(result.versions.moderator).toBe('0');
    expect(result.amount.moderator).toBe(2);
    expect(result.versions.subscriber).toBe('5'); // 9 months
    expect(result.amount.subscriber).toBe(10);
    expect(Array.isArray(result.badges)).toBe(true);
  });

  it('generateBadges should keep unknown badges after prioritized badges', async () => {
    const result = await message.generateBadges(
      ['subscriber/10', 'custom-badge/1', 'moderator/2'] as any,
      'twitch',
    );

    expect(result.keys).toEqual(['moderator', 'subscriber']);
  });

  it('generateBadges should return youtube result shape', async () => {
    const result = await message.generateBadges(['moderator', 'partner'], 'youtube');

    console.log(result);

    expect(result.isVerified).toBe(true);
    expect(result.isChatOwner).toBe(false);
    expect(result.isChatSponsor).toBe(false);
    expect(result.isChatModerator).toBe(true);
  });

  it('generateBadges should return the right bits badge', async () => {
    const result = await message.generateBadges(['bits/5000'], 'twitch');

    console.log(result);

    expect(result.keys.includes('bits')).toBe(true);
    expect(result.versions.bits).toBe('5000');
    expect(result.amount.bits).toBe(5000);
    expect(result.badges[0].description).toBe('cheer 5000');
  });

  it('generateBadges should return the right bits leader badge', async () => {
    const result = await message.generateBadges(['bits-leader/2'], 'twitch');

    console.log(result);

    expect(result.keys.includes('bits-leader')).toBe(true);
    expect(result.versions['bits-leader']).toBe('2');
    expect(result.amount['bits-leader']).toBe(2);
    expect(result.badges[0].description).toBe('Bits Leader 2');
  });

  it('generateBadges should return the right subscriber badge', async () => {
    const result = await message.generateBadges(['subscriber/12'], 'twitch');

    console.log(result);

    expect(result.keys.includes('subscriber')).toBe(true);
    expect(result.versions.subscriber).toBe('6');
    expect(result.amount.subscriber).toBe(12);
    // For some reason Twitch's API returns the 6 months description for the 12 months badge, but that's what we should return
    expect(result.badges[0].description).toBe('6-Month Subscriber');
  });

  it('generateBadges should return the right badge variation', async () => {
    const result = await message.generateBadges(['predictions/blue 10'], 'twitch');

    console.log(result);

    expect(result.keys.includes('predictions')).toBe(true);
    expect(result.versions.predictions).toBe('blue-10');
    expect(result.badges[0].description).toBe('Predicted Blue (10)');
  });

  it('mapGlobalBadgeVersionAmount should return the correct key', async () => {
    expect(message.mapGlobalBadgeVersionAmount('warcraft', 'Horde')).toBe('horde');
    expect(message.mapGlobalBadgeVersionAmount('twitchbot', 'auto mod')).toBe('1');
    expect(message.mapGlobalBadgeVersionAmount('clips-leader', '5')).toBe('3');
    expect(message.mapGlobalBadgeVersionAmount('bits', 18000)).toBe('10000');
    expect(message.mapGlobalBadgeVersionAmount('subscriber', 60)).toBe('6');
    expect(message.mapGlobalBadgeVersionAmount('moments', 'tier 18')).toBe('18');
    expect(message.mapGlobalBadgeVersionAmount('moments', 16)).toBe('16');
    expect(message.mapGlobalBadgeVersionAmount('predictions', 'blue 10')).toBe('blue-10');
    expect(message.mapGlobalBadgeVersionAmount('social-sharing', '100 views')).toBe('1');
    expect(message.mapGlobalBadgeVersionAmount('social-sharing', 150)).toBe('1');
    expect(message.mapGlobalBadgeVersionAmount('social-sharing', 15000)).toBe('2');
  });
});
