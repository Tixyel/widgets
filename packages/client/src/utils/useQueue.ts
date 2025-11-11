import { Client } from '../client/index.js';
import { Tixyel } from '../index.js';
import { EventProvider } from './EventProvider.js';

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

interface QueueOptions<T> {
  duration: number | boolean | undefined;
  processor: QueueProcessor<T>;
}

export class useQueue<T> extends EventProvider<QueueEvents<T>> {
  queue: QueueItem<T>[] = [];
  priorityQueue: QueueItem<T>[] = [];
  history: QueueItem<T>[] = [];

  timeouts: Array<ReturnType<typeof setTimeout>> = [];

  running: boolean = false;
  duration: number | boolean | undefined = undefined;

  loaded: boolean = false;

  processor!: QueueProcessor<T>;

  constructor(options: QueueOptions<T>) {
    if (!(window.client instanceof Client)) return;

    super();

    this.duration = options.duration;
    this.processor = options.processor;

    window.client.on('load', () => {
      this.emit('load');

      this.loaded = true;
    });
  }

  enqueue(value: T, options: Partial<QueueProps> = {}): this {
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
    } else if (this.duration === 0 || this.duration === false) this.run();
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
      Tixyel.logger.error(`Error during item processing: ${error instanceof Error ? error.message : String(error)}`);
    }

    this.history.push(nextItem);

    const targetQueue = nextItem.isPriority ? this.priorityQueue : this.queue;

    if (nextItem.isLoop) targetQueue.push(nextItem);
  }

  public resume() {
    this.cancel();

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
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];
    this.running = false;

    this.emit('cancel');
  }

  public hasItems(): boolean {
    return this.queue.length > 0 || this.priorityQueue.length > 0;
  }
}
