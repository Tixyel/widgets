import { Client } from '../client/index.js';
import { Tixyel } from '../index.js';
import { Twitch$Message } from '../types/streamelements/events/twitch/message.js';
import { Youtube$Message } from '../types/streamelements/events/youtube/message.js';

interface CommandOptions {
  prefix?: string;
  name: string;
  description?: string;
  arguments?: boolean;
  run: () => void;
  test?: string;
  aliases?: string[];
  permissions?: string[];
  admins?: string[];
}

type CommandEvent = { provider: 'twitch'; data: Twitch$Message } | { provider: 'youtube'; data: Youtube$Message } | { provider: 'kick'; data: any };

export class Command {
  prefix: string = '!';

  name!: string;
  description!: string;

  arguments: boolean = false;

  test: string = `${this.prefix}${this.name} arg1 arg2`;

  aliases: string[] = [];
  permissions?: string[] | boolean = undefined;
  admins: string[] = [];

  constructor(options: CommandOptions) {
    if (!(window.client instanceof Client)) return;

    this.prefix = options.prefix ?? this.prefix;
    this.name = options.name;
    this.description = options.description ?? this.description;
    this.arguments = options.arguments ?? this.arguments;

    this.run = options.run;

    this.test = options.test ?? this.test;
    this.aliases = options.aliases ?? this.aliases;
    this.permissions = options.permissions ?? this.permissions;
    this.admins = options.admins ?? this.admins;

    // Register the command in the client actions
    window.client.actions.commands.push(this);
  }

  run(this: Client, args: string[], event: CommandEvent): void {}

  verify(nickname: string, roles: string[], args: string[]): boolean {
    if (this.arguments === true && (!args || !args.length)) {
      return false;
    }

    if (this.admins.some((a) => nickname.toLocaleLowerCase() === a.toLocaleLowerCase())) {
      return true;
    }

    if (this.permissions === true || typeof this.permissions === 'undefined' || (Array.isArray(this.permissions) && !this.permissions.length)) {
      return false;
    }

    if (Array.isArray(this.permissions) && this.permissions.some((p) => roles.map((r) => r.toLowerCase()).includes(p.toLowerCase()))) {
      return true;
    }

    return false;
  }

  parse(text: string, event: CommandEvent): boolean {
    if (!(window.client instanceof Client)) return false;

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

        break;
      }
      case 'kick': {
        return false;

        break;
      }
    }

    const verify = this.verify(nickname, roles, args);

    if (verify === true) {
      this.run.apply(window.client, [args, event]);
    }

    return verify;
  }

  static execute(received: CommandEvent): boolean {
    if (!(window.client instanceof Client)) return false;

    const data = received.data;

    try {
      if (window.client.actions.commands.length && window.client.actions.commands.some((c) => data.event.data.text.startsWith(c.prefix))) {
        const command = window.client.actions.commands.find((c) => data.event.data.text.replace(c.prefix, '').split(' ')[0] === c.name);

        if (command && command instanceof Command) {
          command.parse(data.event.data.text, received);

          Tixyel.logger.received(`Command executed: ${data.event.data.text} by ${data.event.data.nick || data.event.data.displayName}`, data);

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
