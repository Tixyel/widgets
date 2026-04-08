import type { JSONObject } from '../types/json.js';
import type { PathValue } from '../types/path.js';
import type { StreamElements } from '../types/streamelements/main.js';

import { ObjectHelper } from '../helper/classes/object.js';
import { usedStorages } from '../internal.js';
import { EventProvider } from './EventProvider.js';
import { USE_SE_API } from './SE_API.js';

type UseStorageEvents<T> = {
  load: [T];
  update: [T, from: string];
  save: [T];
};

type UseStorageOptions<T> = {
  /** The unique identifier for the storage instance. */
  id?: string;
  data: T;
};

export class useStorage<T extends JSONObject> extends EventProvider<UseStorageEvents<T>> {
  private SE_API: StreamElements.SE_API | null = null;

  /** The unique identifier for the storage instance. */
  public id: string = 'default';
  public loaded: boolean = false;

  private initial!: T;
  public data!: T;

  constructor(options: UseStorageOptions<T>) {
    super();

    this.id = options.id || this.id;
    this.data = options.data || ({} as T);
    this.initial = structuredClone(this.data);

    usedStorages.push(this);

    USE_SE_API?.then((se) => {
      this.SE_API = se;

      se!.store
        .get<T>(this.id)
        .then((save) => {
          this.data = save || this.data;

          this.loaded = true;

          this.emit('load', this.data);

          if (JSON.stringify(this.data) !== JSON.stringify(save)) {
            this.emit('update', this.data, 'internal');
          }
        })
        .catch(() => {
          this.loaded = true;

          this.emit('load', this.data);
        });
    });
  }

  /**
   * Saves the current data to storage.
   * @param data Data to save (defaults to current)
   */
  private save(data: T = this.data): void {
    if (this.loaded && this.SE_API) {
      if (new ObjectHelper().isDiff(this.data, data)) {
        this.data = data;

        this.SE_API.store.set<T>(this.id, this.data);

        this.emit('save', this.data);
      }
    } else {
      throw new Error('Storage not loaded yet');
    }
  }

  /**
   * Updates the storage data and emits an update event
   * @param data Data to update (defaults to current)
   */
  public update(data: Partial<T> = this.data): void {
    if (this.loaded && new ObjectHelper().isDiff(this.data, data)) {
      const newData = { ...this.data, ...data };

      this.save(newData);

      this.emit('update', newData, 'internal:update');
    } else {
      throw new Error('Storage not loaded yet or data is the same as current');
    }
  }

  /**
   * Adds a value to the storage at the specified path.
   * @param path Path to add the value to
   * @param value Value to add
   */
  public add<P extends string>(path: P, value: PathValue<T, P>): void {
    if (!this.loaded) {
      throw new Error('Storage not loaded yet');
    }

    let newData = structuredClone(this.data);

    newData = new ObjectHelper().updateViaPath(newData, path, value);

    this.save(newData);

    this.emit('update', newData, 'internal:add');
  }

  /**
   * Clears all data from the storage.
   */
  public clear(): void {
    if (this.loaded) {
      this.save(this.initial);

      this.emit('update', this.data, 'internal:clear');
    } else {
      throw new Error('Storage not loaded yet');
    }
  }

  public override on<K extends keyof UseStorageEvents<T>>(
    eventName: K,
    callback: (this: useStorage<T>, ...args: UseStorageEvents<T>[K]) => void,
  ): this {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this, [this.data] as UseStorageEvents<T>[K]);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
