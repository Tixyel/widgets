import { Youtube$Message } from './message.js';
import { Youtube$Sponsor } from './sponsor.js';
import { YouTube$Subscriber } from './subscriber.js';
import { YouTube$Superchat } from './superchat.js';

export type Youtube = Youtube$Message | YouTube$Superchat | YouTube$Subscriber | Youtube$Sponsor;
