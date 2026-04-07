function bindEvent(element, eventName, eventHandler) {
  if (element.addEventListener) {
    element.addEventListener(eventName, eventHandler, false);
  } else if (element.attachEvent) {
    element.attachEvent('on' + eventName, eventHandler);
  }
}

bindEvent(window, 'message', function (event) {
  const data = event.data;
  if (data.listener && SE_API.responses[data.listener]) {
    if (data.error) {
      SE_API.responses[data.listener].reject(data.error);
    } else {
      SE_API.responses[data.listener].resolve(data.result);
    }
    return;
  }

  if (data.listener && data.listener.indexOf('resp_') === 0) {
    return;
  }

  const session = data.session;
  delete data.session;

  const e = new CustomEvent('onEventReceived', {
    detail: data,
  });
  window.dispatchEvent(e);

  if (session) {
    const sessionEvent = new CustomEvent('onSessionUpdate', {
      detail: {
        session: session,
      },
    });
    window.dispatchEvent(sessionEvent);
  }
});

window.addEventListener('load', function (event) {
  const initData = `{}`;

  const e = new CustomEvent('onWidgetLoad', {
    detail: JSON.parse(initData),
  });

  window.dispatchEvent(e);
});

const SE_API = {
  responses: {},
  sendMessage: (message, data = {}) => {
    return new Promise((resolve, reject) => {
      const response = 'resp_' + Math.random().toString(16).substr(2);
      data.response = response;
      data.request = message;
      SE_API.responses[response] = { resolve, reject };
      parent.postMessage(data, '*');
    });
  },
  counters: {
    get: (key) => {
      return SE_API.sendMessage('counter_get', { key });
    },
  },
  store: {
    get: (key) => {
      return SE_API.sendMessage('store_get', { key });
    },
    set: (key, value) => {
      return SE_API.sendMessage('store_set', { key, value });
    },
  },
  resumeQueue: () => {
    return SE_API.sendMessage('resume_queue');
  },
  sanitize: (message) => {
    return SE_API.sendMessage('sanitize', { message });
  },
  cheerFilter: (message) => {
    return SE_API.sendMessage('cheer_filter', { message });
  },
  setField: (key, value, reload) => {
    return SE_API.sendMessage('set_field', { key, value, reload });
  },
  getOverlayStatus: () => {
    return SE_API.sendMessage('overlay_status');
  },
  events: {
    emit: (event, data = {}) => {
      return SE_API.sendMessage('overlay_emit', { event, data });
    },
    broadcast: (event, data = {}) => {
      return SE_API.sendMessage('overlay_broadcast', { event, data });
    },
  },
};

((window.onclick = function (o) {
  o.stopImmediatePropagation();
}),
  document.addEventListener('click', function (o) {
    (o.preventDefault(), o.stopPropagation(), o.stopImmediatePropagation());
  }),
  (window.open = function () {}));
var $_console$$ = console;
Object.defineProperty(window, 'console', {
  get: function () {
    if ($_console$$._commandLineAPI) throw ' ';
    return $_console$$;
  },
  set: function (o) {
    $_console$$ = o;
  },
});
