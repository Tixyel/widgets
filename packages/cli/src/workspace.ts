import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import type { ObfuscatorOptions } from 'javascript-obfuscator';
import type autoprefixer from 'autoprefixer';
import type cssnanoPlugin from 'cssnano';
import { transform } from 'esbuild';
import { resolve } from 'path';

export type ScaffoldItem = ScaffoldFile | ScaffoldFolder;

export interface ScaffoldFile {
  name: string;
  type: 'file';
  content: string;
}

export interface ScaffoldFolder {
  name: string;
  type: 'folder';
  content?: ScaffoldItem[];
}

export interface WorkspaceConfig<Find extends BuildFindMap = BuildFindMap> {
  /**
   * Search options for locating widget files
   */
  search?: {
    /**
     * Maximum directory depth to search
     */
    maxDepth?: number;
    /**
     * Folders and files to ignore during search
     */
    ignore?: string[];
  };

  /**
   * Metadata applied to all widgets in the workspace
   */
  metadata?: {
    name?: string;
    author?: string;
    clientId?: string;
    description?: string;
    tags?: string[];
    // [key: string]: unknown;
  };
  dirs?: {
    entry?: string;
    output?: string;
    compacted?: string;
  };

  /**
   * Scaffold structure to create when generating a new widget
   */
  scaffold?: ScaffoldItem[];

  /**
   * Build configuration
   */
  build?: {
    /**
     * Run builds in parallel
     */
    parallel?: boolean;

    /**
     * Verbose output during build
     */
    verbose?: boolean;

    /**
     * File patterns to locate widget files
     */
    find?: Find;
    /**
     * Mapping of output files to find keys
     */
    result?: BuildResultMap<Find>;
    /**
     * Mapping of widgetIO output files to find keys
     */
    widgetIO?: BuildResultMap<Find>;

    /**
     * Obfuscation and minification settings
     */
    obfuscation?: {
      /**
       * JavaScript obfuscation options
       */
      javascript?: ObfuscatorOptions;
      /**
       * CSS minification options
       */
      css?: {
        /**
         * Remove nesting rules
         */
        removeNesting?: boolean;
        /**
         * Autoprefixer options
         */
        autoprefixer?: autoprefixer.Options;
        /**
         * cssnano options
         */
        cssnano?: cssnanoPlugin.Options;
      };
      /**
       * HTML minification options
       */
      html?: HtmlMinifierOptions;
    };
  };
}

type BuildFindMap = Record<string, string[]>;
type BuildResultMap<Find extends BuildFindMap> = Record<string, keyof Find>;

const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  search: {
    maxDepth: 3,
    ignore: ['node_modules', 'dist', '.git', '.turbo', '.vscode'],
  },

  dirs: {
    entry: 'development',
    output: 'finished',
    compacted: 'widgetIO',
  },

  scaffold: [
    {
      name: 'development',
      type: 'folder',
      content: [
        {
          name: 'index.html',
          type: 'file',
          content: ``,
        },
        {
          name: 'style.css',
          type: 'file',
          content: ``,
        },
        {
          name: 'script.js',
          type: 'file',
          content: ``,
        },
        {
          name: 'fields.json',
          type: 'file',
          content: '{}',
        },
        {
          name: 'data.json',
          type: 'file',
          content: '{}',
        },
      ],
    },
    {
      name: 'finished',
      type: 'folder',
    },
    {
      name: 'widgetIO',
      type: 'folder',
    },
  ],

  build: {
    parallel: true,
    verbose: false,

    find: {
      html: ['index.html'],
      script: ['script.js'],
      css: ['style.css'],
      fields: ['fields.json'],
    },
    result: {
      'HTML.html': 'html',
      'SCRIPT.js': 'script',
      'CSS.css': 'css',
      'FIELDS.json': 'fields',
    },
    widgetIO: {
      'html.txt': 'html',
      'js.txt': 'script',
      'css.txt': 'css',
      'fields.txt': 'fields',
    },

    obfuscation: {
      javascript: {},
      css: {
        removeNesting: true,
        autoprefixer: {
          overrideBrowserslist: ['Chrome 127'],
        },
        cssnano: {},
      },
      html: {},
    },
  },
};

// Helper to preserve literal keys for autocomplete in find/result
export function defineWorkspaceConfig<const Find extends BuildFindMap>(config: WorkspaceConfig<Find>): WorkspaceConfig<Find> {
  config.dirs = {
    ...DEFAULT_WORKSPACE_CONFIG.dirs,
    ...config.dirs,
  };
  config.build = {
    ...(DEFAULT_WORKSPACE_CONFIG.build as WorkspaceConfig<Find>['build']),
    ...config.build,
  };
  config.build.find = {
    ...(DEFAULT_WORKSPACE_CONFIG.build!.find as Find),
    ...config.build.find,
  };
  config.build.result = {
    ...DEFAULT_WORKSPACE_CONFIG.build!.result,
    ...config.build.result,
  };
  config.search = {
    ...DEFAULT_WORKSPACE_CONFIG.search,
    ...config.search,
  };

  config.scaffold = config.scaffold || DEFAULT_WORKSPACE_CONFIG.scaffold;

  return config;
}

export async function findWorkspaceRoot(startPath: string = process.cwd()): Promise<string | null> {
  let currentPath = resolve(startPath);

  // Limit search to 10 levels up to avoid infinite loops
  for (let i = 0; i < 10; i++) {
    const configTs = resolve(currentPath, 'tixyel.config.ts');
    const configJs = resolve(currentPath, 'tixyel.config.js');
    const configPathMjs = resolve(currentPath, 'tixyel.config.mjs');

    if (existsSync(configTs) || existsSync(configJs) || existsSync(configPathMjs)) {
      return currentPath;
    }

    const parentPath = resolve(currentPath, '..');
    if (parentPath === currentPath) {
      // Reached filesystem root
      break;
    }

    currentPath = parentPath;
  }

  return null;
}

export async function validateWorkspace() {
  const root = await findWorkspaceRoot();

  if (!root) {
    throw new Error('❌ Your workspace is not initialized. Please run `tixyel init` in your workspace root first.');
  }

  return root;
}

async function loadTsConfig(path: string, root: string) {
  const temp = resolve(root, '.tixyel.config.temp.mjs');
  const tsContent = readFileSync(path, 'utf-8');

  const { code } = await transform(tsContent, {
    loader: 'ts',
    format: 'esm',
    target: 'es2022',
  });

  writeFileSync(temp, code, 'utf-8');

  try {
    const mod = await import(`file://${temp}?t=${Date.now()}`);

    return mod.default ?? mod.config;
  } finally {
    try {
      unlinkSync(temp);
    } catch {}
  }
}

export async function loadWorkspace(path: string) {
  const configPathTs = resolve(path, 'tixyel.config.ts');
  const configPathJs = resolve(path, 'tixyel.config.js');
  const configPathMjs = resolve(path, 'tixyel.config.mjs');

  let config: WorkspaceConfig | undefined;

  try {
    // Trying .mjs first (already ES module)
    if (existsSync(configPathMjs)) {
      const module = await import(`file://${configPathMjs}`);
      config = module.default || module.config;
    }
    // Trying .js (if package.json has type: module)
    else if (existsSync(configPathJs)) {
      const module = await import(`file://${configPathJs}`);
      config = module.default || module.config;
    }
    // Trying .ts file (compile on-the-fly)
    else if (existsSync(configPathTs)) {
      config = await loadTsConfig(configPathTs, path);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load tixyel.config: ${error}`);
    throw error;
  }

  return merge(config);
}

function merge(config: WorkspaceConfig | undefined) {
  const merged: WorkspaceConfig = {
    ...config,
    search: {
      ...DEFAULT_WORKSPACE_CONFIG.search,
      ...config?.search,
    },
    metadata: {
      ...DEFAULT_WORKSPACE_CONFIG.metadata,
      ...config?.metadata,
    },
    dirs: {
      ...DEFAULT_WORKSPACE_CONFIG.dirs,
      ...config?.dirs,
    },
    scaffold: config?.scaffold || DEFAULT_WORKSPACE_CONFIG.scaffold,
    build: {
      ...DEFAULT_WORKSPACE_CONFIG.build,
      ...config?.build,
      find: {
        ...DEFAULT_WORKSPACE_CONFIG.build!.find,
        ...config?.build?.find,
      },
      result: {
        ...DEFAULT_WORKSPACE_CONFIG.build!.result,
        ...config?.build?.result,
      },
      widgetIO: {
        ...DEFAULT_WORKSPACE_CONFIG.build!.widgetIO,
        ...config?.build?.widgetIO,
      },
      obfuscation: {
        ...DEFAULT_WORKSPACE_CONFIG.build!.obfuscation,
        ...config?.build?.obfuscation,
      },
    },
  };

  return merged;
}
