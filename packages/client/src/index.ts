import { ComfyJSInstance } from 'comfy.js';

import { main } from './main.js';
import { StreamElements } from './types.js';

export type * from './types.ts';

declare global {
  interface Window {
    Tixyel: typeof main;
    ComfyJS?: ComfyJSInstance;
  }

  interface WindowEventMap {
    onWidgetLoad: CustomEvent<StreamElements.Event.onWidgetLoad>;
    onSessionUpdate: CustomEvent<StreamElements.Event.onSessionUpdate>;
    onEventReceived: CustomEvent<StreamElements.Event.onEventReceived>;
  }

  const Tixyel: typeof main;
  const SE_API: StreamElements.SE_API;
}

export default main;
