import { StreamElements } from '../types/streamelements/main.js';
import { Client } from '../client/client.js';
import { logger } from '../main.js';

interface CommandOptions {
  prefix?: string;
  name: string;
  description?: string;
  arguments?: boolean;
  run: (this: Client, args: string[], event: CommandEvent) => void;
  test?: string;
  aliases?: string[];
  permissions?: string[] | boolean;
  admins?: string[];
}

type CommandEvent =
  | { provider: 'twitch'; data: StreamElements.Event.Provider.Twitch.Message }
  | { provider: 'youtube'; data: StreamElements.Event.Provider.YouTube.Message }
  | { provider: 'kick'; data: any };

const commands: Command[] = [];

export class Command {
  prefix: string = '!';

  name!: string;
  description!: string;

  arguments: boolean = false;

  test: string | (() => string) = `${this.prefix}${this.name} arg1 arg2`;

  aliases: string[] = [];
  permissions?: string[] | boolean = undefined;
  admins: string[] = [];

  constructor(options: CommandOptions) {
    this.prefix = options.prefix ?? this.prefix;
    this.name = options.name;
    this.description = options.description ?? this.description;
    this.arguments = options.arguments ?? this.arguments;

    this.run = options.run;

    this.test = options.test ?? this.test;
    this.aliases = options.aliases ?? this.aliases;
    this.permissions = options.permissions ?? this.permissions;
    this.admins = options.admins ?? this.admins;

    commands.push(this);

    if (!(window?.client instanceof Client)) return;

    // Register the command in the client actions
    window?.client?.actions.commands.push(this);

    window?.client?.emit('action', this, 'created');
  }

  run(this: Client | undefined, args: string[], event: CommandEvent): void {}

  verify(nickname: string, roles: string[], args: string[]): boolean {
    if (this.arguments === true && (!args || !args.length)) {
      return false;
    }

    if (this.admins.some((a) => nickname.toLocaleLowerCase() === a.toLocaleLowerCase())) {
      return true;
    }

    if (
      this.permissions === true ||
      typeof this.permissions === 'undefined' ||
      (Array.isArray(this.permissions) && !this.permissions.length)
    ) {
      return true;
    }

    if (
      Array.isArray(this.permissions) &&
      (this.permissions.some(
        (p) =>
          nickname.toLowerCase() === p.toLowerCase() ||
          roles.map((r) => r.toLowerCase()).includes(p.toLowerCase()),
      ) ||
        this.permissions.includes('*'))
    ) {
      return true;
    }

    return false;
  }

  parse(text: string, event: CommandEvent): boolean {
    const args = text
      .replace(this.prefix, '')
      .split(' ')
      .slice(1)
      .map((a) => a.trim());

    var nickname: string = '';
    var roles: string[] = [];

    const rAliases = { bits: 'cheer', premium: 'prime' };

    switch (event.provider) {
      case 'twitch': {
        const data = event.data;

        nickname = data.event.data.nick || data.event.data.displayName;

        if (data.event.data.tags?.badges) {
          const tags = data.event.data.tags.badges.toString().replace(/\/\d+/g, '').split(',');

          roles = tags.map((t) => (t in rAliases ? rAliases[t as keyof typeof rAliases] : t));
        }

        break;
      }
      case 'youtube': {
        const data = event.data;

        const rMap = {
          isVerified: 'verified',
          isChatOwner: 'owner',
          isChatSponsor: 'sponsor',
          isChatModerator: 'moderator',
        };

        nickname = data.event.data.nick || data.event.data.displayName;

        roles = Object.entries(data.event.data.authorDetails)
          .filter(([k, v]) => k.startsWith('is') && v)
          .map(([k]) => rMap[k as keyof typeof rMap])
          .filter(Boolean);

        if (roles.includes('sponsor')) {
          roles.push('premium');
          roles.push('prime');
        }
        if (roles.includes('owner')) {
          roles.push('moderator');
          roles.push('broadcaster');
        }

        break;
      }
      case 'kick': {
        return false;

        break;
      }
    }

    const verify = this.verify(nickname, roles, args);

    if (verify === true) {
      this.run.apply(window?.client || undefined, [args, event]);
    }

    return verify;
  }

  remove(): void {
    const _index = commands.indexOf(this);

    if (_index > -1) {
      commands.splice(_index, 1);
    }

    if (!(window?.client instanceof Client)) return;

    const index = window?.client?.actions.commands.indexOf(this);

    if (index > -1) {
      window?.client?.actions.commands.splice(index, 1);
      window?.client?.emit('action', this, 'removed');
    }
  }

  static execute(received: CommandEvent): boolean {
    const data = received.data;

    try {
      if (commands.length && commands.some((c) => data.event.data.text.startsWith(c.prefix))) {
        const found = commands.filter((c) => {
          var nameAndAliases = [c.name, ...(c.aliases ?? [])];
          var commandMatch = data.event.data.text.replace(c.prefix, '').split(' ')[0];

          return nameAndAliases.includes(commandMatch);
        });

        if (found.length && found.every((command) => command instanceof Command)) {
          found.forEach((command) => {
            command.parse(data.event.data.text, received);

            window?.client?.emit('action', command, 'executed');

            logger.received(
              `Command executed: ${data.event.data.text} by ${data.event.data.nick || data.event.data.displayName}`,
              data,
            );
          });

          return true;
        }
      }
    } catch (error) {
      return false;
    } finally {
      return false;
    }
  }
}

export { commands as usedCommands };
