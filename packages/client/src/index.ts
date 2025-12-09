import { Client } from './client/index.js';
import { Simulation } from './simulation/index.js';
import { onEventReceivedEvent } from './types/streamelements/events/onEventReceived.js';
import { onSessionUpdateEvent } from './types/streamelements/events/onSessionUpdate.js';
import { onWidgetLoadEvent } from './types/streamelements/events/onWidgetLoad.js';
import { Logger } from './utils/Logger.js';
import { Button } from './actions/button.js';
import { Command } from './actions/command.js';
import { findEmotesInText, replaceEmotesWithHTML } from './utils/Message.js';
import { EventProvider } from './utils/EventProvider.js';
import { useStorage } from './utils/useStorage.js';
import { useQueue } from './utils/useQueue.js';
import type { SE_API as SE_API_TYPE } from './types/streamelements/index.js';
import './client/listener.js';
import { initializeLocalSEAPI } from './streamelements/api.js';

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

type _Tixyel_ = typeof Tixyel;

export const USE_SE_API: Promise<SE_API_TYPE> = typeof SE_API !== 'undefined' ? Promise.resolve(SE_API) : Promise.resolve(initializeLocalSEAPI());

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

  const Tixyel: _Tixyel_;
  var client: Client;

  const SE_API: SE_API_TYPE;
  const USE_SE_API: Promise<SE_API_TYPE>;
}

if (typeof window !== 'undefined') {
  window.Tixyel = Tixyel;
}
