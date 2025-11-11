const SE_API = {
  getOverlayStatus: async () => {
    return {
      isEditorMode: false,
      muted: false,
    };
  },
  resumeQueue: () => queue && queue?.resume(),

  store: {
    set: function (name, obj) {
      this.list[name] = obj;

      localStorage.setItem('SE_API-STORE', JSON.stringify(SE_API.store.list));
    },
    get: async function (name) {
      if (this.list[name]) return this.list[name];
      else return null;
    },
    list: {},
  },
};

let lastStore = localStorage.getItem('SE_API-STORE') || '';
lastStore = lastStore ? JSON.parse(lastStore) : {};

SE_API.store.list = lastStore;
