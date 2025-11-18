import type { Twitch$Cheer } from './cheer.js';
import type { Twitch$Follower } from './follower.js';
import type { Twitch$IRC } from './IRC.js';
import type { Twitch$DeleteMessage, Twitch$DeleteMessages } from './message.delete.js';
import type { Twitch$Message } from './message.js';
import type { Twitch$Raid } from './raid.js';
import type { Twitch$Subscriber } from './subscriber.js';

export type Twitch = Twitch$Message | Twitch$DeleteMessage | Twitch$DeleteMessages | Twitch$Follower | Twitch$Cheer | Twitch$Raid | Twitch$Subscriber;

export type { Twitch$Message, Twitch$DeleteMessage, Twitch$DeleteMessages, Twitch$Follower, Twitch$Cheer, Twitch$Raid, Twitch$Subscriber, Twitch$IRC };
