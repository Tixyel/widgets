import { findEmotesInText, generateBadges, replaceEmotesWithHTML, replaceYoutubeEmotesWithHTML } from './utils/Message.js';
import { StreamElements } from './types/streamelements/main.js';
import { initializeLocalSEAPI } from './streamelements/api.js';
import { EventProvider } from './utils/EventProvider.js';
import { Simulation } from './simulation/simulation.js';
import { usedStorages, useStorage } from './utils/useStorage.js';
import type { ComfyJSInstance } from 'comfy.js';
import { useComfyJs } from './utils/comfyJs.js';
import { Command } from './actions/command.js';
import { useQueue } from './utils/useQueue.js';
import { Button } from './actions/button.js';
import { Client } from './client/client.js';
import { Logger } from './utils/Logger.js';
import { Alejo } from './utils/alejo.js';
import './client/listener.js';
import { parseProvider } from './client/listener.js';

export type * from './types/index.js';
export type * from './utils/alejo.js';

export const USE_SE_API: Promise<StreamElements.SE_API> = typeof SE_API !== 'undefined' ? Promise.resolve(SE_API) : Promise.resolve(initializeLocalSEAPI());

export const logger = new Logger();

export const Tixyel = {
  Client,

  USE_SE_API,
  Simulation,
  logger,
  Alejo,

  utils: {
    findEmotesInText,
    replaceEmotesWithHTML,
    replaceYoutubeEmotesWithHTML,
    generateBadges,
    parseProvider,
  },

  modules: {
    Button,
    Command,
    EventProvider,
    useComfyJs,
    useStorage,
    useQueue,
    Logger,
  },

  data: {
    usedStorages,
  },
} as const;

type Main = typeof Tixyel;

declare global {
  interface Window {
    Tixyel: Main;
    client: Client;
    ComfyJS?: ComfyJSInstance;
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
