import { EventProvider } from './EventProvider.js';
import { PathValue } from './index.js';

type UseStorageEvents<T> = {
  load: [T | null];
  save: [T];
};

type UseStorageOptions<T> = {
  id?: string;
  data: T;
};

export class useStorage<T extends object = Record<string, any>> extends EventProvider<UseStorageEvents<T>> {
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

    if (!SE_API || !SE_API.store) throw new Error('SE_API.store is not available');

    SE_API!.store
      .get<T>(this.id)
      .then((save) => {
        this.data = save ?? this.data;

        this.loaded = true;

        this.emit('load', this.data);
      })
      .catch(() => {
        this.loaded = true;
        this.emit('load', null);
      });
  }

  /**
   * Saves the current data to storage.
   * @param data Data to save (defaults to current)
   */
  save(data: T = this.data): void {
    if (this.loaded) {
      this.data = data;

      SE_API!.store.set<T>(this.id, this.data);

      this.emit('save', this.data);
    }
  }

  add<P extends string>(path: P, value: PathValue<T, P>): void {
    if (!this.loaded) return;

    this.setByPath(this.data, path, value);

    this.save(this.data);
  }

  setByPath<P extends string>(obj: T, path: P, value: PathValue<T, P>): void {
    const keys = path.split('.');
    let current: any = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof current[keys[i]] !== 'object' || current[keys[i]] == null) {
        current[keys[i]] = {};
      }

      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  override on<K extends keyof UseStorageEvents<T>>(eventName: K, callback: (...args: UseStorageEvents<T>[K]) => void): this {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this, [this.data]);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
