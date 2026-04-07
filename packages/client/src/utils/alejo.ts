import { usedClients } from '../internal.js';

export namespace Alejo {
  export namespace Pronouns {
    export type name =
      | 'hehim'
      | 'sheher'
      | 'theythem'
      | 'shethem'
      | 'hethem'
      | 'heshe'
      | 'xexem'
      | 'faefaer'
      | 'vever'
      | 'aeaer'
      | 'ziehir'
      | 'perper'
      | 'eem'
      | 'itits';

    export type display =
      | 'He/Him'
      | 'She/Her'
      | 'They/Them'
      | 'She/They'
      | 'He/They'
      | 'He/She'
      | 'Xe/Xem'
      | 'Fae/Faer'
      | 'Ve/Ver'
      | 'Ae/Aer'
      | 'Zie/Hir'
      | 'Per/Per'
      | 'E/Em'
      | 'It/Its';

    export enum map {
      hehim = 'He/Him',
      sheher = 'She/Her',
      theythem = 'They/Them',
      shethem = 'She/They',
      hethem = 'He/They',
      heshe = 'He/She',
      xexem = 'Xe/Xem',
      faefaer = 'Fae/Faer',
      vever = 'Ve/Ver',
      aeaer = 'Ae/Aer',
      ziehir = 'Zie/Hir',
      perper = 'Per/Per',
      eem = 'E/Em',
      itits = 'It/Its',
    }
  }

  export async function list(): Promise<typeof Pronouns.map> {
    try {
      const data = (await fetch('https://pronouns.alejo.io/api/pronouns').then((res) =>
        res.json(),
      )) as {
        display: Pronouns.display;
        name: Pronouns.name;
      }[];

      if (Array.isArray(data) && data.length) {
        const built = Object.fromEntries(
          data.map(({ name, display }) => [name, display] as const),
        ) as Record<Pronouns.name, Pronouns.display>;

        return { ...Pronouns.map, ...built } as typeof Pronouns.map;
      }
    } catch {}

    return { ...Pronouns.map } as typeof Pronouns.map;
  }

  export type user = {
    id: string;
    login: string;
    pronoun_id: Pronouns.name;
  };

  export async function get(username: string) {
    if (!username) throw new Error('Username is required to fetch Alejo data.');

    username = username.toLowerCase();

    if (!usedClients.length) {
      try {
        const data = await fetch(`https://pronouns.alejo.io/api/users/${username}`)
          .then((res) => res.json())
          .then(([data]) => data as Alejo.user | undefined);

        if (data) {
          return data.pronoun_id;
        }
      } catch (error) {
        throw new Error(
          `Failed to fetch pronoun data for user "${username}": ${error instanceof Error ? error.message : error}`,
        );
      }

      return;
    }

    const client = usedClients?.[0];

    if (
      username in client.storage.data.pronoun &&
      client.storage.data.pronoun[username].expire > Date.now()
    ) {
      return client.storage.data.pronoun[username].value;
    } else {
      try {
        const data = await fetch(`https://pronouns.alejo.io/api/users/${username}`)
          .then((res) => res.json())
          .then(([data]) => data as Alejo.user | undefined);

        if (data) {
          client.storage.add(`pronoun.${username}`, {
            value: data.pronoun_id,
            timestamp: Date.now(),
            expire: Date.now() + client.cache.pronoun * 60 * 1000,
          });

          return client.storage.data.pronoun[username].value ?? data.pronoun_id;
        }
      } catch (error) {
        throw new Error(
          `Failed to fetch pronoun data for user "${username}": ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }
}
