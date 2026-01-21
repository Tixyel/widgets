import { EventProvider } from './EventProvider.js';
import { Client } from '../client/client.js';
import { logger } from '../main.js';

type QueueEvents<T> = {
  load: [];
  cancel: [];
  update: [queue: QueueItem<T>[], priorityQueue: QueueItem<T>[], history: QueueItem<T>[], timeouts: Array<ReturnType<typeof setTimeout>>];
  process: [item: QueueItem<T>, queue: useQueue<T>];
};

type QueueProps = {
  isoDate: string;
  isLoop: boolean;
  isPriority: boolean;
  isImmediate: boolean;
};

type QueueItem<T> = { value: T } & QueueProps;

type QueueProcessor<T> = (item: T, queue: useQueue<T>) => Promise<any>;

type QueueDuration = number | boolean | undefined;

interface QueueOptions<T> {
  /**
   * Duration between processing each item in milliseconds. Set to `0` or `false` for immediate processing.
   */
  duration?: QueueDuration | 'client';
  /**
   * Function to process each item in the queue.
   */
  processor: QueueProcessor<T>;
}

/**
 * A utility class to manage a queue of items with support for priority, looping, and immediate processing.
 * @template T - The type of items in the queue.
 * @extends EventProvider<QueueEvents<T>>
 * @example
 * ```javascript
 * const myQueue = new useQueue({
 *   duration: 1000,
 *   processor: async (item) => {
 *    console.log('Processing item:', item);
 *  },
 * });
 *
 * myQueue.enqueue('Item 1');
 * myQueue.enqueue('Item 2', { isPriority: true });
 * ```
 */
export class useQueue<T> extends EventProvider<QueueEvents<T>> {
  queue: QueueItem<T>[] = [];
  priorityQueue: QueueItem<T>[] = [];
  history: QueueItem<T>[] = [];

  private timeouts: Array<ReturnType<typeof setTimeout>> = [];

  public running: boolean = false;

  public duration: QueueDuration = undefined;

  private loaded: boolean = false;

  public processor!: QueueProcessor<T>;

  constructor(options: QueueOptions<T>) {
    super();

    if (!(window.client instanceof Client)) {
      throw new Error('useQueue can only be instantiated after the Client is initialized.');
    }

    if (!options.processor || typeof options.processor !== 'function') {
      throw new Error('A valid processor function must be provided to useQueue.');
    }

    this.processor = options.processor;

    if (options.duration !== 'client') this.duration = options.duration ?? 0;

    window.client.on('load', () => {
      if (options.duration === 'client') this.duration = (window.client.fields?.widgetDuration ?? 0) as number;

      this.emit('load');

      this.loaded = true;
    });
  }

  public enqueue(value: T, options: Partial<QueueProps> = {}): this {
    const item: QueueItem<T> = {
      isoDate: new Date().toISOString(),
      isLoop: options?.isLoop ?? false,
      isPriority: options?.isPriority ?? false,
      isImmediate: options?.isImmediate ?? false,
      value,
    };

    const hasItems = this.hasItems();

    if (item.isPriority && item.isImmediate) {
      this.cancel();
      this.priorityQueue.unshift(item);
    } else {
      const targetQueue = item.isPriority ? this.priorityQueue : this.queue;

      targetQueue.push(item);
    }

    // Always process immediately if it's not running
    if (this.running === false && hasItems === false) {
      this.run();
    }

    this.emit('update', this.queue, this.priorityQueue, this.history, this.timeouts);

    return this;
  }

  private async run() {
    if (!this.hasItems()) {
      this.running = false;
      return;
    }

    this.running = true;

    await this.next();

    if (typeof this.duration === 'number' && this.duration > 0) {
      this.timeouts.push(setTimeout(() => this.run(), this.duration));
    } else if (this.duration === 0 || (this.duration !== -1 && this.duration !== false)) {
      this.run();
    }
  }

  private async next() {
    const nextItem = this.priorityQueue.length > 0 ? this.priorityQueue.shift() : this.queue.shift();

    if (!nextItem) {
      this.running = false;

      return;
    }

    try {
      await this.processor.apply(this, [nextItem.value, this]);

      this.emit('process', nextItem, this);
    } catch (error) {
      logger.error(`Error during item processing: ${error instanceof Error ? error.message : String(error)}`);
    }

    this.history.push(nextItem);

    const targetQueue = nextItem.isPriority ? this.priorityQueue : this.queue;

    if (nextItem.isLoop) targetQueue.push(nextItem);
  }

  public resume() {
    if (this.running) {
      this.cancel();
    }

    if (this.hasItems()) this.run();

    return this;
  }

  public update(save: Partial<useQueue<T>>): this {
    this.queue = save.queue ?? this.queue;
    this.priorityQueue = save.priorityQueue ?? this.priorityQueue;
    this.history = save.history ?? this.history;

    if (this.hasItems() && this.running === false) {
      window.client?.on('load', () => this.run());
    }

    return this;
  }

  public cancel() {
    if (this.running) {
      this.timeouts.forEach((timeout) => clearTimeout(timeout));
      this.timeouts = [];
      this.running = false;

      this.emit('cancel');
    }
  }

  public hasItems(): boolean {
    return this.queue.length > 0 || this.priorityQueue.length > 0;
  }

  public override on<K extends keyof QueueEvents<T>>(eventName: K, callback: (this: useQueue<T>, ...args: QueueEvents<T>[K]) => void): this {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
