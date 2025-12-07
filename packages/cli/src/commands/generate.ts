import { resolve, basename, join, dirname } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import inquirer from 'inquirer';
import type { Command as CommanderCommand } from 'commander';
import { loadCliConfig } from '../utils/load-cli-config.js';
import { validateWorkspaceInit, getConfigPathFromWidget } from '../utils/workspace.js';
import { Command } from './base.js';

/**
 * Generate command
 */
export class GenerateCommand extends Command {
  name = 'generate';
  description = 'Generate a new widget (path defaults to current directory)';

  register(command: CommanderCommand): void {
    command
      .command(`${this.name} [path] [name] [description] [tags]`)
      .description(this.description)
      .action((...args) => this.execute(...args));
  }

  async execute(targetPath?: string, widgetName?: string, description?: string, tags?: string): Promise<void> {
    try {
      // Validate workspace is initialized
      const workspaceRoot = await validateWorkspaceInit();

      const rootPath = process.cwd();

      // Load CLI config from workspace root
      const cliConfig = await loadCliConfig(workspaceRoot);

      // Default to current directory if no path provided
      const resolvedPath = targetPath ? resolve(rootPath, targetPath.replace(/[/\\]$/, '')) : rootPath;
      const isTarget = targetPath ? isTargetDirectory(targetPath) : false;

      console.log('🎨 Generating widget...\n');

      if (isTarget) {
        // Path ends with / -> use as target directory
        const folderName = basename(resolvedPath);
        await createWidget(resolvedPath, folderName, description, tags, cliConfig, workspaceRoot);
      } else {
        // Path without / -> use as parent directory
        let finalWidgetName = widgetName;

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
        await createWidget(widgetPath, finalWidgetName, description, tags, cliConfig, workspaceRoot);
      }

      console.log('\n✨ Generation complete!');
    } catch (error) {
      console.error(`${error}`);
      process.exit(1);
    }
  }
}

/**
 * Determines if a path should be treated as a parent directory or target directory
 * Paths ending with / are treated as target directories
 */
function isTargetDirectory(path: string): boolean {
  return path.endsWith('/') || path.endsWith('\\');
}

/**
 * Gets the next widget number in a parent directory
 */
async function getNextWidgetNumber(parentPath: string): Promise<string> {
  try {
    if (!existsSync(parentPath)) {
      return '01';
    }

    // Check for existing widget folders
    const { readdirSync } = await import('fs');
    const entries = readdirSync(parentPath);
    const widgetNumbers = entries
      .filter((name) => /^\d+\s*-\s*/.test(name))
      .map((name) => parseInt(name.split('-')[0], 10))
      .filter((num) => !isNaN(num));

    const maxNum = widgetNumbers.length > 0 ? Math.max(...widgetNumbers) : 0;
    return String(maxNum + 1).padStart(2, '0');
  } catch {
    return '01';
  }
}

/**
 * Prompts for optional widget metadata
 */
async function promptMetadata(widgetName: string, initialDescription?: string, initialTags?: string): Promise<{ description: string; tags: string[] }> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Widget description:',
      default: initialDescription || '',
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Widget tags (comma-separated):',
      default: initialTags || '',
    },
  ]);

  const tagsArray = answers.tags
    ? (answers.tags as string)
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)
    : [];

  return {
    description: answers.description as string,
    tags: tagsArray,
  };
}

/**
 * Creates a widget with .tixyel configuration file
 */
async function createWidget(
  widgetPath: string,
  widgetName: string,
  description?: string,
  tagsStr?: string,
  cliConfig?: Awaited<ReturnType<typeof loadCliConfig>>,
  workspaceRoot?: string,
): Promise<void> {
  try {
    console.log(`📁 Creating widget: ${widgetName}`);
    console.log(`   Path: ${widgetPath}`);

    // Create directory
    await mkdir(widgetPath, { recursive: true });

    // Calculate config path if workspace root is provided
    const configPath = workspaceRoot ? getConfigPathFromWidget(widgetPath, workspaceRoot) : undefined;

    // Prompt for metadata if not provided
    const metadata = await promptMetadata(widgetName, description, tagsStr);

    // Create .tixyel configuration
    const tixyelConfig: any = {
      name: widgetName,
      description: metadata.description,
    };

    if (configPath) {
      tixyelConfig.configPath = configPath;
    }

    tixyelConfig.metadata = {
      author: cliConfig?.generationDefaults.author || 'Tixyel',
      tags: metadata.tags,
      platform: cliConfig?.generationDefaults.platform || 'streamelements',
    };

    const configFilePath = join(widgetPath, '.tixyel');
    await writeFile(configFilePath, JSON.stringify(tixyelConfig, null, 2), 'utf-8');

    // Create scaffold files from config
    const scaffold = cliConfig?.generationDefaults.scaffold || [];
    let createdFiles = 0;
    let createdFolders = 0;

    async function processScaffoldItem(item: any, basePath: string): Promise<void> {
      const fullPath = join(basePath, item.name);

      if (item.type === 'folder') {
        await mkdir(fullPath, { recursive: true });
        createdFolders++;

        // Process folder contents if any
        if (item.content && Array.isArray(item.content)) {
          for (const child of item.content) {
            await processScaffoldItem(child, fullPath);
          }
        }
      } else if (item.type === 'file') {
        // Write file
        await writeFile(fullPath, item.content || '', 'utf-8');
        createdFiles++;
      }
    }

    for (const item of scaffold) {
      await processScaffoldItem(item, widgetPath);
    }

    console.log(`✓ Created ${widgetName} successfully`);
    console.log(`   - Name: ${widgetName}`);
    if (metadata.description) {
      console.log(`   - Description: ${metadata.description}`);
    }
    if (metadata.tags.length > 0) {
      console.log(`   - Tags: ${metadata.tags.join(', ')}`);
    }
    if (configPath) {
      console.log(`   - Config path: ${configPath}`);
    }
    console.log(`   - .tixyel configuration created`);
    if (createdFiles > 0 || createdFolders > 0) {
      console.log(`   - Scaffold: ${createdFiles} file(s), ${createdFolders} folder(s)`);
    }
  } catch (error) {
    console.error(`❌ Failed to create widget: ${error}`);
    throw error;
  }
}
