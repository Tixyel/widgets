import { StreamElements } from '../types/streamelements/main.js';
import { EventProvider } from './EventProvider.js';
import { USE_SE_API } from '../main.js';
import { PathValue } from '../types/path.js';
import type { JSONObject } from '../types/json.js';

type UseStorageEvents<T> = {
  load: [T | null];
  update: [T];
};

type UseStorageOptions<T> = {
  id?: string;
  data: T;
};

export var usedStorages: Array<useStorage<any>> = [];

export class useStorage<T extends JSONObject> extends EventProvider<UseStorageEvents<T>> {
  /**
   * The unique identifier for the storage instance.
   */
  public id: string = 'default';

  public loaded: boolean = false;

  public data!: T;

  constructor(options: UseStorageOptions<T>) {
    super();

    this.id = options.id || this.id;
    this.data = options.data ?? ({} as T);

    usedStorages.push(this);

    this.start();
  }

  SE_API: StreamElements.SE_API | null = null;

  private start() {
    USE_SE_API?.then((se) => {
      this.SE_API = se;

      se!.store
        .get<T>(this.id)
        .then((save) => {
          this.data = save ?? this.data;

          this.loaded = true;

          this.emit('load', this.data);

          if (JSON.stringify(this.data) !== JSON.stringify(save)) {
            this.emit('update', this.data);
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
      if (JSON.stringify(this.data) !== JSON.stringify(data)) {
        this.data = data;

        this.SE_API.store.set<T>(this.id, this.data);

        this.emit('update', this.data);
      }
    }
  }

  /**
   * Updates the storage data and emits an update event
   * @param data Data to update (defaults to current)
   */
  public update(data: T = this.data): void {
    if (this.loaded && JSON.stringify(this.data) !== JSON.stringify(data)) {
      const newData = { ...this.data, ...data };

      this.save(newData);
    }
  }

  /**
   * Adds a value to the storage at the specified path.
   * @param path Path to add the value to
   * @param value Value to add
   */
  public add<P extends string>(path: P, value: PathValue<T, P>): void {
    if (!this.loaded) return;

    useStorage.setByPath(this.data, path, value);

    this.save(this.data);
  }

  /**
   * Clears all data from the storage.
   */
  public clear(): void {
    if (this.loaded) {
      this.data = {} as T;

      this.save(this.data);
    }
  }

  /**
   * Sets a value in the storage at the specified path.
   * @param obj The object to set the value in
   * @param path The path to set the value at
   * @param value The value to set
   * @returns The updated object
   */
  static setByPath<P extends string, T extends object>(obj: T, path: P, value: PathValue<T, P>): void {
    const keys = path.split('.');
    let current: any = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof current[keys[i]] !== 'object' || current[keys[i]] == null) {
        current[keys[i]] = {};
      }

      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;

    return current;
  }

  public override on<K extends keyof UseStorageEvents<T>>(eventName: K, callback: (this: useStorage<T>, ...args: UseStorageEvents<T>[K]) => void): this {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this, [this.data]);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
