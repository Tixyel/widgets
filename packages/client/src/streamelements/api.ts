import { usedClients } from '../internal.js';
import { localQueue } from '../local/queue.js';
import { maxEventHistory } from '../modules/SE_API.js';
import { useQueue } from '../modules/useQueue.js';
import { StreamElements } from '../types/streamelements/main.js';

export const LOCAL_SE_API: StreamElements.SE_API & {
  store: { list: Record<string, any> };
  events: { history: Array<{ detail: any; timestamp: number; origin?: string }> };
} = {
  responses: {} as Record<string, any>,

  sendMessage(message: string, data: Record<string, any> = {}) {
    return new Promise((resolve, reject) => {
      const response = 'resp_' + Math.random().toString(36).substring(2, 15);

      data.response = response;
      data.request = message;

      SE_API.responses[response] = { resolve, reject };

      parent?.postMessage(data, '*');
    });
  },

  counters: {
    get(key: string): number | null {
      return null;
    },
  },

  store: {
    set: function (name: string, obj: any) {
      this.list[name] = obj;

      localStorage.setItem('SE_API-STORE', JSON.stringify(LOCAL_SE_API.store.list));
    },
    get: async function (name: string) {
      if (this.list[name]) return this.list[name];
      else return null;
    },
    /** @private */
    list: {} as Record<string, any>,
  },

  resumeQueue: () => {
    try {
      if (localQueue instanceof useQueue) {
        localQueue?.resume();
      }
    } catch (error) {
      return { ok: false, error };
    }

    return { ok: true };
  },

  sanitize(message: string): string {
    return message;
  },

  cheerFilter(message: string): string {
    return message;
  },

  setField(key: string, value: string | number | boolean | undefined, reload: boolean) {},

  getOverlayStatus: () => {
    return {
      isEditorMode: false,
      muted: false,
    };
  },

  events: {
    /**
     * Emit a event for all widgets inside the same overlay. This is useful for communicating between widgets.
     * @param event - The name of the event to emit. This can be any string, but it's recommended to use a unique prefix to avoid conflicts with other widgets.
     * @param data - The data to send with the event. This can be any object.
     * @returns An object with an `ok` property indicating whether the event was emitted successfully.
     */
    emit<T extends Record<string, any>>(event: string, data: T) {
      const eventObj = {
        listener: event,
        event: data,
        result: undefined,
      };

      const customEvent = new CustomEvent('onEventReceived', { detail: eventObj });

      this.history.push({
        detail: eventObj,
        timestamp: customEvent.timeStamp,
        origin: usedClients?.[0]?.id,
      });

      localStorage.setItem('SE_API-EVENTS', JSON.stringify(this.history.slice(0, maxEventHistory)));

      return window.dispatchEvent(customEvent) ? { ok: true } : { ok: false };
    },
    /**
     * Broadcast a event to all widgets in all overlays. This is useful for communicating between different overlays.
     * @param event - The name of the event to broadcast. This can be any string, but it's recommended to use a unique prefix to avoid conflicts with other widgets.
     * @param data - The data to send with the event. This can be any object.
     * @returns An object with an `ok` property indicating whether the event was successfully broadcasted.
     */
    broadcast<T extends Record<string, any>>(event: string, data: T): { ok: boolean } {
      const eventObj = {
        listener: event,
        event: data,
        result: undefined,
      };

      const customEvent = new CustomEvent('onEventReceived', { detail: eventObj });

      this.history.push({
        detail: eventObj,
        timestamp: Date.now(),
        origin: usedClients?.[0]?.id,
      });

      localStorage.setItem('SE_API-EVENTS', JSON.stringify(this.history.slice(0, maxEventHistory)));

      return window.dispatchEvent(customEvent) ? { ok: true } : { ok: false };
    },

    history: [],
  },
};
