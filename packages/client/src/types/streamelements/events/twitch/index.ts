import { Twitch$Cheer } from './cheer.js';
import { Twitch$Follower } from './follower.js';
import { Twitch$DeleteMessage, Twitch$DeleteMessages } from './message.delete.js';
import { Twitch$Message } from './message.js';
import { Twitch$Raid } from './raid.js';
import { Twitch$Subscriber } from './subscriber.js';

export type Twitch = Twitch$Message | Twitch$DeleteMessage | Twitch$DeleteMessages | Twitch$Follower | Twitch$Cheer | Twitch$Raid | Twitch$Subscriber;
