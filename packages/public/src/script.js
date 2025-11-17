const { logger, Client, Simulation } = Tixyel;
var main = document.querySelector('main');

const settings = {
  events: {
    streamelements: {
      'tip': {
        enabled: true,
      },
    },
    twitch: {
      'follower': {
        enabled: true,
      },
    },
  },
};

var rowId = 0;

new Client({
  id: 'example',
})
  .on('load', async (event) => {
    main = document.querySelector('main');
    event.channel;

    logger.received('Received load event\n', event);
    logger.received('Fields:\n', client.fields);
  })
  .on('event', (event) => {
    logger.received(`Received event from provider: ${event.provider}\n`, event.data);

    if (event.provider === 'twitch' && event.data.listener === 'message') {
      const _event = event.data.event;
      var role = _event.data.tags.badges.split(',')[0]?.replace('/1', '') ?? 'default';

      var message = generate.message(_event.data.displayName, _event.renderedText, role);

      var template = document.createElement('template');
      template.innerHTML = message.trim();

      var element = template.content.firstChild;

      addRow(element, {
        onAdd() {
          // Analyze message for emotes

          var emoteRegex = /<img[^>]*class="emote"[^>]*>/gi;
          var onlyEmote = _event.renderedText.replaceAll(emoteRegex, '', '').trim() === '' ? true : false;
          var emoteLength = (_event.renderedText.match(emoteRegex) || []).length;

          element.dataset['emoteonly'] = onlyEmote;
          element.dataset['emotelength'] = emoteLength;

          // Get element dimensions

          var height = element.offsetHeight;
          var width = element.offsetWidth;

          element.dataset.height = height;
          element.dataset.width = width;
          element.dataset.role = role;
          element.dataset.msgId = _event.data.msgId;
          element.dataset.userId = _event.data.userId;
        },
        onRemove() {},
      });
    }
  })
  .on('action', (action, type) => {
    action;
  })
  .on('session', (session) => {});

const generate = {
  /**
   * Generate a chat message element
   * @param {string} username
   * @param {string} message
   * @param {keyof badges} role
   * @returns {string} HTML element string
   */
  message(username, message, role) {
    var element = `
      <div class="row message">
        <div class="user">
          <span class="line left"></span>
          <span class="username">${username}</span>
          <span class="line right"></span>
        </div>
        <div class="message"><span class="text">${message}</span></div>
        <div class="divider">
          <span class="mini-star left"></span>
          <span class="star left"></span>
          <span class="badge">${badges[role] || badges['default']}</span>
          <span class="star right"></span>
          <span class="mini-star right"></span>
        </div>
      </div>
    `;

    return element;
  },
};

const animate = {
  in(element, margin = 10) {
    var height = element.offsetHeight;

    return window.Motion.animate(
      element,
      {
        'margin-bottom': [-height + 'px', margin + 'px'],
        'opacity': [0, 1],
      },
      {
        duration: 1,
        ease: 'easeInOut',
      },
    );
  },
  out(element, margin = 10) {
    var height = element.offsetHeight;

    element.dataset.removing = true;

    return window.Motion.animate(
      element,
      {
        'margin-bottom': height * 0.5 + 'px',
        'opacity': [1, 0],
      },
      {
        duration: 1,
        ease: 'easeInOut',
      },
    );
  },
};

const badges = {
  default: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M12.207 2.875A3.732 3.732 0 0 0 9 4.799a3.732 3.732 0 0 0-3.207-1.924 3.965 3.965 0 0 0-3.79 4.11c0 2.652 2.79 5.548 5.131 7.511a2.9 2.9 0 0 0 3.732 0c2.34-1.963 5.131-4.859 5.131-7.51a3.965 3.965 0 0 0-3.79-4.111Z"/></svg>`,
  broadcaster: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M3.75 4A1.75 1.75 0 0 0 2 5.75v6.5c0 .966.784 1.75 1.75 1.75h6.5A1.75 1.75 0 0 0 12 12.25v-1.375L16 13V5l-4 2.125V5.75A1.75 1.75 0 0 0 10.25 4h-6.5Z"/></svg>`,
  moderator: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 15.5 2.5 14l2-2L2 9.5 3.5 8 6 10.5 11 2h5v5l-8.5 5 2.5 2.5L8.5 16 6 13.5l-2 2Z"/></svg>`,
  subscriber: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M8.517 1.908a.5.5 0 0 1 .896 0l1.955 3.961a.25.25 0 0 0 .188.137l4.372.635a.5.5 0 0 1 .277.853l-3.163 3.083a.25.25 0 0 0-.072.222l.746 4.353a.5.5 0 0 1-.725.527l-3.91-2.055a.25.25 0 0 0-.232 0l-3.91 2.055a.5.5 0 0 1-.725-.527l.746-4.353a.25.25 0 0 0-.072-.222L1.725 7.494a.5.5 0 0 1 .278-.853l4.37-.635a.25.25 0 0 0 .189-.137l1.955-3.96Z"/></svg>`,
  prime: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M5.5 8 9 4.5 12.5 8 16 5.5v7.25c0 .69-.56 1.25-1.25 1.25H3.25C2.56 14 2 13.44 2 12.75V5.5L5.5 8Z"/></svg>`,
  vip: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="m2 8 7 7 7-7-3-4H5L2 8Z"/></svg>`,
  artist: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M10 7c.2-.5 2.417-2.875 3.5-4-1.228-1.228-3.25-1.125-5-1S4.924 3.041 3.75 4.375C2.375 5.938 1.873 7.813 2 10.75 2.127 13.688 6.193 16 9.5 16c1.375 0 2.125-.625 2.75-1.25s.75-1.875.75-2.375c0-.4.167-.583.25-.625l2-1.875c1.6-1.5.5-4.208-.25-5.375-.7 1-2.958 2.833-4 3.625v1.25c0 .208-.15.825-.75 1.625s-1.5 1-1.875 1H5c.375-.25 1-1.125 1.125-1.5s.125-1.75 1-2.75c.7-.8 2.208-.833 2.875-.75Z"/></svg>`,
};

function addRow(element, events = {}) {
  main.appendChild(element);

  element.id = `row-${rowId++}`;

  typeof events?.onAdd === 'function' && events.onAdd.call(element);

  var margin = 10;

  // Animate in

  animate.in(element, margin).then(() => {
    // Animation out after 30 seconds

    setTimeout(() => {
      if (document.querySelector(`#${element.id}`)) {
        animate.out(element, margin).then(() => {
          typeof events?.onRemove === 'function' && events.onRemove.call(element);

          element.remove();
        });
      }
    }, 30_000);
  });

  window.Motion.inView(
    `#${element.id}`,
    (el) => {
      el.dataset.visible = true;

      return () => {
        el.dataset.visible = false;

        if (el.dataset.removing) return;

        animate.out(el, margin).then(() => {
          typeof events?.onRemove === 'function' && events.onRemove.call(element);

          el.remove();
        });
      };
    },
    {
      root: main,
    },
  );

  removeExcessRows(6);
}

function removeExcessRows(max = 5) {
  const rows = Array.from(main.children).filter((el) => !el.dataset.removing);
  const excess = rows.length - max;

  if (excess > 0) {
    // Remove oldest messages (first elements)
    rows.slice(0, excess).forEach((element) => {
      animate.out(element).then(() => element.remove());
    });
  }
}
