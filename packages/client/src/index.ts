import { ComfyJSInstance } from 'comfy.js';
import { StreamElements } from './types.js';
import { main } from './main.js';

export type * from './types.ts';

declare global {
  interface Window {
    Tixyel: typeof main;
    client: InstanceType<typeof main.Client> | undefined;
    ComfyJS?: ComfyJSInstance;
  }

  interface WindowEventMap {
    onWidgetLoad: CustomEvent<StreamElements.Event.onWidgetLoad>;
    onSessionUpdate: CustomEvent<StreamElements.Event.onSessionUpdate>;
    onEventReceived: CustomEvent<StreamElements.Event.onEventReceived>;
  }

  const Tixyel: typeof main;
  let client: InstanceType<typeof main.Client> | undefined;

  const SE_API: StreamElements.SE_API;
}

export default main;
