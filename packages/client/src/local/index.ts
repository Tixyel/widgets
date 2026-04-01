import { StreamElements } from '../types/streamelements/main.js';
import { emulate as Emulator } from './emulator.js';
import { generate as Generator } from './generator.js';
import { localQueue, localQueueItem } from './queue.js';

export namespace Local {
  export type QueueItem = localQueueItem;

  export const queue = localQueue;
  export const generate = Generator;
  export const emulate = Emulator;

  export async function start(
    fieldsFile: string[] = ['fields.json', 'cf.json', 'field.json', 'customfields.json'],
    dataFiles: string[] = ['data.json', 'fielddata.json', 'fd.json', 'DATA.json'],
    session?: StreamElements.Session.Data,
  ) {
    const localFiles = {
      fields: fieldsFile.find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
      data: dataFiles.find((file) => {
        try {
          new URL('./' + file, window.location.href);
          return true;
        } catch (error) {
          return false;
        }
      }),
    };

    const data: Record<string, string | number | boolean> = await fetch(
      './' + (localFiles.data ?? 'data.json'),
      {
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .catch(() => ({}));

    await fetch('./' + (localFiles.fields ?? 'fields.json'), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then(async (customfields: Record<string, StreamElements.CustomField.Schema>) => {
        const fields = Object.entries(customfields)
          .filter(([_, { value }]) => value != undefined)
          .reduce(
            (acc, [key, { value }]) => {
              if (data && data[key] !== undefined) value = data[key];

              acc[key] = value;

              return acc;
            },
            {
              ...data,
            } as Record<string, StreamElements.CustomField.Value>,
          );

        const load = await Local.generate.event.onWidgetLoad(
          fields,
          await Local.generate.session.get(session),
        );

        window.dispatchEvent(new CustomEvent('onWidgetLoad', { detail: load }));
      });
  }
}
