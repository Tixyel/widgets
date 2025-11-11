import { StreamElements } from './integrated/index.js';
import { Twitch } from './twitch/index.js';
import { Youtube } from './youtube/index.js';

export type onEventReceivedEvent = CustomEvent<onEventReceived>;

export type onEventReceived = Twitch | Youtube | StreamElements;
