import type { Options as AutoprefixerOptions } from 'autoprefixer';
import type { Options as CssnanoOptions } from 'cssnano';
import type { ObfuscatorOptions } from 'javascript-obfuscator';
import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';

/**
 * Schema for tixyel.config.ts configuration file
 */
export interface TixyelCliConfig {
  /**
   * Search configuration
   */
  search?: {
    /**
     * Maximum depth to search for .tixyel files
     */
    maxDepth?: number;

    /**
     * Folders to ignore during search
     */
    ignore?: string[];
  };

  /**
   * Defaults for generating new widgets
   */
  generationDefaults?: {
    /**
     * Default author for new widgets
     */
    author?: string;

    /**
     * Default minify setting
     */
    minify?: boolean;

    /**
     * Default platform
     */
    platform?: 'streamelements';

    /**
     * File/folder structure to create when generating a widget
     */
    scaffold?: ScaffoldItem[];
  };

  /**
   * Build configuration
   */
  build?: {
    /**
     * Run builds in parallel
     */
    parallel?: boolean;

    /**
     * Verbose output
     */
    verbose?: boolean;

    /**
     * Default file patterns for widgets
     */
    find?: {
      html?: string[];
      css?: string[];
      script?: string[];
      fields?: string[];
    };

    /**
     * Default output file mapping
     */
    finished?: {
      [key: string]: 'html' | 'css' | 'script' | 'fields';
    };

    /**
     * Obfuscation options per file type
     */
    obfuscation?: {
      /**
       * JavaScript obfuscation options
       */
      javascript?: ObfuscatorOptions;

      /**
       * CSS processing options
       */
      css?: {
        removeNesting?: boolean;
        autoprefixer?: AutoprefixerOptions;
        cssnano?: CssnanoOptions;
      };

      /**
       * HTML minification options
       */
      html?: HtmlMinifierOptions;
    };
  };
}

/**
 * Represents a file or folder in the scaffold
 */
export type ScaffoldItem = ScaffoldFile | ScaffoldFolder;

/**
 * File in scaffold
 */
export interface ScaffoldFile {
  name: string;
  type: 'file';
  content: string;
}

/**
 * Folder in scaffold
 */
export interface ScaffoldFolder {
  name: string;
  type: 'folder';
  content?: ScaffoldItem[];
}

/**
 * Required configuration with all defaults
 */
export interface RequiredCliConfig {
  search: Required<NonNullable<TixyelCliConfig['search']>>;
  generationDefaults: Required<NonNullable<TixyelCliConfig['generationDefaults']>>;
  build: {
    parallel: boolean;
    verbose: boolean;
    find: {
      html: string[];
      css: string[];
      script: string[];
      fields: string[];
    };
    finished: {
      [key: string]: 'html' | 'css' | 'script' | 'fields';
    };
    obfuscation: {
      javascript: ObfuscatorOptions;
      css: {
        removeNesting: boolean;
        autoprefixer: AutoprefixerOptions;
        cssnano: CssnanoOptions;
      };
      html: HtmlMinifierOptions;
    };
  };
}

/**
 * Default CLI configuration
 */
export const DEFAULT_CLI_CONFIG: RequiredCliConfig = {
  search: {
    maxDepth: 3,
    ignore: ['node_modules', 'dist', '.git', '.turbo'],
  },
  generationDefaults: {
    author: 'Tixyel',
    minify: true,
    platform: 'streamelements',
    scaffold: [
      {
        name: 'development',
        type: 'folder',
        content: [
          {
            name: 'index.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="widget">
    <!-- Widget content here -->
  </div>
  <script src="script.js"></script>
</body>
</html>`,
          },
          {
            name: 'script.js',
            type: 'file',
            content: `// Widget script
console.log('Widget loaded');
`,
          },
          {
            name: 'fields.json',
            type: 'file',
            content: `{
  "title": "Widget Fields",
  "fields": []
}`,
          },
          {
            name: 'data.json',
            type: 'file',
            content: `{
  "title": "Widget Data"
}`,
          },
          {
            name: 'style.css',
            type: 'file',
            content: `/* Widget styles */
body {
  margin: 0;
  padding: 0;
}

#widget {
  /* Add your styles here */
}`,
          },
        ],
      },
      {
        name: 'finished',
        type: 'folder',
      },
    ],
  },
  build: {
    parallel: false,
    verbose: false,
    find: {
      html: ['index.html'],
      css: ['style.css'],
      script: ['resources.js', 'script.js'],
      fields: ['cf.json', 'fields.json'],
    },
    finished: {
      'HTML.html': 'html',
      'CSS.css': 'css',
      'SCRIPT.js': 'script',
      'FIELDS.json': 'fields',
    },
    obfuscation: {
      javascript: {
        compact: true,
        log: false,
        debugProtection: false,
        selfDefending: false,
        deadCodeInjection: false,
        controlFlowFlattening: false,
        stringArray: false,
        simplify: false,
        identifierNamesGenerator: 'mangled',
      },
      css: {
        removeNesting: true,
        autoprefixer: {
          overrideBrowserslist: ['Chrome 127'],
        },
        cssnano: {
          preset: 'default',
        },
      },
      html: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: false,
      },
    },
  },
};

/**
 * Merges user config with defaults
 */
export function mergeCliConfig(userConfig: TixyelCliConfig | undefined): RequiredCliConfig {
  return {
    search: {
      maxDepth: userConfig?.search?.maxDepth ?? DEFAULT_CLI_CONFIG.search.maxDepth,
      ignore: userConfig?.search?.ignore ?? DEFAULT_CLI_CONFIG.search.ignore,
    },
    generationDefaults: {
      author: userConfig?.generationDefaults?.author ?? DEFAULT_CLI_CONFIG.generationDefaults.author,
      minify: userConfig?.generationDefaults?.minify ?? DEFAULT_CLI_CONFIG.generationDefaults.minify,
      platform: userConfig?.generationDefaults?.platform ?? DEFAULT_CLI_CONFIG.generationDefaults.platform,
      scaffold: userConfig?.generationDefaults?.scaffold ?? DEFAULT_CLI_CONFIG.generationDefaults.scaffold,
    },
    build: {
      parallel: userConfig?.build?.parallel ?? DEFAULT_CLI_CONFIG.build.parallel,
      verbose: userConfig?.build?.verbose ?? DEFAULT_CLI_CONFIG.build.verbose,
      find: {
        html: userConfig?.build?.find?.html ?? DEFAULT_CLI_CONFIG.build.find.html,
        css: userConfig?.build?.find?.css ?? DEFAULT_CLI_CONFIG.build.find.css,
        script: userConfig?.build?.find?.script ?? DEFAULT_CLI_CONFIG.build.find.script,
        fields: userConfig?.build?.find?.fields ?? DEFAULT_CLI_CONFIG.build.find.fields,
      },
      finished: userConfig?.build?.finished ?? DEFAULT_CLI_CONFIG.build.finished,
      obfuscation: {
        javascript: userConfig?.build?.obfuscation?.javascript ?? DEFAULT_CLI_CONFIG.build.obfuscation.javascript,
        css: {
          removeNesting: userConfig?.build?.obfuscation?.css?.removeNesting ?? DEFAULT_CLI_CONFIG.build.obfuscation.css.removeNesting,
          autoprefixer: userConfig?.build?.obfuscation?.css?.autoprefixer ?? DEFAULT_CLI_CONFIG.build.obfuscation.css.autoprefixer,
          cssnano: userConfig?.build?.obfuscation?.css?.cssnano ?? DEFAULT_CLI_CONFIG.build.obfuscation.css.cssnano,
        },
        html: userConfig?.build?.obfuscation?.html ?? DEFAULT_CLI_CONFIG.build.obfuscation.html,
      },
    },
  };
}
