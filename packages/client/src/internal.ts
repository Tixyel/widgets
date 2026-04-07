import type { Client } from './client/client.js';
import type { FakeUserPool } from './modules/fakeUser.js';
import type { useComms } from './modules/useComms.js';
import type { Button, Command, useStorage } from './types.js';

export const usedClients: Client[] = [];
export const usedStorages: Array<useStorage<any>> = [];
export const usedComms: Array<useComms<any>> = [];
export const usedCommands: Command[] = [];
export const usedButtons: Button[] = [];
export const fakeUserPools: FakeUserPool[] = [];
