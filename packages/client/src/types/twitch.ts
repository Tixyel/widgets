export namespace Twitch {
  export type IRC = {
    /**
     * Contains metadata related to the chat badges in the badges tag.
     * Currently, this tag contains metadata only for subscriber badges, to indicate the number  of months the user has been a subscriber.
     * @example
     * ```javascript
     * 'subscriber/25'
     * ```
     */
    'badge-info': string;
    /**
     * Comma-separated list of chat badges in the form, <badge>/<version>. For example admin/1. There are many possible badge values, but here are few: admin, bits, broadcaster, moderator, subscriber, staff, turbo
     * Most badges have only 1 version, but some badges like subscriber badges offer different versions of the badge depending on how long the user has subscribed.
     * @example
     * ```javascript
     * 'staff/1,bits/1000,partner/1'
     * ```
     */
    badges: string;
    /**
     * The color of the user's name in the chat.
     * @example
     * ```javascript
     * '#FF0000'
     * ```
     */
    color: string | undefined;
    /**
     * The user’s display name, escaped as described in the [IRCv3 spec](https://ircv3.net/specs/extensions/message-tags.html). This tag may be empty if it is never set.
     * @example
     * ```javascript
     * 'TwitchUser'
     * ```
     */
    'display-name': string;
    /**
     * A comma-delimited list of IDs that identify the emote sets that the user has access to. Is always set to at least zero (0).
     */
    'emote-sets': string;
    /**
     * A slash-delimited list of emotes and their positions in the message. Each emote is in the form, `<emote ID>:<ranges>`, where ranges are comma-delimited pairs of indices in the form `<start position>-<end position>`. The position indices are zero-based.
     * NOTE: It’s possible for a message to begin with with `\001ACTION` when /me is used by a user in chat. In these cases emote positions should be considered to begin after `001ACTION `, which includes its succeeding whitespace.
     * @example
     * ```javascript
     * '25:0-4,12-16/1902:6-10'
     * ```
     */
    emotes: string;
    flags: string;
    /**
     * A Boolean value that indicates whether the user has site-wide commercial free mode enabled. Is true (1) if enabled; otherwise, false (0).
     */
    turbo: 0 | 1;
    /**
     * The User ID of the relevant user.
     * @example
     * ```javascript
     * '1337'
     * ```
     */
    'user-id': string;
    /**
     * The type of user. Possible values are:
     * ```
     *  • "" - A normal user
     *  • mod - A channel moderator
     *  • admin - A Twitch administrator
     *  • global_mod - A global moderator
     *  • staff - A Twitch employee
     * ```
     */
    'user-type': '' | 'mod' | 'admin' | 'global_mod' | 'staff';
    /**
     * The amount of Bits the user cheered. Only a Bits cheer message includes this tag.
     */
    bits: number;
    /**
     * A Boolean value that determines whether the user is a moderator. Is true (1) if the user is a moderator; otherwise, false (0).
     */
    mod: 0 | 1;
    /**
     * The ID of the message. In UUID format.
     */
    'msg-id': string | undefined;
    /**
     * An ID that uniquely identifies the direct parent message that this message is replying to. The message does not include this tag if this message is not a reply.
     */
    'reply-parent-msg-id': string | undefined;
    /**
     * An ID that identifies the sender of the direct parent message. The message does not include this tag if this message is not a reply.
     */
    'reply-parent-user-id': string | undefined;
    /**
     * The login name of the sender of the direct parent message. The message does not include this tag if this message is not a reply.
     */
    'reply-parent-user-login': string | undefined;
    /**
     * The display name of the sender of the direct parent message. The message does not include this tag if this message is not a reply.
     */
    'reply-parent-display-name': string | undefined;
    /**
     * The text of the direct parent message. The message does not include this tag if this message is not a reply.
     */
    'reply-parent-msg-body': string | undefined;
    /**
     * An ID that uniquely identifies the top-level parent message of the reply thread that this message is replying to. The message does not include this tag if this message is not a reply.
     */
    'reply-thread-parent-msg-id': string | undefined;
    /**
     * The login name of the sender of the top-level parent message. The message does not include this tag if this message is not a reply.
     */
    'reply-thread-parent-user-login': string | undefined;
    /**
     * An ID that identifies the chat room (channel).
     */
    'room-id': string;
    /**
     * Comma-separated list of chat badges for the chatter in the room the message was sent from. This uses the same format as the `badges` tag.
     */
    'source-badges': string;
    /**
     * Contains metadata related to the chat badges in the source-badges tag.
     */
    'source-badge-info': string;
    /**
     * A UUID that identifies the source message from the channel the message was sent from.
     */
    'source-id': string;
    /**
     * A Boolean that indicates if a message sent during a shared chat session is only sent to the source channel. Has no effect if the message is not sent during a shared chat session.
     */
    'source-only': Boolean;
    /**
     * An ID that identifies the chat room (channel) the message was sent from.
     */
    'source-room-id': string;
    /**
     * A Boolean value that determines whether the user is a subscriber. Is true (1) if the user is a subscriber; otherwise, false (0).
     */
    subscriber: 0 | 1;
    /**
     * The UNIX timestamp.
     */
    'tmi-sent-ts': number;
    /**
     * A Boolean value that determines whether the user that sent the chat is a VIP. The message includes this tag if the user is a VIP; otherwise, the message doesn’t include this tag (check for the presence of the tag instead of whether the tag is set to true or false).
     */
    vip: undefined | '';
  };

  export type Reply = {
    msgId: string;
    userId: string;
    userLogin: string;
    displayName: string;
    msgBody: string;
  };

  export type Thread = {
    parentMsgId: string;
    parentUserLogin: string;
  };

  export type badge = {
    type: string;
    version: string;
    url: string;
    description: string;
  };

  export type GlobalBadge = {
    set_id: tags;
    versions: Array<{
      id: string;
      image_url_1x: string;
      image_url_2x: string;
      image_url_4x: string;
      title: string;
      description: string;
      click_action: string | null;
      click_url: string | null;
    }>;
  };

  export type CommonTags =
    | 'no_video'
    | 'no_audio'
    | 'vip'
    | 'predictions'
    | 'lead_moderator'
    | 'moderator'
    | 'subscriber'
    | 'sub-gifter'
    | 'sub-gift-leader'
    | 'bits'
    | 'twitchbot'
    | 'staff'
    | 'admin'
    | 'partner'
    | 'turbo'
    | 'broadcaster'
    | 'hype-train'
    | 'bits'
    | 'bits-leader'
    | 'bot-badge'
    | 'founder'
    | 'admin'
    | 'extension'
    | 'game-developer'
    | 'global_mod'
    | 'artist-badge'
    | 'ambassador'
    | 'premium';

  export type tags =
    | CommonTags
    | 'qsmp2'
    | 'jasontheween-7-day-survival'
    | 'support-a-streamer-ho26-badge'
    | 'twitch-recap-2025'
    | 'ugly-sweater'
    | 'fright-fest-2025'
    | 'gamerduo'
    | 'video-games-day'
    | 'twitch-intern-2022'
    | 'touch-grass'
    | 'twitchcon-referral-program-2025-chrome-star'
    | 'twitchcon-referral-program-2025-bleedpurple'
    | 'share-the-love'
    | 'gone-bananas'
    | 'twitchcon-2025---rotterdam'
    | 'clip-the-halls'
    | 'twitch-recap-2024'
    | 'subtember-2024'
    | 'twitch-intern-2024'
    | 'twitch-dj'
    | 'destiny-2-the-final-shape-streamer'
    | 'destiny-2-final-shape-raid-race'
    | 'twitchcon-2024---san-diego'
    | 'minecraft-15th-anniversary-celebration'
    | 'warcraft'
    | 'vga-champ-2017'
    | 'tyranny_1'
    | 'twitchconNA2023'
    | 'twitchconNA2020'
    | 'twitchconNA2022'
    | 'twitchconNA2019'
    | 'twitchconEU2023'
    | 'twitchconEU2022'
    | 'twitchcon2018'
    | 'twitchconAmsterdam2020'
    | 'twitchconEU2019'
    | 'twitchcon2017'
    | 'twitchcon-2024---rotterdam'
    | 'twitch-recap-2023'
    | 'twitch-intern-2023'
    | 'treasure-adventure-world_1'
    | 'titan-souls_1'
    | 'this-war-of-mine_1'
    | 'the-surge_2'
    | 'the-surge_1'
    | 'the-surge_3'
    | 'the-golden-predictor-of-the-game-awards-2023'
    | 'the-game-awards-2023'
    | 'superhot_1'
    | 'strafe_1'
    | 'streamer-awards-2024'
    | 'starbound_1'
    | 'samusoffer_beta'
    | 'rplace-2023'
    | 'rift_1'
    | 'raiden-v-directors-cut_1'
    | 'psychonauts_1'
    | 'overwatch-league-insider_2019B'
    | 'overwatch-league-insider_2019A'
    | 'okhlos_1'
    | 'overwatch-league-insider_2018B'
    | 'overwatch-league-insider_1'
    | 'kingdom-new-lands_1'
    | 'jackbox-party-pack_1'
    | 'innerspace_2'
    | 'innerspace_1'
    | 'hello_neighbor_1'
    | 'gold-pixel-heart'
    | 'heavy-bullets_1'
    | 'glitchcon2020'
    | 'glhf-pledge'
    | 'getting-over-it_2'
    | 'getting-over-it_1'
    | 'frozen-synapse_1'
    | 'frozen-cortext_1'
    | 'firewatch_1'
    | 'enter-the-gungeon_1'
    | 'duelyst_5'
    | 'duelyst_6'
    | 'duelyst_7'
    | 'duelyst_2'
    | 'duelyst_4'
    | 'duelyst_3'
    | 'duelyst_1'
    | 'devilian_1'
    | 'devil-may-cry-hd_4'
    | 'devil-may-cry-hd_3'
    | 'devil-may-cry-hd_2'
    | 'devil-may-cry-hd_1'
    | 'deceit_1'
    | 'darkest-dungeon_1'
    | 'cuphead_1'
    | 'clip-champ'
    | 'broken-age_1'
    | 'bubsy-the-woolies_1'
    | 'brawlhalla_1'
    | 'bits-charity'
    | 'battlechefbrigade_3'
    | 'battlerite_1'
    | 'battlechefbrigade_2'
    | 'battlechefbrigade_1'
    | 'axiom-verge_1'
    | 'anomaly-2_1'
    | 'anomaly-warzone-earth_1'
    | 'H1Z1_1'
    | '60-seconds_3'
    | '60-seconds_2'
    | '60-seconds_1'
    | '1979-revolution_1'
    | '10-years-as-twitch-staff'
    | '15-years-as-twitch-staff'
    | '5-years-as-twitch-staff'
    | 'aang'
    | 'alone'
    | 'anonymous-cheerer'
    | 'arc-raiders-launch-2025'
    | 'arcane-season-2-premiere'
    | 'battlefield-6'
    | 'bingbonglove'
    | 'black-ops-7-global-launch'
    | 'borderlands-4-badge---ripper'
    | 'borderlands-4-badge---vault-symbol'
    | 'bungie-foundation-ally'
    | 'bungie-foundation-supporter'
    | 'chatter-cs-go-2022'
    | 'clips-leader'
    | 'creator-cs-go-2022'
    | 'crimson-butterfly'
    | 'diablo-30th-anniversary'
    | 'diana'
    | 'ditto'
    | 'dragonscimmy'
    | 'dreamcon-2024'
    | 'elden-ring-recluse'
    | 'elden-ring-wylder'
    | 'eso_1'
    | 'evo-2025'
    | 'fallout-season-2-ghoul'
    | 'first-stand-2026-supporter'
    | 'first-stand-2026-viewer'
    | 'fischer'
    | 'frog-lantern'
    | 'gears-of-war-superfan-badge'
    | 'gingko-leaf'
    | 'gold-pixel-heart---together-for-good-24'
    | 'gp-explorer-3'
    | 'hornet'
    | 'hunt-crosses'
    | 'hypershot-celestial'
    | 'jeff-the-land-shark'
    | 'k4sen-con-2025'
    | 'kodama'
    | 'la-velada-iv'
    | 'la-velada-v-badge'
    | 'lamby'
    | 'league-of-legends-mid-season-invitational-2025---grey'
    | 'league-of-legends-mid-season-invitational-2025---purple'
    | 'legendus'
    | 'lol-worlds-2025'
    | 'lost-ark-anniversary'
    | 'low'
    | 'marathon-reveal-runner'
    | 'marathon-silkworm'
    | 'marathon-sub-burger'
    | 'mel'
    | 'moments'
    | 'mr-raccoon'
    | 'never-grave---witch-hat'
    | 'path-of-exile-2-badge'
    | 'pokemon-30th-anniversary'
    | 'pokemon-legends-z-a-chikorita'
    | 'pokemon-legends-z-a-tepig'
    | 'pokemon-legends-z-a-totodile'
    | 'power-rangers'
    | 'purple-noob'
    | 'purple-pixel-heart---together-for-good-24'
    | 'raging-wolf-helm'
    | 'raider-icon-badge'
    | 'rainbow-six-siege-x-10th-anniversary'
    | 'revedtv-stream-awards-2025'
    | 'ruby-pixel-heart---together-for-good-24'
    | 'rudy'
    | 'rustmas-2025'
    | 'sajam-slam-badge'
    | 'scampuss'
    | 'seeks-eye'
    | 'social-sharing'
    | 'sonic-racing-crossworlds'
    | 'speedons-5-badge'
    | 'stream-for-humanity-2-2025'
    | 'streamer-awards-tux'
    | 'subtember-2025'
    | 'superultracombo-2023'
    | 'survival-cup-4'
    | 'tft-paris-open'
    | 'the-deer'
    | 'the-first-descendant-badge'
    | 'the-man-without-fear'
    | 'the-onryos-mask'
    | 'together-for-good-25---good-badge'
    | 'together-for-good-25---gooder-badge'
    | 'together-for-good-25---goodest-badge'
    | 'together-for-good-25---wicked-dub-badge'
    | 'total-war-anniversary'
    | 'toxic-zombie'
    | 'twitchcon-2026-europe-row-houses'
    | 'twitchcon-2026-europe-windmill'
    | 'umbrella-corporation'
    | 'user-anniversary'
    | 'vct-paris-2025'
    | 'yellow-noob'
    | 'zevent-2024'
    | 'zevent25';
}
