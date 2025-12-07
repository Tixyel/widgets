import { Client } from './client/index.js';
import { Simulation } from './simulation/index.js';
import { onEventReceivedEvent } from './types/streamelements/events/onEventReceived.js';
import { onSessionUpdateEvent } from './types/streamelements/events/onSessionUpdate.js';
import { onWidgetLoadEvent } from './types/streamelements/events/onWidgetLoad.js';
import { Logger } from './utils/Logger.js';
import './client/listener.js';
import { Button } from './actions/button.js';
import { Command } from './actions/command.js';
import { findEmotesInText, replaceEmotesWithHTML } from './utils/Message.js';
import { EventProvider } from './utils/EventProvider.js';
import { useStorage } from './utils/useStorage.js';
import { useQueue } from './utils/useQueue.js';

export * from './types/index.js';

export const Tixyel = {
  Client,
  Simulation,
  logger: new Logger(),
  utils: {
    findEmotesInText,
    replaceEmotesWithHTML,
  },
  modules: {
    Button,
    Command,
    EventProvider,
    useStorage,
    useQueue,
  },
} as const;

type _Tixyel_ = {
  Client: typeof Client;
  Simulation: typeof Simulation;
  logger: Logger;
  utils: {
    findEmotesInText: typeof findEmotesInText;
    replaceEmotesWithHTML: typeof replaceEmotesWithHTML;
  };
  modules: {
    Button: typeof Button;
    Command: typeof Command;
    EventProvider: typeof EventProvider;
    useStorage: typeof useStorage;
    useQueue: typeof useQueue;
  };
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
