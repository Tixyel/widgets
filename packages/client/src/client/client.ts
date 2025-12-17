import { ClientEvents as events, Provider } from '../types/client.js';
import { StreamElements } from '../types/streamelements/main.js';
import { EventProvider } from '../utils/EventProvider.js';
import { useStorage } from '../utils/useStorage.js';
import { Command } from '../actions/command.js';
import { Button } from '../actions/button.js';
import { Alejo } from '../types/alejo.js';

type ClientEvents = {
  load: [event: StreamElements.Event.onWidgetLoad];
  action: [action: Button | Command, type: 'created' | 'executed' | 'removed'];
  session: [session: StreamElements.Session.Data];
  event:
    | [provider: 'streamelements', event: StreamElements.Event.Provider.StreamElements.Events]
    | [provider: 'twitch', event: StreamElements.Event.Provider.Twitch.Events]
    | [provider: 'youtube', event: StreamElements.Event.Provider.YouTube.Events]
    | [provider: 'kick', event: StreamElements.Event.Provider.Kick.Events]
    | [provider: 'facebook', event: StreamElements.Event.Provider.Facebook.Events];
};

export type ClientStorageOptions<T> = {
  value: T;
  timestamp: number;
  expire: number;
};

type ClientStorage = {
  user: Record<string, ClientStorageOptions<string>>;
  avatar: Record<string, ClientStorageOptions<string>>;
  pronoun: Record<string, ClientStorageOptions<Alejo.Pronouns.name>>;
  emote: Record<string, ClientStorageOptions<string>>;
};

type ClientOptions = {
  id?: string;
};

export class Client extends EventProvider<ClientEvents> {
  public id: string = 'default';

  public storage!: useStorage<ClientStorage>;

  public fields: StreamElements.Event.onWidgetLoad['fieldData'] = {};

  public session!: StreamElements.Session.Data;

  public loaded: boolean = false;

  constructor(options: ClientOptions) {
    super();

    this.id = options.id || this.id;

    this.storage = new useStorage({
      id: this.id,
      data: {
        user: {},
        avatar: {},
        pronoun: {},
        emote: {},
      },
    });

    window.client = this;
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

  public cache: { avatar: number; pronoun: number; emote: number } = {
    avatar: 30,
    pronoun: 30,
    emote: 30,
  };

  override on<K extends keyof ClientEvents>(eventName: K, callback: (this: Client, ...args: ClientEvents[K]) => void): this {
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
      ] as unknown as ClientEvents[K]);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
