import './client/listener.js';
import { Button } from './actions/button.js';
import { Command } from './actions/command.js';
import { Client } from './client/client.js';
import { Data } from './data/index.js';
import { Helper } from './helper/index.js';
import * as internals from './internal.js';
import { Local } from './local/index.js';
import { EventProvider } from './modules/EventProvider.js';
import { FakeUserPool } from './modules/fakeUser.js';
import { USE_SE_API } from './modules/SE_API.js';
import { useComms } from './modules/useComms.js';
import { useLogger } from './modules/useLogger.js';
import { useQueue } from './modules/useQueue.js';
import { useStorage } from './modules/useStorage.js';
import { useComfyJs } from './multistream/comfyJs.js';
import { Alejo } from './utils/alejo.js';

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
    FakeUserPool,
  },
  actions: {
    Button,
    Command,
  },
  multistream: {
    useComfyJs,
  },
  internal: internals,
  pronouns: { Alejo },
};

if (typeof window !== 'undefined') {
  (window as any).Tixyel = main;
} else {
  (globalThis as any).Tixyel = main;
}
