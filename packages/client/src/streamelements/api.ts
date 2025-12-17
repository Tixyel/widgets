import { StreamElements } from '../types/streamelements/main.js';

const LOCAL_SE_API: StreamElements.SE_API & { store: { list: Record<string, any> } } = {
  getOverlayStatus: () => {
    return {
      isEditorMode: false,
      muted: false,
    };
  },
  resumeQueue: () => {},
  responses: {} as Record<string, any>,
  sendMessage(message: string, data: object) {},
  counters: {
    get(key: string): number | null {
      return null;
    },
  },
  sanitize(message: string): string {
    return message;
  },
  cheerFilter(message: string): string {
    return message;
  },
  setField(key: string, value: string | number | boolean | undefined, reload: boolean) {},

  store: {
    set: function (name: string, obj: any) {
      this.list[name] = obj;

      localStorage.setItem('SE_API-STORE', JSON.stringify(LOCAL_SE_API.store.list));
    },
    get: async function (name: string) {
      if (this.list[name]) return this.list[name];
      else return null;
    },
    list: {} as Record<string, any>,
  },
};

export async function initializeLocalSEAPI() {
  let lastStore = localStorage.getItem('SE_API-STORE') ?? '';

  let result = lastStore ? JSON.parse(lastStore) : {};

  LOCAL_SE_API.store.list = result;

  return LOCAL_SE_API;
}
