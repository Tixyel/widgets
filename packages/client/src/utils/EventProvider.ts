/**
 * EventProvider class for managing event listeners and emitters.
 * This class allows you to register event listeners, emit events, and manage event subscriptions.
 * @example
 * ```typescript
 * interface TestEvents {
 *   load: [{ type: 'load' }];
 *   event: [{ type: 'event' }];
 * }
 *
 * class Test extends EventProvider<TestEvents> {}
 *
 * const test = new Test();
 * test.on('load', (data) => {})
 * test.once('event', (data) => {})
 * test.emit('load', { type: 'load' });
 * ```
 */
export class EventProvider<EventMap extends Record<string, any[]> = Record<string, any[]>> {
  /**
   * Stores registered event listeners.
   */
  private registeredEvents: { [K in keyof EventMap]?: Array<(this: this, ...args: EventMap[K]) => any> } = {};

  /**
   * Emits an event to all registered listeners.
   * Returns an array of return values from the listeners.
   * @param eventName The name of the event.
   * @param args Arguments to pass to the listeners.
   */
  emit<K extends keyof EventMap>(eventName: K, ...args: EventMap[K]): any[] {
    const listeners = this.registeredEvents[eventName] || [];

    return listeners.map((listener) => listener.apply(this, args));
  }

  /**
   * Registers an event listener.
   * @param eventName The name of the event.
   * @param callback The callback function.
   */
  on<K extends keyof EventMap>(eventName: K, callback: (this: this, ...args: EventMap[K]) => any): this {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.registeredEvents[eventName]) {
      this.registeredEvents[eventName] = [];
    }

    this.registeredEvents[eventName]!.push(callback);

    return this;
  }

  /**
   * Removes a specific event listener.
   * @param eventName The name of the event.
   * @param callback The callback function to remove.
   */
  off<K extends keyof EventMap>(eventName: K, callback?: (this: this, ...args: EventMap[K]) => any): this {
    const listeners = this.registeredEvents[eventName] || [];

    if (!callback) {
      this.registeredEvents[eventName] = [];

      return this;
    }

    this.registeredEvents[eventName] = listeners.filter((fn) => fn !== callback);

    return this;
  }

  /**
   * Registers a listener that is executed only once.
   * @param eventName The name of the event.
   * @param callback The callback function.
   */
  once<K extends keyof EventMap>(eventName: K, callback: (this: this, ...args: EventMap[K]) => any): this {
    const wrapper = (...args: EventMap[K]) => {
      this.off(eventName, wrapper);
      callback.apply(this, args);
    };

    this.on(eventName, wrapper);

    return this;
  }

  /**
   * Removes all listeners for a specific event.
   * @param eventName The name of the event.
   */
  removeAllListeners<K extends keyof EventMap>(eventName: K): this {
    this.registeredEvents[eventName] = [];

    return this;
  }
}
