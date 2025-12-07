import fastGlobModule from 'fast-glob';
import { dirname, relative } from 'path';
import { readTixyelConfig } from './config.js';
import type { TixyelConfig } from '../types/tixyel-config.js';

const glob = fastGlobModule;

export interface WidgetInfo {
  /**
   * Absolute path to the widget directory
   */
  path: string;

  /**
   * Relative path from the root directory
   */
  relativePath: string;

  /**
   * Parsed .tixyel configuration
   */
  config: TixyelConfig;
}

/**
 * Finds all .tixyel files in the workspace up to a specified depth
 */
export async function findWidgets(rootPath: string, maxDepth: number = 3, ignorePatterns: string[] = []): Promise<WidgetInfo[]> {
  // Build glob pattern with depth limit
  const depthPattern = Array.from({ length: maxDepth }, (_, i) => '*'.repeat(i + 1)).join(',');

  const pattern = `{${depthPattern}}/.tixyel`;

  // Build ignore patterns
  const ignore = ['node_modules', '.git', 'dist', ...ignorePatterns];

  // Find all .tixyel files
  const configFiles = await glob(pattern, {
    cwd: rootPath,
    absolute: true,
    onlyFiles: true,
    ignore,
  });

  // Read and parse each config
  const widgets: WidgetInfo[] = [];

  for (const configFile of configFiles) {
    const widgetPath = dirname(configFile);
    const config = await readTixyelConfig(widgetPath);

    if (config) {
      widgets.push({
        path: widgetPath,
        relativePath: relative(rootPath, widgetPath),
        config,
      });
    }
  }

  return widgets;
}
