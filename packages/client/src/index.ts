import { main } from './main.js';

import type { ComfyJSInstance } from 'comfy.js';
import type { StreamElements } from './types/index.js';

export type { Button } from './actions/button.js';
export type { useLogger } from './utils/Logger.js';
export type { Command } from './actions/command.js';
export type { useQueue } from './utils/useQueue.js';
export type { useStorage } from './utils/useStorage.js';
export type { useComfyJs } from './multistream/comfyJs.js';
export type { EventProvider } from './utils/EventProvider.js';

export type * from './types/index.js';
export type * from './utils/alejo.js';

declare global {
  interface Window {
    Tixyel: typeof main;
    client: InstanceType<typeof main.Client>;
    ComfyJS?: ComfyJSInstance;
  }

  interface WindowEventMap {
    onWidgetLoad: CustomEvent<StreamElements.Event.onWidgetLoad>;
    onSessionUpdate: CustomEvent<StreamElements.Event.onSessionUpdate>;
    onEventReceived: CustomEvent<StreamElements.Event.onEventReceived>;
  }

  const Tixyel: typeof main;
  let client: InstanceType<typeof main.Client>;

  const SE_API: StreamElements.SE_API;
}

export default main;
