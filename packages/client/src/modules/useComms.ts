import { usedComms } from '../internal.js';
import { USE_SE_API } from '../main.js';
import { StreamElements } from '../types/index.js';
import { EventProvider } from './EventProvider.js';

type MessageMap = Record<string, any>;

type MessageTuple<T extends MessageMap> = {
  [K in keyof T]: [key: K, data: T[K]];
}[keyof T];

type BaseEvents<T extends MessageMap> = {
  load: [];
  message: MessageTuple<T>;
};

type UseCommsOptions = {
  id?: string;
};

type UseCommItem<T extends MessageMap> = {
  nonce: string;
  key: keyof T;
  value: T[keyof T];
  timestamp: string;
};

/**
 * A module for handling communications between different widgets inside streamelements.
 * @example
 * ```ts
 * type CommsMessages = {
 *   hello: { loaded: boolean };
 *   update: { value: number };
 *   reload: {};
 *   tags: string[];
 * }
 *
 * const comms = new useComms<CommsMessages>();
 *
 * comms.on('message', (message, data) => {
 *   switch (message) {
 *     case 'hello': {}
 *     case 'update': {}
 *     case 'reload': {}
 *     case 'tags': {}
 *   }
 * })
 * ```
 */
export class useComms<T extends MessageMap> extends EventProvider<BaseEvents<T>> {
  private SE_API: StreamElements.SE_API | null = null;

  public id: string = 'widget communications';
  public loaded: boolean = false;

  public history: Array<UseCommItem<T>> = [];
  public detected = new Set<string>();

  constructor(options: UseCommsOptions = {}) {
    super();

    this.id = options.id || this.id;

    usedComms.push(this);

    USE_SE_API?.then(async (se) => {
      this.loaded = true;
      this.SE_API = se;

      Promise.all([
        async () => {
          const history = await se.store.get<Array<UseCommItem<T>>>(this.id);

          if (history) {
            this.history = history.slice(-10);
          }
        },
        async () => {
          const detected = await se.store.get<string[]>(this.id + '_detected');

          if (detected) {
            this.detected = new Set(detected);
          }
        },
      ]);
    });
  }

  public async send<K extends keyof T>(key: K, data: T[K]) {
    if (this.SE_API) {
      //   this.SE_API.store.set(this.id, { message: key, data });

      const message = {
        nonce: Math.random().toString(36).substring(2),
        key,
        value: data,
        timestamp: new Date().toISOString(),
      };

      this.history.push(message);

      this.SE_API.store.set(this.id, this.history);
      this.SE_API.store.set(this.id + '_detected', Array.from(this.detected));
    }
  }

  public update(history: Array<UseCommItem<T>>) {
    if (!history.length) {
      return;
    }

    this.history = history;

    const messages = history.filter((message) => !this.detected.has(message.nonce));

    messages.forEach((message) => {
      this.detected.add(message.nonce);

      this.emit('message', message.key, message.value);
    });
  }

  public override on<K extends keyof BaseEvents<T>>(
    eventName: K,
    callback: (this: useComms<T>, ...args: BaseEvents<T>[K]) => void,
  ) {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
