import { findEmotesInText, generateBadges, replaceEmotesWithHTML } from './utils/Message.js';
import { StreamElements } from './types/streamelements/main.js';
import { initializeLocalSEAPI } from './streamelements/api.js';
import { EventProvider } from './utils/EventProvider.js';
import { Simulation } from './simulation/simulation.js';
import { usedStorages, useStorage } from './utils/useStorage.js';
import { Command } from './actions/command.js';
import { useQueue } from './utils/useQueue.js';
import { Button } from './actions/button.js';
import { Client } from './client/client.js';
import { Logger } from './utils/Logger.js';
import './client/listener.js';

export * from './types/index.js';

export const USE_SE_API: Promise<StreamElements.SE_API> = typeof SE_API !== 'undefined' ? Promise.resolve(SE_API) : Promise.resolve(initializeLocalSEAPI());

export const logger = new Logger();

export const Tixyel = {
  USE_SE_API,
  Simulation,
  Client,
  logger,
  utils: { findEmotesInText, replaceEmotesWithHTML, generateBadges },
  modules: { Button, Command, EventProvider, useStorage, useQueue, Logger },
  data: { usedStorages },
} as const;

type Main = typeof Tixyel;

declare global {
  interface Window {
    Tixyel: Main;
    client: Client;
  }

  interface WindowEventMap {
    onWidgetLoad: CustomEvent<StreamElements.Event.onWidgetLoad>;
    onSessionUpdate: CustomEvent<StreamElements.Event.onSessionUpdate>;
    onEventReceived: CustomEvent<StreamElements.Event.onEventReceived>;
  }

  const Tixyel: Main;
  var client: Client;

  const SE_API: StreamElements.SE_API;
}

if (typeof window !== 'undefined') {
  window.Tixyel = Tixyel;
}
