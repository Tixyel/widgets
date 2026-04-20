import type { Command } from 'commander';

import { exec } from 'child_process';
import { existsSync, unlink } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

import { program } from '../app.js';

export const initCommand: Command = program
  .command('init')
  .aliases(['initialize', 'start', 'i', 'setup'])
  .description('Initialize a new workspace for widget development')
  .option(
    '-f --force',
    'Force initialization by overwriting existing configuration without confirmation',
  )
  .action(async (options: { force?: boolean } = {}) => {
    const [
      { Workspace },
      { default: ora },
      { default: cliSpinners },
      { INITIAL_PACKAGES, INSTALL_COMMANDS },
      { WORKSPACE_CONFIG_TEMPLATE },
      { default: inquirer },
      { detectPackageManager },
    ] = await Promise.all([
      import('../lib/workspace.js'),
      import('ora'),
      import('cli-spinners'),
      import('../lib/constants.js'),
      import('../template/workspaceConfig.js'),
      import('inquirer'),
      import('../utils/pm.js'),
    ]);

    const spinner = ora({
      color: 'magenta',
      text: 'Checking for existing workspace configuration...',
      spinner: cliSpinners.dotsCircle,
    }).start();

    const workspace = new Workspace.Service({ path: process.cwd(), spinner });

    const config = await workspace.loadConfig().catch((error) => {
      spinner.fail('Failed to load workspace configuration');
      process.exit(1);
    });

    if (!!config && !options.force) {
      spinner.stop();

      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: 'A workspace configuration already exists. Do you want to overwrite it?',
        default: false,
      });

      if (!force) {
        console.log('Existing workspace configuration found. Initialization aborted.');
        return;
      }

      options.force = true; // Set force to true to proceed with overwriting
      spinner.start();
    }

    if (!config || (config && options.force)) {
      const defaultConfigPath = resolve(process.cwd(), 'tixyel.config.ts');
      const template = WORKSPACE_CONFIG_TEMPLATE;

      if (existsSync(defaultConfigPath) && config && options.force) {
        unlink(config.path, (err) => {
          if (err) {
            console.error(`Failed to remove existing configuration: ${err}`);
            return;
          }
        });

        await writeFile(defaultConfigPath, template);

        spinner.text =
          'Existing configuration overwritten. Creating new workspace configuration...';
      } else {
        await writeFile(defaultConfigPath, template);
        spinner.text = 'Workspace configuration created.';
      }
    }

    spinner.succeed('Workspace initialization complete!');

    const { install } = await inquirer.prompt({
      type: 'confirm',
      name: 'install',
      message: 'Do you want to install the default dependencies now?',
      default: true,
    });

    if (install) {
      spinner.start('Installing default dependencies...');

      const packageManager = detectPackageManager();

      const installCommand = INSTALL_COMMANDS[packageManager](
        INITIAL_PACKAGES as unknown as string[],
        false,
      );

      spinner.text = `Installing dependencies using ${packageManager}... It might take a few moments.`;

      try {
        await new Promise((resolve) => {
          exec(installCommand, (error, stdout, stderr) => {
            if (error) {
              spinner.fail(`Failed to install dependencies: ${error.message}`);
              return;
            }

            spinner.succeed('Dependencies installed successfully!');
            resolve(stdout);
          });
        });
      } catch (error) {
        spinner.fail(`Failed to execute install command: ${error}`);
      }
    }

    console.log('');
    console.log(`🎉 Workspace setup is complete!`);
    console.log(
      `   Edit ${config?.file ?? 'tixyel.config.ts'} to customize your widget development experience.`,
    );
    console.log(`   Run 'tixyel generate' to create your first widget!`);
    console.log(`   Run 'tixyel build' to build your widgets for use!`);
    console.log('');
  });
