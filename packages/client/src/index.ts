import { Client } from './client/index.js';
import { Simulation } from './simulation/index.js';
import { onEventReceivedEvent } from './types/streamelements/events/onEventReceived.js';
import { onSessionUpdateEvent } from './types/streamelements/events/onSessionUpdate.js';
import { onWidgetLoadEvent } from './types/streamelements/events/onWidgetLoad.js';
import { Logger } from './utils/Logger.js';
import './client/listener.js';

export const Tixyel = {
  Client: Client,
  Simulation: Simulation,
  logger: new Logger(),
};

declare global {
  interface Window {
    Tixyel: typeof Tixyel;
    client?: Client;
  }
  interface WindowEventMap {
    'onWidgetLoad': onWidgetLoadEvent;
    'onSessionUpdate': onSessionUpdateEvent;
    'onEventReceived': onEventReceivedEvent;
  }
}

if (typeof window !== 'undefined') {
  (window as any).Tixyel = Tixyel;
}
