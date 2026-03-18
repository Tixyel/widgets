---
'@tixyel/streamelements': major
---

## Breaking Changes

- Collection files no longer expose default exports — named imports are now required
- Badge handling API now uses `tags` instead of `GlobalBadgeSetId` directly, affecting `BadgeOptions`, `TwitchResult`, `FakeUser`, and `FakeUserPool`
- Twitch event types changed to lowercase string literals
- Message export surface has changed; previously duplicated exports removed; `normal_messages` replaces `messages` for filtering

## New Features

- Add `FakeUser` and `FakeUserPool` classes for local development and user simulation, with optional `id` support in `FakeUserPoolOptions`
- Add `GlobalBadge` and `GlobalBadgeSetId` types with mapping functions for global badge versions and amounts
- Add full global badges set via `globalBadges`
- Add `RequireAtLeastOne` utility type
- Add `room-id` and additional tags to Twitch message event data structure
- Add FFZ emote type to emote definitions
- Add date comparison and user identification methods to `UtilsHelper`
- Expand message data with new Twitch and YouTube messages; update names list with additional entries

## Fixes

- Correct badge key formatting in tags
- Fix badges export to use `globalBadges` instead of `commonBadges`
- Fix type assertion in Twitch message event

## Internal

- Simplify imports in `Data` namespace using `Collection` directly
- Enhance JSDoc annotations across helpers and types
- Move and expand unit tests for `MessageHelper`
- Update `@napi-rs/canvas` to v0.1.97, `inquirer` to v13.3.2; bump `@typescript/native-preview` and `tsdown`
