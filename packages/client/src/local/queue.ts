import { Helper } from '../helper/index.js';
import { usedClients } from '../internal.js';
import { useQueue } from '../modules/useQueue.js';
import { StreamElements } from '../types.js';
import { generate } from './generator.js';

export type localQueueItem =
  | { listener: 'onEventReceived'; data: StreamElements.Event.onEventReceived; session?: boolean }
  | { listener: 'onWidgetLoad'; data: StreamElements.Event.onWidgetLoad }
  | { listener: 'onSessionUpdate'; data: StreamElements.Event.onSessionUpdate };

/**
 * Processes local emulator events one at a time.
 * Each event is dispatched on `window`, and session-aware
 * `onEventReceived` events also emit an `onSessionUpdate`.
 */
export const localQueue = new useQueue<localQueueItem>({
  duration: 'client',
  processor: async function processor(received) {
    window.dispatchEvent(new CustomEvent(received.listener, { detail: received.data }));

    if (received.listener === 'onEventReceived' && received.session) {
      const sessionEvent = await generate.event.onSessionUpdate(
        usedClients?.[0] ? usedClients[0].session : undefined,
        Helper.event.parseProvider(received.data),
      );

      window.dispatchEvent(new CustomEvent('onSessionUpdate', { detail: sessionEvent }));
    }
  },
});
