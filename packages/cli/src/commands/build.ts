import inquirer from 'inquirer';
import type { Command as CommanderCommand } from 'commander';
import { findWidgets } from '../utils/find-widgets.js';
import { bumpWidgetVersion } from '../utils/version.js';
import { loadCliConfig } from '../utils/load-cli-config.js';
import { validateWorkspaceInit } from '../utils/workspace.js';
import { buildWidget as processBuild } from '../utils/build-processor.js';
import { Command } from './base.js';
import type { VersionBump } from '../utils/version.js';

/**
 * Build command
 */
export class BuildCommand extends Command {
  name = 'build';
  description = 'Build widgets from the workspace';

  register(command: CommanderCommand): void {
    command
      .command(this.name)
      .description(this.description)
      .option('-d, --depth <number>', 'Maximum depth to search for widgets', '3')
      .option('-p, --parallel', 'Build widgets in parallel')
      .option('-v, --verbose', 'Show verbose output')
      .action((...args) => this.execute(...args));
  }

  async execute(options: { depth?: string; parallel?: boolean; verbose?: boolean } = {}): Promise<void> {
    try {
      // Validate workspace is initialized
      const workspaceRoot = await validateWorkspaceInit();

      const rootPath = process.cwd();

      // Load CLI config from workspace root
      const cliConfig = await loadCliConfig(workspaceRoot);
      const maxDepth = options.depth ? parseInt(options.depth, 10) : cliConfig.search.maxDepth;

      console.log(`🔍 Searching for widgets (max depth: ${maxDepth})...\n`);

      // Find all widgets
      const widgets = await findWidgets(rootPath, maxDepth, cliConfig.search.ignore);

      if (widgets.length === 0) {
        console.log('❌ No widgets found with .tixyel configuration files.');
        return;
      }

      console.log(`✅ Found ${widgets.length} widget(s)\n`);

      // Create choices for selection
      const choices = widgets.map((widget) => ({
        name: `${widget.config.name} (${widget.relativePath})`,
        value: widget.path,
        checked: false,
      }));

      let selectedPaths: string[] = [];

      if (choices.length === 1) {
        selectedPaths = [choices[0].value];
        console.log(`🔒 Only one widget found, auto-selected: ${choices[0].name}\n`);
      } else {
        // Prompt for widget selection
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
        console.log('\n⚠️  No widgets selected. Exiting...');
        return;
      }

      // Prompt for version bump
      const versionAnswers = await inquirer.prompt([
        {
          type: 'select',
          name: 'versionBump',
          message: 'Version bump type:',
          choices: [
            { name: 'No version bump', value: 'none' },
            { name: 'Patch (x.x.1)', value: 'patch' },
            { name: 'Minor (x.1.0)', value: 'minor' },
            { name: 'Major (1.0.0)', value: 'major' },
          ],
          default: 'none',
          loop: false,
          pageSize: 4,
        },
      ]);

      const versionBump = versionAnswers.versionBump as VersionBump | 'none';

      // Resolve parallel setting (CLI option overrides config)
      const useParallel = options.parallel ?? cliConfig.build.parallel;
      const verbose = options.verbose ?? cliConfig.build.verbose;

      console.log(`\n🚀 Building ${selectedPaths.length} widget(s)${useParallel ? ' (parallel)' : ''}...\n`);

      // Build each selected widget
      if (useParallel) {
        // Parallel execution
        await Promise.all(
          selectedPaths.map(async (widgetPath) => {
            const widget = widgets.find((w) => w.path === widgetPath);
            if (widget) {
              await buildWidget(widget.path, widget.config.name, versionBump !== 'none' ? versionBump : undefined, verbose, widget.config, cliConfig);
            }
          }),
        );
      } else {
        // Sequential execution
        for (const widgetPath of selectedPaths) {
          const widget = widgets.find((w) => w.path === widgetPath);
          if (widget) {
            await buildWidget(widget.path, widget.config.name, versionBump !== 'none' ? versionBump : undefined, verbose, widget.config, cliConfig);
          }
        }
      }

      console.log('\n✨ Build complete!');
    } catch (error) {
      console.error(`${error}`);
      process.exit(1);
    }
  }
}

/**
 * Builds a single widget
 */
async function buildWidget(widgetPath: string, widgetName: string, versionBump?: VersionBump, verbose?: boolean, config?: any, cliConfig?: any): Promise<void> {
  console.log(`📦 Building ${widgetName}...`);
  if (verbose) {
    console.log(`   Path: ${widgetPath}`);
  }

  // Bump version if requested
  if (versionBump) {
    const newVersion = await bumpWidgetVersion(widgetPath, versionBump);
    if (newVersion) {
      console.log(`   📌 Version bumped to: ${newVersion}`);
    }
  }

  // Process build if config and cliConfig provided
  if (config && cliConfig) {
    try {
      await processBuild({
        widgetPath,
        config,
        cliConfig,
        verbose,
      });
    } catch (error) {
      console.error(`   ❌ Build failed: ${error}`);
      throw error;
    }
  } else {
    console.error('   ❌ Missing configuration for build process.');
    throw new Error('Missing configuration for build process.');
  }

  console.log(`✓ ${widgetName} built successfully\n`);
}
