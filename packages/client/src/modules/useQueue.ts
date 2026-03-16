import { Client } from '../client/client.js';
import { logger } from '../main.js';
import { EventProvider } from './EventProvider.js';

type QueueEvents<T> = {
  load: [];
  cancel: [];
  update: [
    queue: QueueItem<T>[],
    priorityQueue: QueueItem<T>[],
    history: QueueItem<T>[],
    timeouts: Array<ReturnType<typeof setTimeout>>,
  ];
  process: [item: QueueItem<T>, queue: useQueue<T>];
};

type QueueProps = {
  isoDate: string;
  isLoop: boolean;
  isPriority: boolean;
  isImmediate: boolean;
};

type QueueItem<T> = { value: T } & QueueProps;

type QueueProcessor<T> = (this: useQueue<T>, item: T, queue: useQueue<T>) => Promise<any>;

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
 *   processor: async function (item) {
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

  private readonly clientWaitRetryDelay = 50;

  constructor(options: QueueOptions<T>) {
    super();

    if (!options.processor || typeof options.processor !== 'function') {
      throw new Error('A valid processor function must be provided to useQueue.');
    }

    this.processor = options.processor;

    if (options.duration !== 'client') this.duration = options.duration ?? 0;

    this.waitForClientAndBindLoad(options.duration);
  }

  private waitForClientAndBindLoad(
    duration: QueueDuration | 'client' = this.duration,
    callback?: () => void,
  ) {
    if (!(window?.client instanceof Client)) {
      setTimeout(
        () => this.waitForClientAndBindLoad(duration, callback),
        this.clientWaitRetryDelay,
      );

      return;
    }

    window.client.on('load', () => {
      if (duration === 'client')
        this.duration = (window?.client?.fields?.widgetDuration ?? 0) as number;

      this.emit('load');

      this.loaded = true;
      if (callback) callback();
    });
  }

  /**
   * Enqueue an item or multiple items into the queue with optional processing options.
   * @param value - The item or items to be enqueued. Can be a single value of type T or an array of objects containing the value and options.
   * @param options - Optional processing options for the item(s) being enqueued. Ignored if an array of items is provided, as each item can have its own options.
   * @returns The instance of the queue for chaining.
   * @example
   * ```javascript
   * myQueue.enqueue('Single Item', { isPriority: true });
   * myQueue.enqueue([
   *   { value: 'Item 1', options: { isPriority: true } },
   *   { value: 'Item 2', options: { isLoop: true } }
   * ]);
   * ```
   */
  public enqueue(value: T, options?: Partial<QueueProps>): this;
  public enqueue(items: { value: T; options?: Partial<QueueProps> }[]): this;
  public enqueue(
    valueOrItems: T | { value: T; options?: Partial<QueueProps> }[],
    options: Partial<QueueProps> = {},
  ): this {
    const hadItems = this.hasItems();

    const entries: { value: T; options: Partial<QueueProps> }[] = Array.isArray(valueOrItems)
      ? valueOrItems.map((entry) => ({ value: entry.value, options: entry.options ?? {} }))
      : [{ value: valueOrItems as T, options }];

    for (const entry of entries) {
      const item: QueueItem<T> = {
        isoDate: new Date().toISOString(),
        isLoop: entry.options?.isLoop ?? false,
        isPriority: entry.options?.isPriority ?? false,
        isImmediate: entry.options?.isImmediate ?? false,
        value: entry.value,
      };

      if (item.isPriority && item.isImmediate) {
        this.cancel();
        this.priorityQueue.unshift(item);
      } else {
        const targetQueue = item.isPriority ? this.priorityQueue : this.queue;

        targetQueue.push(item);
      }
    }

    // Always process immediately if it's not running and the queue was empty before
    if (this.running === false && hadItems === false) {
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
    const nextItem =
      this.priorityQueue.length > 0 ? this.priorityQueue.shift() : this.queue.shift();

    if (!nextItem) {
      this.running = false;

      return;
    }

    try {
      await this.processor.apply(this, [nextItem.value, this]);

      this.emit('process', nextItem, this);
    } catch (error) {
      logger.error(
        `Error during item processing: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    this.history.push(nextItem);

    const targetQueue = nextItem.isPriority ? this.priorityQueue : this.queue;

    if (nextItem.isLoop) targetQueue.push(nextItem);
  }

  /**
   * Resume processing the queue if it is paused. If the queue is already running, it will be restarted, which can be useful if new items have been added or if you want to reset the processing timer.
   * If the queue was empty before, it will start processing immediately.
   * @returns - The instance of the queue for chaining.
   * @example
   * ```javascript
   * myQueue.resume();
   * ```
   */
  public resume() {
    if (this.running) {
      this.cancel();
    }

    if (this.hasItems()) this.run();

    return this;
  }

  /**
   * Update the queue's state with new values. This can be used to replace the current queue, priority queue, history, or timeouts with new data. If the queue is not currently running and there are items in the queue after the update, it will start processing immediately.
   * @param save - An object containing the new state for the queue, priority queue, history, and timeouts. Each property is optional, and if not provided, the current state will be retained.
   * @returns - The instance of the queue for chaining.
   * @example
   * ```javascript
   * myQueue.update({
   *   queue: newQueueItems,
   *   priorityQueue: newPriorityItems,
   *   history: newHistory,
   * });
   * ```
   */
  public update(save: Partial<useQueue<T>>): this {
    this.queue = save.queue ?? this.queue;
    this.priorityQueue = save.priorityQueue ?? this.priorityQueue;
    this.history = save.history ?? this.history;

    if (this.hasItems() && this.running === false) {
      window.client?.on('load', () => this.run());
    }

    return this;
  }

  /**
   * Cancel all pending timeouts and stop the queue from processing further items. This will clear any scheduled processing and prevent any new items from being processed until `resume()` is called again. The current state of the queue, priority queue, and history will be retained, allowing you to resume processing later without losing any data.
   */
  public cancel() {
    if (this.running) {
      this.timeouts.forEach((timeout) => clearTimeout(timeout));
      this.timeouts = [];
      this.running = false;

      this.emit('cancel');
    }
  }

  /**
   * Check if there are any items in the queue or priority queue. This method returns `true` if there are items waiting to be processed in either the main queue or the priority queue, and `false` if both queues are empty.
   * @returns - A boolean indicating whether there are items in the queue or priority queue.
   */
  public hasItems(): boolean {
    return this.queue.length > 0 || this.priorityQueue.length > 0;
  }

  public override on<K extends keyof QueueEvents<T>>(
    eventName: K,
    callback: (this: useQueue<T>, ...args: QueueEvents<T>[K]) => void,
  ): this {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
