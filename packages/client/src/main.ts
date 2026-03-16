import './client/listener.js';
import { Button, usedButtons } from './actions/button.js';
import { Command, usedCommands } from './actions/command.js';
import { Client } from './client/client.js';
import { Data } from './data/index.js';
import { Helper } from './helper/index.js';
import { Local } from './local/index.js';
import { EventProvider } from './modules/EventProvider.js';
import { useComms, usedComms } from './modules/useComms.js';
import { useLogger } from './modules/useLogger.js';
import { useQueue } from './modules/useQueue.js';
import { usedStorages, useStorage } from './modules/useStorage.js';
import { useComfyJs } from './multistream/comfyJs.js';
import { initializeLocalSEAPI } from './streamelements/api.js';
import { StreamElements } from './types/index.js';
import { Alejo } from './utils/alejo.js';

export const USE_SE_API: Promise<StreamElements.SE_API> =
  typeof SE_API !== 'undefined' ? Promise.resolve(SE_API) : Promise.resolve(initializeLocalSEAPI());
export const logger = new useLogger();

export const main = {
  SeAPI: USE_SE_API,

  Client: Client,
  Helper: Helper,
  Local: Local,
  Data: Data,
  logger: logger,

  modules: {
    EventProvider,
    useStorage,
    useQueue,
    useLogger,
    useComms,
  },
  actions: {
    Button,
    Command,
  },
  multistream: {
    useComfyJs,
  },
  internal: {
    usedStorages,
    usedComms,
    usedCommands,
    usedButtons,
  },
  pronouns: {
    Alejo,
  },
};

if (typeof window !== 'undefined') {
  (window as any).Tixyel = main;
} else {
  (globalThis as any).Tixyel = main;
}
