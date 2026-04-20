import type { Command } from 'commander';

import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { emitKeypressEvents } from 'node:readline';

import { program } from '../app.js';

type ListItem = {
  description: string;
  name: string;
  path: string;
  tags: string;
  type: string;
  version: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatRelativePath(path: string) {
  const normalized = path.replace(/\\/g, '/');

  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

function normalizeListItems(
  widgets: Array<{
    config: {
      description?: string;
      metadata?: { tags?: string[] };
      name: string;
      type?: string;
      version?: string;
    };
    relativePath: string;
  }>,
): ListItem[] {
  return widgets
    .map((widget) => ({
      description: widget.config.description?.trim() || 'No description',
      name: widget.config.name,
      path: formatRelativePath(widget.relativePath),
      tags: widget.config.metadata?.tags?.filter(Boolean).join(', ') || 'No tags',
      type: widget.config.type ?? 'single',
      version: widget.config.version ?? '0.0.0',
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function renderStaticPages(items: ListItem[], pageSize: number) {
  const totalPages = Math.ceil(items.length / pageSize);
  const nameWidth = clamp(Math.max(...items.map((item) => item.name.length), 12), 12, 32);

  console.log('');
  console.log(`Widgets in workspace (${items.length})`);
  console.log('');

  for (let page = 0; page < totalPages; page++) {
    const start = page * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    console.log(`Page ${page + 1}/${totalPages}`);
    console.log('');

    for (const item of pageItems) {
      console.log(`  ${item.name.padEnd(nameWidth, ' ')} ${item.path}`);
      console.log(`    ${item.description}`);
      console.log(`    v${item.version} | ${item.type} | ${item.tags}`);
      console.log('');
    }
  }
}

async function renderInteractivePages(
  items: ListItem[],
  pageSize: number,
  chalk: typeof import('chalk').default,
) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    renderStaticPages(items, pageSize);
    return;
  }

  const stdin = process.stdin;
  const stdout = process.stdout;
  const totalPages = Math.ceil(items.length / pageSize);
  const nameWidth = clamp(Math.max(...items.map((item) => item.name.length), 12), 12, 32);

  let activeIndex = 0;

  const renderFrame = (showHelp: boolean) => {
    const currentPage = Math.floor(activeIndex / pageSize);
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);
    const activeItem = items[activeIndex];
    const lines = [
      '\x1B[2J\x1B[H',
      chalk.bold('Widgets in workspace'),
      chalk.dim(`${items.length} widget(s)`),
      showHelp
        ? chalk.dim('Use ↑/↓ to browse, ←/→ or PageUp/PageDown to change page, Enter or q to exit.')
        : chalk.dim(`Page ${currentPage + 1}/${totalPages}`),
      '',
      ...pageItems.flatMap((item, index) => {
        const itemIndex = start + index;
        const isActive = itemIndex === activeIndex;
        const marker = isActive ? chalk.cyan('>') : ' ';
        const label = item.name.padEnd(nameWidth, ' ');

        return [
          `${marker} ${isActive ? chalk.bold(label) : label} ${chalk.dim(item.path)}`,
          `${isActive ? ' ' : ' '}   ${chalk.dim(`v${item.version} | ${item.type}`)}`,
        ];
      }),
      '',
      chalk.dim(
        `Showing ${start + 1}-${Math.min(end, items.length)} of ${items.length} • Page ${currentPage + 1}/${totalPages}`,
      ),
      '',
      `${chalk.bold('Description:')} ${activeItem.description}`,
      `${chalk.bold('Tags:')} ${activeItem.tags}`,
    ];

    stdout.write(lines.join('\n'));
  };

  emitKeypressEvents(stdin);

  const wasRaw = stdin.isRaw;

  if (typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true);
  }

  stdin.resume();
  renderFrame(true);

  await new Promise<void>((resolve) => {
    const cleanup = () => {
      stdin.off('keypress', onKeypress);

      if (typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(Boolean(wasRaw));
      }

      stdout.write('\x1B[2J\x1B[H');
      renderFrame(false);
      stdout.write('\n');
      resolve();
    };

    const jumpPage = (direction: -1 | 1) => {
      const currentPage = Math.floor(activeIndex / pageSize);
      const nextPage = clamp(currentPage + direction, 0, totalPages - 1);
      activeIndex = nextPage * pageSize;
      renderFrame(true);
    };

    const onKeypress = (_value: string, key: { ctrl?: boolean; name?: string }) => {
      if (key.ctrl && key.name === 'c') {
        process.exitCode = 130;
        cleanup();
        return;
      }

      switch (key.name) {
        case 'up': {
          activeIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
          renderFrame(true);
          return;
        }

        case 'down': {
          activeIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
          renderFrame(true);
          return;
        }

        case 'left':
        case 'pageup': {
          jumpPage(-1);
          return;
        }

        case 'right':
        case 'pagedown': {
          jumpPage(1);
          return;
        }

        case 'home': {
          activeIndex = 0;
          renderFrame(true);
          return;
        }

        case 'end': {
          activeIndex = items.length - 1;
          renderFrame(true);
          return;
        }

        case 'return':
        case 'escape':
        case 'q': {
          cleanup();
          return;
        }
      }
    };

    stdin.on('keypress', onKeypress);
  });
}

export const listCommand: Command = program
  .command('list')
  .aliases(['ls', 'l'])
  .description('List all widgets in the current workspace')
  .option('-d --depth <number>', 'Maximum directory depth to search for widget files', parseInt)
  .option('--page-size <number>', 'Number of widgets displayed per page in visual mode', parseInt)
  .option('-i --ignore <patterns...>', 'Specify patterns to ignore when listing widgets', (value) =>
    String(value ?? '')
      .split(',')
      .map((pattern) => pattern.trim()),
  )
  .action(async (options: { depth?: number; ignore?: string[]; pageSize?: number }) => {
    const [
      { Workspace },
      { default: ora },
      { default: cliSpinners },
      { default: chalk },
      { Widget },
    ] = await Promise.all([
      import('../lib/workspace.js'),
      import('ora'),
      import('cli-spinners'),
      import('chalk'),
      import('../lib/widget.js'),
    ]);

    const spinner = ora({
      text: 'Loading workspace configuration...',
      color: 'magenta',
      spinner: cliSpinners.dotsCircle,
    });

    spinner.start();

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
        spinner.fail('Invalid widget configuration in .tixyel file');
        process.exit(1);
        return;
      }

      workspace.root = join(process.cwd(), data.path);

      widget.relativePath = relative(workspace.root, widget.path);

      spinner.succeed(`Loaded widget configuration for ${widget.config.name} from .tixyel file`);
    }

    spinner.start();

    const widgets = await workspace.findWidgets(options.depth, options.ignore);

    if (!widgets.length) {
      spinner.info('No widgets found in the workspace');
      process.exit(0);
    }

    spinner.succeed(`Found ${widgets.length} widget(s) in the workspace`);

    const pageSize = clamp(
      options.pageSize ?? Math.max(5, (process.stdout.rows ?? 18) - 12),
      5,
      20,
    );
    const items = normalizeListItems(widgets);

    await renderInteractivePages(items, pageSize, chalk);
  });
