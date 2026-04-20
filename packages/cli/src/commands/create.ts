import type { WidgetType } from '../types/widget.js';
import type { Command } from 'commander';

import { basename, join, resolve } from 'path';

import { program } from '../app.js';

export const generateCommand: Command = program
  .command('generate [path] [name] [description] [tags]')
  .aliases(['new', 'create', 'g', 'c', 'widget'])
  .description('Generate a new widget in the current workspace')
  .option('-t, --type <type>', 'Widget type (single | multiple)')
  .action(
    async (
      inputPath?: string,
      inputName?: string,
      inputDescription?: string,
      inputTags?: string,
      command?: {
        type?: WidgetType;
      },
    ) => {
      const [
        { Workspace },
        { default: ora },
        { default: cliSpinners },
        { getNextWidgetNumber },
        { default: inquirer },
      ] = await Promise.all([
        import('../lib/workspace.js'),
        import('ora'),
        import('cli-spinners'),
        import('../utils/widget.js'),
        import('inquirer'),
      ]);

      const spinner = ora({
        color: 'magenta',
        text: 'Loading workspace configuration...',
        spinner: cliSpinners.aesthetic,
      }).start();

      const workspace = new Workspace.Service({ path: process.cwd(), spinner });

      const config = await workspace.loadConfig().catch((error) => {
        spinner.fail('Failed to load workspace configuration');
        process.exit(1);
      });

      if (!config) {
        spinner.color = 'red';
        spinner.fail(
          'No workspace configuration found. Please run "tixyel init" to initialize a workspace before generating a widget.',
        );
        process.exit(1);
      }

      spinner.text = 'Generating widget...';
      spinner.color = 'green';

      let widgetPath = inputPath
        ? resolve(workspace.root, inputPath.replace(/[/\\]$/, ''))
        : workspace.root;

      /**
       * Means to generate the widget scaffold inside the target directory
       */
      const isTarget = inputPath ? inputPath.endsWith('/') || inputPath.endsWith('\\') : false;

      let name = inputName;

      if (isTarget) {
        // Path ends with / -> use as target directory, scaffold inside it
        const folderName = basename(widgetPath);

        name = folderName;
        // set widgetPath to the parent directory since the widget will be scaffolded inside it
        widgetPath = resolve(widgetPath, '..');

        inputPath?.slice(0, -1);
      } else {
        // path does not end with / -> use as widget name, scaffold inside a folder with the widget name

        if (!name) {
          spinner.stop();

          const nextNum = await getNextWidgetNumber(widgetPath);
          const defaultName = `${nextNum} - Custom Widget`;

          const { name: nameAnswer } = await inquirer.prompt({
            name: 'name',
            type: 'input',
            message: 'Enter a name for the widget:',
            default: defaultName,
          });

          if (!nameAnswer) {
            console.log('Widget name is required. Widget generation aborted.');
            process.exit(1);
          }

          name = nameAnswer as string;
        }
      }

      if (!inputDescription) {
        spinner.stop();

        const { description: descriptionAnswer } = await inquirer.prompt({
          name: 'description',
          type: 'input',
          message: 'Enter a description for the widget:',
        });

        inputDescription = descriptionAnswer ?? '';
      }

      if (!inputTags) {
        spinner.stop();

        const { tags: tagsAnswer } = await inquirer.prompt({
          name: 'tags',
          type: 'input',
          message: 'Enter tags for the widget (comma separated):',
        });

        inputTags = tagsAnswer ?? '';
      }

      let widgetType = command?.type;

      if (!widgetType) {
        spinner.stop();

        const { type } = await inquirer.prompt({
          name: 'type',
          type: 'select',
          message: 'Select the widget type:',
          choices: [
            {
              name: 'Single (one widget per folder, scaffold defined in "scaffold.single")',
              value: 'single',
            },
            {
              name: 'Multiple (multiple widgets per folder, scaffold defined in "scaffold.multiple")',
              value: 'multiple',
            },
          ],
          default: 'single',
        });

        widgetType = type as WidgetType;
      }

      let multiWidgets: string[] = [];

      if (widgetType === 'multiple') {
        spinner.stop();

        const { widgets } = await inquirer.prompt({
          name: 'widgets',
          type: 'input',
          message: 'Enter the names of the widgets to create (comma separated):',
          default: 'main',
        });

        multiWidgets = widgets
          ? (widgets as string)
              .split(',')
              .map((widget) => widget.trim())
              .filter((widget) => widget.length > 0)
          : [];

        if (!multiWidgets.length) {
          console.log(
            'At least one widget name is required for multiple widget type. Widget generation aborted.',
          );
          process.exit(1);
        }
      }

      const createPath = isTarget ? widgetPath : join(widgetPath, name);

      spinner.start();
      spinner.text = `📂 Creating widget ${name} at ${createPath}`;

      const widget = await workspace.createWidget(
        createPath,
        {
          name: name.replace(/^\d+\s*-\s*/, ''),
          description: inputDescription,
          tags: inputTags ? inputTags.split(',').map((tag) => tag.trim()) : [],
        },
        {
          type: widgetType,
          widgets: multiWidgets,
        },
      );

      spinner.succeed(`Widget "${name}" generated successfully at ${createPath}`);
      console.log('');

      if (widget.config.description.length) {
        console.log(`   - Description: ${widget.config.description}`);
      }
      if (widget.config.metadata?.tags?.length) {
        console.log(`   - Tags: ${widget.config.metadata?.tags.join(', ')}`);
      }
      if (widget.config.type) {
        console.log(`   - Type: ${widget.config.type}`);
      }
      if (widget.config.widgets?.length) {
        console.log(`   - Widgets: ${widget.config.widgets.join(', ')}`);
      }
      if (widget.content.files || widget.content.folders) {
        console.log(
          `   - Scaffold created with ${widget.content.folders} folders and ${widget.content.files} files`,
        );
      }
      if (widget.config.config) {
        console.log(`   - Config path: ${widget.config.config}`);
      }
      console.log('');
    },
  );
