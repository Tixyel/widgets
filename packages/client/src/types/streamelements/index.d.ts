declare const SE_API: {
  responses: Record<string, any>;
  sendMessage: (message: string, data: object) => void;
  counters: {
    get: (key: string) => number | null;
  };
  store: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => void;
  };
  resumeQueue: () => void;
  sanitize: (message: string) => string;
  cheerFilter: (message: string) => string;
  setField: (key: string, value: string | number | boolean | undefined, reload: boolean) => void;
  getOverlayStatus: () => { isEditorMode: boolean; muted: boolean };
};
