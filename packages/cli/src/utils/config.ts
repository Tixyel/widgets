import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'jsonc-parser';
import type { TixyelConfig } from '../types/tixyel-config.js';
import { validateTixyelConfig, applyDefaults } from '../types/tixyel-config.js';

/**
 * Default search depth for finding .tixyel files
 */
export const DEFAULT_MAX_DEPTH = 3;

/**
 * Reads and parses a .tixyel configuration file (supports JSONC)
 * Applies default values for missing properties
 */
export async function readTixyelConfig(directory: string): Promise<TixyelConfig | null> {
  try {
    const configPath = join(directory, '.tixyel');
    const content = await readFile(configPath, 'utf-8');
    const config = parse(content);

    if (!validateTixyelConfig(config)) {
      console.error(`Invalid .tixyel configuration in ${directory}`);
      return null;
    }

    // Apply defaults and return the original config with defaults merged
    return applyDefaults(config as TixyelConfig);
  } catch (error) {
    return null;
  }
}

/**
 * Configuration for CLI settings
 */
export interface CliConfig {
  /**
   * Maximum depth to search for .tixyel files
   */
  maxDepth: number;
}

/**
 * Default CLI configuration
 */
export const defaultCliConfig: CliConfig = {
  maxDepth: DEFAULT_MAX_DEPTH,
};
