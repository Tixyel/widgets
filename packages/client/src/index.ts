import { Client } from './client/index.js';
import { Simulation } from './simulation/index.js';
import { onEventReceivedEvent } from './types/streamelements/events/onEventReceived.js';
import { onSessionUpdateEvent } from './types/streamelements/events/onSessionUpdate.js';
import { onWidgetLoadEvent } from './types/streamelements/events/onWidgetLoad.js';
import { Logger } from './utils/Logger.js';
import './client/listener.js';
import { Button } from './actions/button.js';
import { Command } from './actions/command.js';

export const Tixyel = {
  Client,
  Simulation,
  logger: new Logger(),
  Button,
  Command,
} as const;

type _Tixyel_ = {
  Client: typeof Client;
  Simulation: typeof Simulation;
  logger: Logger;
};

declare global {
  interface Window {
    Tixyel: _Tixyel_;
    client: Client;
  }

  interface WindowEventMap {
    onWidgetLoad: onWidgetLoadEvent;
    onSessionUpdate: onSessionUpdateEvent;
    onEventReceived: onEventReceivedEvent;
  }

  var Tixyel: _Tixyel_;
  var client: Client;
}

if (typeof window !== 'undefined') {
  window.Tixyel = Tixyel;
}
