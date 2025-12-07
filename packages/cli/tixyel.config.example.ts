import type { TixyelCliConfig } from '@tixyel/cli';

/**
 * Example tixyel.config.ts for workspace configuration
 *
 * Place this file in your workspace root to customize CLI behavior
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
    // Customize this to match your project structure
    scaffold: [
      {
        name: 'development',
        type: 'folder',
        content: [
          { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html>\n<body>\n  <div id="widget"></div>\n</body>\n</html>' },
          { name: 'script.js', type: 'file', content: '// Widget script\n' },
          { name: 'fields.json', type: 'file', content: '{\n  "fields": []\n}' },
          { name: 'data.json', type: 'file', content: '{}' },
          { name: 'style.css', type: 'file', content: '/* Widget styles */' },
        ],
      },
      { name: 'finished', type: 'folder' }, // Empty folder
    ],
  },

  // Build configuration
  build: {
    parallel: false,
    verbose: false,
  },
};

export default config;
