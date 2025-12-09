#!/usr/bin/env node

import { build, createWidget, findWidgets, getNextWidgetNumber } from './widget.js';
import { loadWorkspace, validateWorkspace } from './workspace.js';
import { workspace_config } from './templates/workspace.js';
import { Command as Commander } from 'commander';
import { basename, join, resolve } from 'path';
import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
import inquirer from 'inquirer';

const program = new Commander();

program
  .name('tixyel')
  .description('CLI tool for streamelements widgets')
  .version(
    (() => {
      try {
        const require = createRequire(import.meta.url);
        const { version } = require('../package.json');
        return version ?? 'dev';
      } catch {
        return process.env.TIXYEL_VERSION ?? 'dev';
      }
    })(),
  );

program
  .command('init')
  .aliases(['initialize', 'i', 'setup', 'start'])
  .description('Initialize a new widget workspace.')
  .action(async () => {
    const root = process.cwd();
    const config = resolve(root, 'tixyel.config.ts');

    console.log('🚀 Initializing new workspace...');
    console.log(`📁 Workspace root: ${root}`);

    const content = workspace_config;

    try {
      await writeFile(config, content, 'utf-8');

      console.log(`✅ Created tixyel.config.ts`);
      console.log('   Edit it to customize your workspace settings.');
      console.log('\n🎉 All set! Start building your widgets!');
      console.log('   - Use "tixyel generate" to create new widgets.');
      console.log('   - Use "tixyel build" to build your widgets for publish.');
    } catch (error) {
      throw error;
    }
  });

program
  .command('generate [path] [name] [description] [tags]')
  .aliases(['new', 'g', 'create', 'widget'])
  .description('Generate a new widget.')
  .action(async (path?: string, name?: string, description?: string, tags?: string) => {
    try {
      // Validate if the workspace is initialized
      const validWorkspacePath = await validateWorkspace();

      const rootPath = process.cwd();

      // Load the workspace config
      const workspaceConfig = await loadWorkspace(validWorkspacePath);

      // Default to current dir if the path wasn't provided
      const resolvedPath = path ? resolve(rootPath, path.replace(/[/\\]$/, '')) : rootPath;
      const isTarget = path ? path.endsWith('/') || path.endsWith('\\') : false;

      console.log('🎨 Generating widget...\n');

      if (isTarget) {
        // Path ends with / -> use as target directory
        const folderName = basename(resolvedPath);

        await createWidget(
          resolvedPath,
          {
            name: folderName,
            description,
            tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
          },
          workspaceConfig,
          validWorkspacePath,
        );
      } else {
        // Path without / -> use as parent directory
        let finalWidgetName = name;

        if (!finalWidgetName) {
          // Get next number and ask for name
          const nextNum = await getNextWidgetNumber(resolvedPath);
          const defaultName = `${nextNum} - Widget`;

          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Widget name:',
              default: defaultName,
            },
          ]);

          finalWidgetName = answers.name as string;
        }

        const widgetPath = join(resolvedPath, finalWidgetName);

        await createWidget(
          widgetPath,
          {
            name: finalWidgetName,
            description,
            tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
          },
          workspaceConfig,
          validWorkspacePath,
        );
      }

      console.log('\n✨ Generation complete!');
    } catch (error) {
      throw error;
    }
  });

program
  .command('build')
  .aliases(['b', 'compact', 'compile'])
  .description('Build widgets in the workspace. Supports interactive selection and version bumping.')
  .option('-d --depth <number>', 'Maximum search depth for widgets', '3')
  .option('-p --parallel', 'Build widgets in parallel')
  .option('-v --verbose', 'Show verbose output')
  .action(async (options: { depth?: string; parallel?: boolean; verbose?: boolean } = {}) => {
    try {
      // Validate if the workspace is initialized
      const validWorkspacePath = await validateWorkspace();

      const rootPath = process.cwd();

      // Load the workspace config
      const workspaceConfig = await loadWorkspace(validWorkspacePath);

      const maxDepth = options.depth ? parseInt(options.depth, 10) : workspaceConfig.search?.maxDepth || 3;

      console.log(`🔍 Searching for widgets (max depth: ${maxDepth})...\n`);

      // Find all widgets on the workspace
      const widgets = await findWidgets(rootPath, maxDepth, workspaceConfig.search?.ignore || []);

      const choices = widgets.map((widget) => ({
        name: `${widget.config.name} (${widget.relativePath})`,
        value: widget.path,
        checked: false,
      }));

      let selectedPaths: string[] = [];

      if (widgets.length === 0) {
        console.log('❌ No widgets found with .tixyel configuration files.');
        return;
      } else if (widgets.length === 1) {
        selectedPaths = [choices[0].value];
        console.log(`🔒 Only one widget found, auto-selected: ${choices[0].name}\n`);
      } else {
        console.log(`✅ Found ${widgets.length} widget(s)\n`);

        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedWidgets',
            message: 'Select widgets to build:',
            choices,
            pageSize: 10,
            loop: false,
          },
        ]);

        selectedPaths = answers.selectedWidgets as string[];
      }

      if (selectedPaths.length === 0) {
        console.log('❌ No widgets selected for build. Exiting.');
        return;
      }

      const versionAnswers = await inquirer.prompt([
        {
          type: 'select',
          name: 'versionBump',
          message: 'Select version bump type:',
          choices: [
            { name: 'No version bump', value: 'none' },
            { name: 'Patch (x.x.1)', value: 'patch' },
            { name: 'Minor (x.1.x)', value: 'minor' },
            { name: 'Major (1.x.x)', value: 'major' },
          ],
          default: 'none',
          loop: false,
          pageSize: 4,
        },
      ]);

      const versionBump = versionAnswers.versionBump as 'none' | 'patch' | 'minor' | 'major';

      // Resolve parallel option (CLI option overrides config)
      const buildInParallel = options.parallel ?? workspaceConfig.build?.parallel ?? false;
      const verboseOutput = options.verbose ?? workspaceConfig.build?.verbose ?? false;

      console.log(`\n⚙️ Building ${selectedPaths.length} widget(s)${buildInParallel ? ' in parallel' : ''}...\n`);

      if (buildInParallel) {
        await Promise.all(
          selectedPaths.map(async (path) => {
            const widget = widgets.find((w) => w.path === path);

            if (widget) {
              await build(widget, versionBump, verboseOutput, workspaceConfig);
            }
          }),
        );
      } else {
        for (const widgetPath of selectedPaths) {
          const widget = widgets.find((w) => w.path === widgetPath);

          if (widget) {
            await build(widget, versionBump, verboseOutput, workspaceConfig);
          }
        }
      }

      console.log('\n🎉 Build process complete!');
    } catch (error) {
      throw error;
    }
  });

program.parse();

export * from './workspace.js';
