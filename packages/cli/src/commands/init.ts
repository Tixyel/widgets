import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Command } from './base.js';

/**
 * Init command - initializes a workspace
 */
export class InitCommand extends Command {
  name = 'init';
  description = 'Initialize a new Tixyel workspace';

  async execute(): Promise<void> {
    const rootPath = process.cwd();
    const configPath = resolve(rootPath, 'tixyel.config.ts');

    console.log('🚀 Initializing Tixyel workspace...\n');
    console.log(`📁 Workspace root: ${rootPath}\n`);

    // Create initial tixyel.config.ts
    const configContent = `import type { TixyelCliConfig } from '@tixyel/cli';

/**
 * Tixyel workspace configuration
 */
const config: TixyelCliConfig = {
  // Search configuration
  search: {
    maxDepth: 3,
    ignore: ['node_modules', 'dist', '.git', '.turbo', '.vscode'],
  },

  // Defaults for widget generation
  generationDefaults: {
    author: 'Your Name',
    minify: true,
    platform: 'streamelements',

    // File structure to create when generating a widget
    scaffold: [
      {
        name: 'development',
        type: 'folder',
        content: [
          {
            name: 'index.html',
            type: 'file',
            content: '',
          },
          {
            name: 'script.js',
            type: 'file',
            content: '',
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
          {
            name: 'style.css',
            type: 'file',
            content: '',
          },
        ],
      },
      {
        name: 'finished',
        type: 'folder',
      },
    ],
  },

  // Build configuration
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

export default config;
`;

    try {
      await writeFile(configPath, configContent, 'utf-8');
      console.log('✅ Created tixyel.config.ts');
      console.log('   Edit it to customize your workspace settings');
      console.log('\n✨ Workspace initialized! You can now use:');
      console.log('   - tixyel generate [path] - Generate new widgets');
      console.log('   - tixyel build - Build selected widgets');
    } catch (error) {
      console.error(`❌ Failed to initialize workspace: ${error}`);
      throw error;
    }
  }
}
