import { Session } from '../session.js';

export type onSessionUpdateEvent = CustomEvent<onSessionUpdate>;

export type onSessionUpdate = {
  session: Session;
};
