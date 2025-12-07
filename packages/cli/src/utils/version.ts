import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'jsonc-parser';
import type { TixyelConfig } from '../types/tixyel-config.js';

/**
 * Version bump types
 */
export type VersionBump = 'major' | 'minor' | 'patch';

/**
 * Bumps the version of a widget configuration
 */
export async function bumpWidgetVersion(widgetPath: string, bumpType: VersionBump = 'patch'): Promise<string | null> {
  try {
    const configPath = join(widgetPath, '.tixyel');
    const content = await readFile(configPath, 'utf-8');
    const config = parse(content) as TixyelConfig;

    if (!config.version) {
      config.version = '0.0.0';
    }

    // Parse current version
    const [major, minor, patch] = config.version.split('.').map(Number);

    // Calculate new version
    let newVersion: string;
    switch (bumpType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    // Update config
    config.version = newVersion;

    // Write back to file (JSON format)
    const formattedContent = JSON.stringify(config, null, 2);
    await writeFile(configPath, formattedContent, 'utf-8');

    return newVersion;
  } catch (error) {
    console.error(`Failed to bump version in ${widgetPath}:`, error);
    return null;
  }
}

/**
 * Prompts user to select version bump type
 */
export async function promptVersionBump(): Promise<VersionBump> {
  // This will be used with inquirer in the build command
  return 'patch'; // Default, will be replaced with prompt
}
