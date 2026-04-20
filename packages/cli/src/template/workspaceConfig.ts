export const WORKSPACE_CONFIG_TEMPLATE = `
import { defineConfig } from '@tixyel/cli/api';

export default defineConfig({
  search: {
    maxDepth: 3,
    ignore: ['node_modules', 'dist', 'build', '.git'],
  },

  metadata: {
    author: 'Your Name',
  },

  dirs: {
    entry: 'development',
    output: 'finished',
    shared: 'shared',
    extension: 'widgetIO',
  },

  scaffold: {
    single: [
      {
        name: 'development', 
        type: 'folder',
        content: [
          {
            name: 'index.html',
            type: 'file',
            content: \`\`,
          },
          {
            name: 'style.css',
            type: 'file',
            content: \`\`,
          },
          {
            name: 'script.js',
            type: 'file',
            content: \`\`,
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
    multiple: [
      {
        name: "development",
        type: "folder",
        content: [
          {
            name: "index.html",
            type: "file",
            content: 'htmlTemplate',
          },
          {
            name: "style.css",
            type: "file",
            content: 'cssTemplate',
          },
          {
            name: "script.ts",
            type: "file",
            content: 'scriptTemplate',
          },
          {
            name: "fields.json",
            type: "file",
            content: "{}",
          },
          {
            name: "data.json",
            type: "file",
            content: "{}",
          },
        ],
      },
      {
        name: "shared",
        type: "folder",
        content: [
          {
            name: "style.css",
            type: "file",
            content: 'sharedStyleTemplate',
          },
          {
            name: "script.ts",
            type: "file",
            content: 'sharedScriptTemplate',
          },
        ],
      },
      {
        name: "finished",
        type: "folder",
      },
      {
        name: "widgetIO",
        type: "folder",
      },
    ],
  },

  build: {
    parallel: true,
    verbose: false,

    find: {
      html: ['index.html'],
      script: ['script.js',],
      css: ['style.css'],
      fields: ['fields.json', 'fields.jsonc'],
    },
    shared: {
      'shared script': ['script.js'],
      'shared style': ['style.css'],
      'shared fields': ['fields.json'],
    },
    result: {
      'HTML.html': ['html'],
      'SCRIPT.js': ['shared script', 'script'],
      'CSS.css': ['shared style', 'css'],
      'FIELDS.json': ['fields', 'shared fields'],
    },
    widgetIO: {
      'html.txt': ['html'],
      'SCRIPT.js': ['shared script', 'script'],
      'CSS.css': ['shared style', 'css'],
      'FIELDS.json': ['fields', 'shared fields'],
    },

    htmlRegex: /<body[^>]*>([\\s\\S]*?)<\\/body>/i,

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
          overrideBrowserslist: ['Chrome 93'],
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
});
`.trim();
