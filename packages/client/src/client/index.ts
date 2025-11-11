import { onWidgetLoad } from '../types/streamelements/events/onWidgetLoad.js';
import { Alejo$Pronouns$name } from '../types/alejo/pronouns.js';
import { EventProvider } from '../utils/EventProvider.js';
import { useStorage } from '../utils/useStorage.js';
import { Session } from '../types/streamelements/session.js';
import { ClientEvents as events, Provider } from '../types/client.js';
import { Command } from '../actions/command.js';
import { Button } from '../actions/button.js';

type ClientEvents = {
  load: [event: onWidgetLoad];
  action: [action: any, type: 'created' | 'updated' | 'executed'];
  session: [session: Session];
  event: [event: events];
};

type ClientOptions = {
  id?: string;
};

type ClientStorageOptions<T> = {
  value: T;
  timestamp: number;
  expire: number;
};

type ClientStorage = {
  user: Record<string, ClientStorageOptions<string>>;
  avatar: Record<string, ClientStorageOptions<string>>;
  pronoun: Record<string, ClientStorageOptions<Alejo$Pronouns$name>>;
  emote: Record<string, ClientStorageOptions<string>>;
};

export class Client extends EventProvider<ClientEvents> {
  public id: string = 'default';

  public storage!: useStorage<ClientStorage>;

  public fields: onWidgetLoad['fieldData'] = {};

  public session!: Session;

  public loaded: boolean = false;

  constructor(options: ClientOptions) {
    super();

    this.id = options.id || this.id;

    window.client = this;

    this.storage = new useStorage({
      id: this.id,
      data: {
        user: {},
        avatar: {},
        pronoun: {},
        emote: {},
      },
    });
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
    user: onWidgetLoad['channel'];
    currency: onWidgetLoad['currency'];
    overlay: onWidgetLoad['overlay'];
  };

  public cache: { avatar: number; pronoun: number; emote: number } = {
    avatar: 30,
    pronoun: 30,
    emote: 30,
  };

  override on<K extends keyof ClientEvents>(eventName: K, callback: (...args: ClientEvents[K]) => void): this {
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
        } as onWidgetLoad,
      ] as unknown as ClientEvents[K]);

      return this;
    }

    super.on(eventName, callback);

    return this;
  }
}
