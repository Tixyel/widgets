/**
 * Schema for .tixyel configuration file
 */
export interface TixyelConfig {
  /**
   * Widget name
   */
  name: string;

  /**
   * Widget version (default: 1.0.0)
   */
  version?: string;

  /**
   * Widget description
   */
  description?: string;

  /**
   * Entry point directory (default: development)
   */
  entry?: string;

  /**
   * Output directory (default: finished)
   */
  outDir?: string;

  /**
   * Relative path to tixyel.config.ts from this file's directory
   * Auto-calculated during widget generation
   */
  configPath?: string;

  /**
   * Additional build configuration
   */
  build?: {
    /**
     * Minify output
     */
    minify?: boolean;

    /**
     * File patterns to find and merge
     */
    find?: {
      html?: string[];
      css?: string[];
      script?: string[];
      fields?: string[];
    };

    /**
     * Output file mapping
     */
    finished?: {
      [key: string]: 'html' | 'css' | 'script' | 'fields';
    };
  };

  /**
   * Widget metadata
   */
  metadata?: {
    author?: string;
    tags?: string[];
    /**
     * Platform - currently only StreamElements is supported
     */
    platform?: 'streamelements';
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_TIXYEL_CONFIG = {
  version: '1.0.0',
  entry: 'development',
  outDir: 'finished',
} as const;

/**
 * Validates a Tixyel configuration object
 */
export function validateTixyelConfig(config: unknown): config is TixyelConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const cfg = config as Record<string, unknown>;

  // Required fields
  if (typeof cfg.name !== 'string' || !cfg.name) {
    return false;
  }

  return true;
}

/**
 * Applies default values to a configuration object
 */
export function applyDefaults(config: TixyelConfig): Omit<Required<TixyelConfig>, 'configPath'> & { configPath?: string } {
  return {
    name: config.name,
    version: config.version || DEFAULT_TIXYEL_CONFIG.version,
    description: config.description ?? '',
    entry: config.entry ?? DEFAULT_TIXYEL_CONFIG.entry,
    outDir: config.outDir ?? DEFAULT_TIXYEL_CONFIG.outDir,
    configPath: config.configPath,
    build: config.build
      ? {
          minify: config.build.minify ?? false,
          find: config.build.find,
          finished: config.build.finished,
        }
      : { minify: false },
    metadata: config.metadata ?? { platform: 'streamelements' },
  };
}
