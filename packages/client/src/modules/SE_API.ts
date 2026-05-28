import type { StreamElements } from '../types.js';

import { LOCAL_SE_API } from '../streamelements/api.js';
import { maxEventHistory } from '../utils/events.js';

export const USE_SE_API: Promise<StreamElements.SE_API> =
  typeof SE_API !== 'undefined' ? Promise.resolve(SE_API) : Promise.resolve(initializeLocalSEAPI());

export async function initializeLocalSEAPI() {
  let lastStore = localStorage.getItem('SE_API-STORE') ?? '{}';
  let result = lastStore ? JSON.parse(lastStore) : {};

  LOCAL_SE_API.store.list = result;

  let lastEvents = localStorage.getItem('SE_API-EVENTS') ?? '[]';
  let eventsResult: any[] = lastEvents ? JSON.parse(lastEvents) : [];

  LOCAL_SE_API.events.history = eventsResult.slice(0, maxEventHistory);

  return LOCAL_SE_API;
}
