import { Button } from '../actions/button.js';
import { Command } from '../actions/command.js';
import { EventProvider } from '../modules/EventProvider.js';
import { useStorage } from '../modules/useStorage.js';
import { ClientEventTuple, Provider } from '../types/client.js';
import { StreamElements } from '../types/streamelements/main.js';
import { Alejo } from '../utils/alejo.js';

type ClientMapEvents<CustomEvents = {}> = {
  load: [event: StreamElements.Event.onWidgetLoad];
  action: [action: Button | Command, type: 'created' | 'executed' | 'removed'];
  session: [session: StreamElements.Session.Data];
  event: ClientEventTuple<CustomEvents>;
};

export type ClientStorageOptions<T> = {
  value: T;
  timestamp: number;
  expire: number;
};

export type ClientStorage = {
  user: Record<string, ClientStorageOptions<string>>;
  avatar: Record<string, ClientStorageOptions<string>>;
  pronoun: Record<string, ClientStorageOptions<Alejo.Pronouns.name>>;
  emote: Record<string, ClientStorageOptions<string>>;
};

export type ClientOptions = {
  id?: string;
  debug?: boolean | (() => boolean);
};

export class Client<CustomEvents = {}> extends EventProvider<ClientMapEvents<CustomEvents>> {
  public id: string = 'default';
  public debug: boolean = false;

  public storage!: useStorage<ClientStorage>;

  public fields: StreamElements.Event.onWidgetLoad['fieldData'] = {};

  public session!: StreamElements.Session.Data;

  public loaded: boolean = false;

  constructor(options: ClientOptions) {
    super();

    this.id = options.id || this.id;

    this.storage = new useStorage<ClientStorage>({
      id: this.id,
      data: {
        user: {},
        avatar: {},
        pronoun: {},
        emote: {},
      },
    });

    this.on('load', () => {
      this.debug = Boolean(typeof options.debug === 'function' ? options.debug() : options.debug);
    });

    (window as any).client = this;
  }

  public actions: {
    commands: Command[];
    buttons: Button[];
  } = {
    commands: [],
    buttons: [],
  };

  public details!: {
    provider: Provider | 'local';
    user: StreamElements.Event.onWidgetLoad['channel'];
    currency: StreamElements.Event.onWidgetLoad['currency'];
    overlay: StreamElements.Event.onWidgetLoad['overlay'];
  };

  public cache: {
    /**
     * Avatar cache duration in minutes.
     */
    avatar: number;
    /**
     * Pronoun cache duration in minutes.
     */
    pronoun: number;
    /**
     * Emote cache duration in minutes.
     */
    emote: number;
  } = {
    avatar: 30,
    pronoun: 60,
    emote: 120,
  };

  override on<K extends keyof ClientMapEvents<CustomEvents>>(
    eventName: K,
    callback: (this: Client<CustomEvents>, ...args: ClientMapEvents<CustomEvents>[K]) => void,
  ): this {
    if (eventName === 'load' && this.loaded) {
      callback.apply(this, [
        {
          channel: this.details.user,
          currency: this.details.currency,
          fieldData: this.fields,
          recents: [],
          session: {
            data: this.session,
            settings: {
              autoReset: false,
              calendar: false,
              resetOnStart: false,
            },
          },
          overlay: this.details.overlay,
          emulated: false,
        } as StreamElements.Event.onWidgetLoad,
      ] as unknown as ClientMapEvents<CustomEvents>[K]);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
