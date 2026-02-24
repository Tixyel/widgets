import './client/listener.js';

import { Button } from './actions/button.js';
import { Command } from './actions/command.js';
import { Client } from './client/client.js';
import { Local } from './local/index.js';
import { initializeLocalSEAPI } from './streamelements/api.js';
import { StreamElements } from './types/index.js';
import { Alejo } from './utils/alejo.js';
import { useComfyJs } from './multistream/comfyJs.js';
import { EventProvider } from './modules/EventProvider.js';
import { useLogger } from './modules/useLogger.js';
import { useQueue } from './modules/useQueue.js';
import { usedStorages, useStorage } from './modules/useStorage.js';
import { Helper } from './helper/index.js';
import { Data } from './data/index.js';
import { useComms, usedComms } from './modules/useComms.js';

export const USE_SE_API: Promise<StreamElements.SE_API> =
  typeof SE_API !== 'undefined' ? Promise.resolve(SE_API) : Promise.resolve(initializeLocalSEAPI());

export const logger = new useLogger();

export const main = {
  SeAPI: USE_SE_API,

  Client,
  Helper,
  Local,
  Data,
  logger,

  modules: { EventProvider, useStorage, useQueue, useLogger, useComms },
  actions: { Button, Command },
  multistream: { useComfyJs },
  data: { usedStorages, usedComms },
  pronouns: { Alejo },
};

if (typeof window !== 'undefined') {
  (window as any).Tixyel = main;
} else {
  (globalThis as any).Tixyel = main;
}
