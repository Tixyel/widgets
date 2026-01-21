import { ClientEvents, Provider, StreamElements } from '../../types/index.js';

const functions = {
  parseProvider(detail: StreamElements.Event.onEventReceived) {
    // @ts-ignore
    var provider: Provider = detail.event?.provider || detail.event?.service || detail.event?.data?.provider || window.client.details.provider;

    const actAsStreamElements = [
      'kvstore:update',
      'bot:counter',
      'alertService:toggleSound',
      'tip-latest',
      'event:test',
      'event:skip',
    ] as StreamElements.Event.onEventReceived['listener'][];

    if (actAsStreamElements.some((l) => l === detail.listener)) provider = 'streamelements';

    const received = { provider: provider, data: detail } as ClientEvents;

    return received;
  },
};

export default functions;
