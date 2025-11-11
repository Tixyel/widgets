import { StreamElementsFieldValue } from '../customfields.js';
import { Session } from '../session.js';

export type onWidgetLoadEvent = CustomEvent<onWidgetLoad>;

export type onWidgetLoad = {
  channel: {
    username: string;
    /**
     * The channel's streamelements api token (used to authenticate requests to the SE API)
     */
    apiToken: string;
    /**
     * The channel's unique identifier in the SE system
     */
    id: string;
    /**
     * The channel's unique identifier from the provider (e.g. Twitch user ID)
     */
    providerId: string;
    avatar: string;
  };
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  fieldData: Record<string, StreamElementsFieldValue>;
  recents: Array<Object>;
  session: {
    data: Session;
    settings: {
      autoReset: boolean;
      calendar: boolean;
      resetOnStart: boolean;
    };
  };
  overlay: {
    /**
     * Whether the overlay is being viewed in the editor mode (in the SE dashboard) or live (on stream)
     */
    isEditorMode: boolean;
    /**
     * Whether the overlay is muted or not
     */
    muted: boolean;
  };
  emulated?: boolean;
};
