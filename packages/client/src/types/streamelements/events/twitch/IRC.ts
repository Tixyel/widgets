export type Twitch$IRC = {
  /**
   * Contains metadata related to the chat badges in the badges tag.
   * Currently, this tag contains metadata only for subscriber badges, to indicate the number  of months the user has been a subscriber.
   * @example
   * ```javascript
   * 'subscriber/25'
   * ```
   */
  'badge-info': String;
  /**
   * Comma-separated list of chat badges in the form, <badge>/<version>. For example admin/1. There are many possible badge values, but here are few: admin, bits, broadcaster, moderator, subscriber, staff, turbo
   * Most badges have only 1 version, but some badges like subscriber badges offer different versions of the badge depending on how long the user has subscribed.
   * @example
   * ```javascript
   * 'staff/1,bits/1000,partner/1'
   * ```
   */
  'badges': String;
  /**
   * The color of the user's name in the chat.
   * @example
   * ```javascript
   * '#FF0000'
   * ```
   */
  'color': string | undefined;
  /**
   * The user’s display name, escaped as described in the [IRCv3 spec](https://ircv3.net/specs/extensions/message-tags.html). This tag may be empty if it is never set.
   * @example
   * ```javascript
   * 'TwitchUser'
   * ```
   */
  'display-name': String;
  /**
   * A comma-delimited list of IDs that identify the emote sets that the user has access to. Is always set to at least zero (0).
   */
  'emote-sets': String;
  /**
   * A slash-delimited list of emotes and their positions in the message. Each emote is in the form, `<emote ID>:<ranges>`, where ranges are comma-delimited pairs of indices in the form `<start position>-<end position>`. The position indices are zero-based.
   * NOTE: It’s possible for a message to begin with with `\001ACTION` when /me is used by a user in chat. In these cases emote positions should be considered to begin after `001ACTION `, which includes its succeeding whitespace.
   * @example
   * ```javascript
   * '25:0-4,12-16/1902:6-10'
   * ```
   */
  'emotes': String;
  'flags': String;
  /**
   * A Boolean value that indicates whether the user has site-wide commercial free mode enabled. Is true (1) if enabled; otherwise, false (0).
   */
  'turbo': 0 | 1;
  /**
   * The User ID of the relevant user.
   * @example
   * ```javascript
   * '1337'
   * ```
   */
  'user-id': String;
  /**
   * The type of user. Possible values are:
   * ```
   *  • "" - A normal user
   *  • admin - A Twitch administrator
   *  • global_mod - A global moderator
   *  • staff - A Twitch employee
   * ```
   */
  'user-type': '' | 'admin' | 'global_mod' | 'staff';
  /**
   * The amount of Bits the user cheered. Only a Bits cheer message includes this tag.
   */
  'bits': number;
  /**
   * A Boolean value that determines whether the user is a moderator. Is true (1) if the user is a moderator; otherwise, false (0).
   */
  'mod': 0 | 1;
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
  'room-id': String;
  /**
   * Comma-separated list of chat badges for the chatter in the room the message was sent from. This uses the same format as the `badges` tag.
   */
  'source-badges': String;
  /**
   * Contains metadata related to the chat badges in the source-badges tag.
   */
  'source-badge-info': String;
  /**
   * A UUID that identifies the source message from the channel the message was sent from.
   */
  'source-id': String;
  /**
   * A Boolean that indicates if a message sent during a shared chat session is only sent to the source channel. Has no effect if the message is not sent during a shared chat session.
   */
  'source-only': Boolean;
  /**
   * An ID that identifies the chat room (channel) the message was sent from.
   */
  'source-room-id': String;
  /**
   * A Boolean value that determines whether the user is a subscriber. Is true (1) if the user is a subscriber; otherwise, false (0).
   */
  'subscriber': 0 | 1;
  /**
   * The UNIX timestamp.
   */
  'tmi-sent-ts': number;
  /**
   * A Boolean value that determines whether the user that sent the chat is a VIP. The message includes this tag if the user is a VIP; otherwise, the message doesn’t include this tag (check for the presence of the tag instead of whether the tag is set to true or false).
   */
  'vip': undefined | '';
};
