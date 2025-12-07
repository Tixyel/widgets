# Commands Architecture

## Overview

The CLI uses a **class-based command architecture** with **automatic discovery**. Each command is a class that extends the `Command` base class, and the main `index.ts` automatically discovers and registers all commands.

## How It Works

### 1. Base Class (`src/commands/base.ts`)

```typescript
export abstract class Command {
  abstract name: string;
  abstract description: string;

  register(command: CommanderCommand): void { ... }
  abstract execute(...args: unknown[]): Promise<void>;
}
```

Every command extends this base class and implements:

- `name`: The command name (e.g., 'init', 'build', 'generate')
- `description`: The command description shown in help
- `execute()`: The command logic
- `register()`: Optional override for custom arguments/options

### 2. Command Discovery (`src/index.ts`)

The `loadCommands()` function:

1. Scans the `src/commands/` directory for `.js` files
2. Excludes `base.js`
3. For each module, looks for a class with a `register` method
4. Creates an instance and calls `instance.register(program)`

```typescript
async function loadCommands(): Promise<void> {
  const commandsDir = join(__dirname, 'commands');
  const files = readdirSync(commandsDir).filter((file) => file.endsWith('.js') && file !== 'base.js');

  for (const file of files) {
    const module = await import(`file://${modulePath}`);

    for (const key in module) {
      if (typeof exported === 'function' && exported.prototype.register) {
        const instance = new CommandClass();
        instance.register(program);
        break;
      }
    }
  }
}
```

### 3. Existing Commands

#### `InitCommand` (init.ts)

- **Name**: `init`
- **Description**: Initialize a new Tixyel workspace
- **Action**: Creates `tixyel.config.ts`

#### `BuildCommand` (build.ts)

- **Name**: `build`
- **Description**: Build widgets from the workspace
- **Options**: `-d, --depth <number>` - Max search depth
- **Action**: Multi-select widgets, bump versions, build

#### `GenerateCommand` (generate.ts)

- **Name**: `generate`
- **Description**: Generate a new widget
- **Arguments**: `[path] [name] [description] [tags]`
- **Action**: Create widget with `.tixyel` config

## Adding a New Command

### 1. Create Command Class

```typescript
// src/commands/my-command.ts
import { Command } from './base.js';
import type { Command as CommanderCommand } from 'commander';

export class MyCommand extends Command {
  name = 'my-command';
  description = 'Description of my command';

  register(command: CommanderCommand): void {
    command
      .command(this.name)
      .description(this.description)
      .option('-f, --flag', 'A flag')
      .action((...args) => this.execute(...args));
  }

  async execute(options?: { flag?: string }): Promise<void> {
    // Command implementation
    console.log('My command executed');
  }
}
```

### 2. It's Automatically Discovered!

No need to register it manually. The next time you build and run:

```bash
tixyel --help  # Your new command will appear!
```

## Class Diagram

```
┌─────────────────────────┐
│ Command (Abstract)      │
├─────────────────────────┤
│ - name: string          │
│ - description: string   │
│ - register()            │
│ - execute()             │
└──────────┬──────────────┘
           │ extends
           │
    ┌──────┴──────┬──────────┐
    │             │          │
┌───────────┐ ┌──────────┐ ┌──────────────┐
│InitCommand│ │BuildCmd  │ │GenerateCmd   │
└───────────┘ └──────────┘ └──────────────┘
```

## Benefits

✅ **No Manual Registration**: Commands are auto-discovered
✅ **Scalable**: Add new commands without modifying `index.ts`
✅ **Type-Safe**: Full TypeScript support with abstract classes
✅ **Consistent**: All commands follow the same interface
✅ **Organized**: Each command in its own file
