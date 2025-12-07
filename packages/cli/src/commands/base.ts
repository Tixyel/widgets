import type { Command as CommanderCommand } from 'commander';

/**
 * Base class for all CLI commands
 */
export abstract class Command {
  /**
   * Command name (e.g., 'init', 'build', 'generate')
   */
  abstract name: string;

  /**
   * Command description
   */
  abstract description: string;

  /**
   * Register the command with commander
   * Override to add custom arguments/options
   */
  register(command: CommanderCommand): void {
    command
      .command(this.name)
      .description(this.description)
      .action((...args) => this.execute(...args));
  }

  /**
   * Execute the command
   * Implement in subclasses
   */
  abstract execute(...args: unknown[]): Promise<void>;
}
