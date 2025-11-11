import { StreamElements$AlertService } from './alertService.js';
import { StreamElements$BotCounter } from './botCounter.js';
import { StreamElements$EventSkip } from './eventSkip.js';
import { StreamElements$EventTest } from './eventTest.js';
import { StreamElements$KVStore } from './kvstore.js';
import { StreamElements$Tip } from './tip.js';

export type StreamElements =
  | StreamElements$Tip
  | StreamElements$KVStore
  | StreamElements$BotCounter
  | StreamElements$AlertService
  | StreamElements$EventSkip
  | StreamElements$EventTest;
