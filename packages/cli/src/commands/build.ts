import type { Command } from 'commander';
import { program } from '../app';

import { existsSync, readFileSync } from 'fs';
import path, { relative } from 'path';

export const buildCommand: Command = program
  .command('build')
  .aliases(['b', 'compact', 'compie', 'bundle'])
  .description('Build the widgets in the current workspace')
  .option('-p --parallel', 'Build widgets in parallel')
  .option('-d --depth <number>', 'Maximum directory depth to search for widget files', parseInt)
  .option('-v --verbose', 'Enable verbose logging during the build process')
  .option('-w --widgets <names...>', 'Specify which widgets to build by name', (value) =>
    value === '*'
      ? '*'
      : String(value ?? '')
          .split(',')
          .map((name) => name.trim()),
  )
  .option('-b --bump <type>', 'Bump version of built widgets (none, patch, minor, major)')
  .action(
    async (options: {
      parallel?: boolean;
      depth?: number;
      verbose?: boolean;
      widgets?: string[] | '*';
      bump?: 'none' | 'patch' | 'minor' | 'major';
    }) => {
      const [
        { Workspace },
        { default: ora },
        { default: cliSpinners },
        { default: inquirer },
        { Widget },
      ] = await Promise.all([
        import('../lib/workspace'),
        import('ora'),
        import('cli-spinners'),
        import('inquirer'),
        import('../lib/widget'),
      ]);

      const spinner = ora({
        text: 'Loading workspace configuration...',
        color: 'magenta',
        spinner: cliSpinners.dotsCircle,
      });

      const workspace = new Workspace.Service({ spinner });

      if (existsSync('.tixyel') && !existsSync('.tixyel/')) {
        const data = JSON.parse(readFileSync('.tixyel', 'utf-8'));

        const widget = new Widget.Service({
          relativePath: relative(process.cwd(), data.path),
          config: data,
          path: process.cwd(),
          workspace,
        });

        if (!widget.config.config) {
          spinner.fail('Invalid widget configuration found in .tixyel file');
          process.exit(1);
        }

        workspace.root = path.join(process.cwd(), widget.config.config as string);

        widget.relativePath = relative(workspace.root, widget.path);

        spinner.succeed('Loaded widget configuration from .tixyel file');
      }

      spinner.start();

      const config = await workspace.loadConfig().catch((error) => {
        console.error('Failed to load workspace configuration:', error);
        process.exit(1);
      });

      if (!config) {
        spinner.fail(
          'No workspace configuration found. Please run "tixyel init" to create a workspace configuration before building.',
        );
        process.exit(1);
      }

      const maxDepth = config.data.search?.maxDepth;

      spinner.start(`🔎 Searching for widgets (max depth: ${maxDepth})...`);

      const widgets = await workspace.findWidgets(options.depth ?? undefined);

      if (!widgets.length) {
        spinner.fail(
          'No widgets found in the workspace. Please ensure you have widgets configured correctly.',
        );
        process.exit(1);
      }

      let selectedPaths: string[] = [];

      // Handle --widgets option

      if (options.widgets?.length && !!options.widgets && typeof options.widgets !== 'undefined') {
        if (options.widgets === '*') {
          selectedPaths = widgets.map((widget) => widget.path);

          spinner.succeed(`Auto-selected widgets for build (${selectedPaths.length} widgets)`);

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          selectedPaths = widgets
            .filter((widget) =>
              (options.widgets as string[]).some(
                (sel) => widget.config.name === sel || widget.path.includes(sel),
              ),
            )
            .map((widget) => widget.path);

          if (!selectedPaths.length) {
            spinner.fail(
              'No widgets matched the specified names. Please check the --widgets option and try again.',
            );
            process.exit(1);
          }

          spinner.text = `Selected widgets for build (${selectedPaths.length} widgets)`;
        }
      } else {
        if (widgets.length === 1) {
          selectedPaths = [widgets[0].path];

          spinner.start();
          spinner.succeed(`Auto-selected single widget for build: ${widgets[0].config.name}`);
        } else {
          spinner.stop();

          const largerNameLength = Math.max(...widgets.map((w) => w.config.name.length)) + 2;

          const choices = widgets.map((widget) => ({
            name: `${widget.config.name.padEnd(largerNameLength, ' ')} (${widget.relativePath.startsWith('.') ? widget.relativePath.replace(/\\/g, '/') : `./${widget.relativePath}`.replace(/\\/g, '/')})`,
            value: widget.path,
            checked: false,
          }));

          const { selected } = await inquirer.prompt({
            type: 'checkbox',
            name: 'selected',
            message: 'Select which widgets to build:',
            choices,
            pageSize: 10,
            loop: true,
            theme: {
              checkbox: {
                on: '[x]',
                off: '[ ]',
              },
            },
          });

          selectedPaths = selected as string[];

          spinner.start();
        }
      }

      if (!selectedPaths.length) {
        if (spinner.isSpinning) {
          spinner.fail(
            'No widgets selected for build. Please select at least one widget to build.',
          );
        } else {
          console.log(
            '❌ No widgets selected for build. Please select at least one widget to build.',
          );
        }
      }

      type Bump = 'none' | 'patch' | 'minor' | 'major';
      let versionBump: Bump = 'none';

      if (options.bump) {
        spinner.start();

        const validBumps: Bump[] = ['none', 'patch', 'minor', 'major'];

        if (!validBumps.includes(options.bump as Bump)) {
          spinner.fail(
            `Invalid bump type "${options.bump}". Valid options are: ${validBumps.join(', ')}. Defaulting to "none".`,
          );
          process.exit(1);
        }

        versionBump = options.bump as Bump;

        spinner.succeed(`Version bump: ${versionBump}`);
      } else {
        spinner.stop();

        const { version } = await inquirer.prompt({
          type: 'select',
          name: 'version',
          message: 'Select version bump type for built widgets:',
          choices: [
            { name: 'None (keep current version)', value: 'none' },
            { name: 'Patch (x.x.1)', value: 'patch' },
            { name: 'Minor (x.1.0)', value: 'minor' },
            { name: 'Major (1.0.0)', value: 'major' },
          ],
          default: 'none',
          loop: false,
          pageSize: 4,
        });

        versionBump = version as Bump;
      }

      const buildInParallel = options.parallel ?? workspace.config.data.build?.parallel ?? false;
      const verbose = options.verbose ?? workspace.config.data.build?.verbose ?? false;

      spinner.start();
      spinner.text = `🚀 Starting build for ${selectedPaths.length} widget(s) with${buildInParallel ? ' parallel' : ''} build and${verbose ? ' verbose logging' : ''}...`;

      if (buildInParallel) {
        await Promise.all(
          selectedPaths.map(
            async (path) =>
              new Promise(async (resolve) => {
                const widget = widgets.find((w) => w.path === path);

                if (widget)
                  await widget.build(verbose, versionBump).catch((error) => {
                    spinner.fail(`Failed to build widget at '${path}': ${error}`);
                  });

                resolve(widget);
                return widget;
              }),
          ),
        );
      } else {
        for await (const widgetPath of selectedPaths) {
          const widget = widgets.find((w) => w.path === widgetPath);

          if (widget) {
            spinner.text = `🚀 Building widget: ${widget.config.name} (${widget.relativePath})...`;

            await widget.build(verbose, versionBump).catch((error) => {
              spinner.fail(`Failed to build widget at '${widgetPath}': ${error}`);
            });
          }
        }
      }

      spinner.succeed('Build process complete!');
    },
  );
