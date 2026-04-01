import { ClientEvents, Provider, StreamElements } from '../../types.js';

export class EventHelper {
  /**
   * Parses the provider information from the event detail object.
   * @param detail - The event detail object received from the StreamElements event.
   * @returns An object containing the provider and the original event data.
   */
  parseProvider(
    detail: StreamElements.Event.onEventReceived,
    overrideProvider?: Provider,
  ): ClientEvents {
    var provider: Provider =
      // @ts-ignore
      detail?.provider ||
      // @ts-ignore
      detail.event?.provider ||
      // @ts-ignore
      detail.event?.service ||
      // @ts-ignore
      detail.event?.data?.provider ||
      // @ts-ignore
      overrideProvider ||
      // @ts-ignore
      window?.client?.details?.provider ||
      'twitch';

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
  }
}
