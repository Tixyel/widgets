# @tixyel/streamelements

## 7.13.0

### Minor Changes

- Added max entries for event history

## 7.12.3

### Patch Changes

- lol

## 7.12.2

### Patch Changes

- Fix again

## 7.12.1

### Patch Changes

- Fixed helpers being added to the field results

## 7.12.0

### Minor Changes

- Add gradient type to the field builder

## 7.11.0

### Minor Changes

- 4232ae0: Move getTops method to top

## 7.10.0

### Minor Changes

- a86b57d: update test property type in CommandOptions and enhance validation logic

## 7.9.0

### Minor Changes

- e7a118c: Update queue types and processor function for improved clarity and structure

## 7.8.0

### Minor Changes

- 67bcee6: Add escapeHtml method to safely render HTML by escaping special characters

## 7.7.0

### Minor Changes

- 0c9b10c: Add SEHelper class for StreamElements custom field management

## 7.6.8

### Patch Changes

- bffd7c9: fix: improve error handling in update method for unloaded storage

## 7.6.7

### Patch Changes

- 233d865: Improve useStorage methods for better data handling and event emission

## 7.6.6

### Patch Changes

- fa521e1: Enhance event listener condition for debug logging

## 7.6.5

### Patch Changes

- 02969a4: enhance custom event payload type

## 7.6.4

### Patch Changes

- 447a717: Streamline event emission for unhandled providers

## 7.6.3

### Patch Changes

- b29ae46: Update event timestamp to use current time

## 7.6.2

### Patch Changes

- 07b4c4a: Update event history structure to include event details and the timestamp

## 7.6.1

### Patch Changes

- 488c481: Persist event history to localStorage

## 7.6.0

### Minor Changes

- 2aab559: Refact internal client management

## 7.5.2

### Patch Changes

- 2533ecd: enhance client event handling with custom events

## 7.5.1

### Patch Changes

- a6f65d9: Integrate localQueue handling in resumeQueue

## 7.5.0

### Minor Changes

- b927a42: Enhance SE_API with event handling capabilities and improve sendMessage functionality

## 7.4.0

### Minor Changes

- cc66900: Reorganize local functions and implement event tests

## 7.3.1

### Patch Changes

- a0b2c4c: Update parseProvider method to use overrideProvider parameter for better clarity

## 7.3.0

### Minor Changes

- 43bd4bb: Add identifyMessage method for Twitch message handling and improve type definitions

## 7.2.1

### Patch Changes

- d65d575: Enhance emote handling by sorting and normalizing end positions

## 7.2.0

### Minor Changes

- 577ab49: feat: Implement animation helper class with various animation methods and types

## 7.1.0

### Minor Changes

- 27c1a82: Enhance splitTextToChars function with options for whitespace handling and indexing

## 7.0.5

### Patch Changes

- 5361299: Update user identification logic for Twitch and YouTube providers

## 7.0.4

### Patch Changes

- 7868031: Add badge priority handling and new badge generation test

## 7.0.3

### Patch Changes

- d49c823: Add unit tests for FakeUserPool badge assignment and compatibility

## 7.0.2

### Patch Changes

- 3698292: Update badge type to use Twitch.badge

## 7.0.1

### Patch Changes

- 19d7585: Fix id

## 7.0.0

### Major Changes

- 3c3b249: ## Breaking Changes
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

## 6.5.1

### Patch Changes

- 5fb386b: Move utility classes

## 6.5.0

### Minor Changes

- 22e1242: Enhance emote handling with new Emoji type and update related functions

## 6.4.9

### Patch Changes

- 11419b7: Update Button and Command classes to handle optional Client context and register actions correctly

## 6.4.8

### Patch Changes

- 19499e0: Update parseProvider function to handle optional provider parameter and default to 'twitch'

## 6.4.7

### Patch Changes

- 92839b7: Update splitTextToChars function to correctly handle character indexing

## 6.4.6

### Patch Changes

- 5443776: Add exclusivity index to character processing in splitTextToChars function

## 6.4.5

### Patch Changes

- f2687cd: Enhance splitTextToChars function to preserve whitespace and improve element processing

## 6.4.4

### Patch Changes

- a428ac3: Enhance Twitch badge handling and message event structure in local module

## 6.4.3

### Patch Changes

- 1e78e39: Improve optional chaining and formatting in button, command, and useQueue actions

## 6.4.2

### Patch Changes

- d79b0c2: Update client references to use optional chaining

## 6.4.1

### Patch Changes

- 6bca032: Update dependencies and improve client checks for event listeners

## 6.4.0

### Minor Changes

- 09f01b3: Streamline event handling and queue initialization in listener

## 6.3.0

### Minor Changes

- 1fcbe0e: Update dependencies and refactor type exports

## 6.2.2

### Patch Changes

- 168397b: Change history and detected properties to public access

## 6.2.1

### Patch Changes

- b4008fa: Fix retyping

## 6.2.0

### Minor Changes

- cf413c8: Improve Helper with more functions and better typing

## 6.1.0

### Minor Changes

- b3c3bd2: Reestructure modules and implement useComms for multi widget communication

## 6.0.3

### Patch Changes

- bffe2c8: Wait for the client initialize before starting the queue

## 6.0.2

### Patch Changes

- 598531a: Update Button template assignment to handle field type and adjust CommandOptions permissions type

## 6.0.1

### Patch Changes

- 81813cb: Improve enqueue method to handle multiple items and enhance processor function syntax

## 6.0.0

### Major Changes

- f5800b6: Enhance string template functionality with new modifiers and presets

## 5.5.0

### Minor Changes

- b18b45b: Enhance string template parsing and testing with multiple modifiers

## 5.4.0

### Minor Changes

- 23e054e: Fix jsdoc exporting with rollup

## 5.3.0

### Minor Changes

- f926636: Enhance Button class with additional options and generate method; add typedValues and typedKeys utilities

## 5.2.0

### Minor Changes

- 5e215e0: Update capitalize return type to use Capitalize utility type and modify update method to accept Partial<T>

## 5.1.1

### Patch Changes

- 4ccad83: Add emulated flag to session updates and event received types

## 5.1.0

### Minor Changes

- 816446a: Enhance splitTextToChars to wrap HTML with containers and index characters

## 5.0.1

### Patch Changes

- 888b023: Export Data object

## 5.0.0

### Major Changes

- ca1a58d: Reorganize modules and rename "Simulation" to "Local" to better understanding
  Add sounds functions to the helper module
  Add tests for some functions

## 4.6.1

### Patch Changes

- 3ed74c2: Enhance Logger class with improved prefix handling

## 4.6.0

### Minor Changes

- 5a51377: Add scaling and text fitting functions to element module

## 4.5.6

### Patch Changes

- feea3b1: Improve style merging logic in element and add test for color template

## 4.5.5

### Patch Changes

- 33eb043: Move simulation functions to it's own files and add unit tests

## 4.5.4

### Patch Changes

- a53a7c0: Update JSON types for improved clarity and consistency

## 4.5.3

### Patch Changes

- c09b0d2: Update useStorage to use JSON type and improve data handling

## 4.5.2

### Patch Changes

- fca0156: Export additional types

## 4.5.1

### Patch Changes

- b7d7c09: Update permission verification logic to allow wildcard access

## 4.5.0

### Minor Changes

- 958385b: Update superchat session handling

## 4.4.0

### Minor Changes

- 71169d4: Add Sponsor and SponsorCommunityGift event types to StreamElements

## 4.3.2

### Patch Changes

- 8634277: Enhance event types by expanding YoutubeEvents and StreamElements event definitions

## 4.3.1

### Patch Changes

- 27ab4a6: Add isMock property to event types and enhance YoutubeEvents structure

## 4.3.0

### Minor Changes

- d6f28d9: Enhance type exports and improve NumberAsString type definition

## 4.2.3

### Patch Changes

- bf23e67: Initialize Simulation queue on client load and handle event processing

## 4.2.2

### Patch Changes

- 9258adc: Rename Queue to queue and improve error handling in useQueue

## 4.2.1

### Patch Changes

- 56c5609: Ensure client instance check is performed in the constructor of useQueue

## 4.2.0

### Minor Changes

- 180bce3: Enhance session update handling with new event types and queue processing

## 4.1.0

### Minor Changes

- b294736: Add debug option to Client and enhance logging in ComfyJS

## 4.0.1

### Patch Changes

- 45e7935: Update ComfyJS integration and add initialization option

## 4.0.0

### Major Changes

- 393fefe: Implement ComfyJS instance management for Twitch chat interactions

## 3.10.0

### Minor Changes

- 612bdac: Update YouTube badge generation to reflect correct ownership and verification statuses and enhance Twitch and YouTube event handling with improved data structures

## 3.9.0

### Minor Changes

- dac6657: Add Event types and enhance StreamElements and Twitch event handling

## 3.8.0

### Minor Changes

- 714002f: Enhance probability function with typedEntries utility

## 3.7.1

### Patch Changes

- e073f47: improve logic for amount and count assignment in Simulation namespace

## 3.7.0

### Minor Changes

- 92d49bc: Add utility functions for the Alejo pronouns API and export

## 3.6.0

### Minor Changes

- dcd270d: Add utility functions for youtube events.

## 3.5.0

### Minor Changes

- 3bc9b4d: Refactored types and reexport utility classes

## 3.4.0

### Minor Changes

- 50f543c: Update button and command execution logic

## 3.3.0

### Minor Changes

- 4444f8f: Move USE_SE_API to Tixyel export

## 3.2.0

### Minor Changes

- 2b6289e: Improve useStorage class with better types; Improve useQueue with better types; Add LOCAL SE_API for local development; Moved simulation data

## 3.1.0

### Minor Changes

- ae31d0d: fix: update callback signatures to include context in Command and useStorage classes

## 3.0.1

### Patch Changes

- 287ff7d: Fix: Include source maps in distribution

## 3.0.0

### Major Changes

- 7c3f031: Exported utility functions and classes

## 2.0.0

### Major Changes

- first version!
