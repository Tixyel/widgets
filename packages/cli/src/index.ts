#!/usr/bin/env node

import { Command as CommanderCommand } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import type { Command } from './commands/base.js';

// Export types for config files
export type { TixyelCliConfig, ScaffoldItem, ScaffoldFile, ScaffoldFolder } from './types/tixyel-cli-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new CommanderCommand();

program.name('tixyel').description('CLI tool for Tixyel widgets').version('1.0.0');

/**
 * Auto-discover and load command classes from the commands directory
 */
async function loadCommands(): Promise<void> {
  const commandsDir = join(__dirname, 'commands');
  const files = readdirSync(commandsDir).filter((file) => file.endsWith('.js') && file !== 'base.js');

  for (const file of files) {
    try {
      const modulePath = join(commandsDir, file);
      const module = await import(`file://${modulePath}`);

      // Look for class exports
      for (const key in module) {
        const exported = module[key];
        // Check if it's a class that extends Command
        if (typeof exported === 'function' && exported.prototype && exported.prototype.register) {
          const CommandClass = exported as new () => Command;
          const instance = new CommandClass();
          instance.register(program);
          break;
        }
      }
    } catch (error) {
      console.error(`Failed to load command from ${file}:`, error);
    }
  }
}

// Load commands and parse
await loadCommands();
program.parse();
