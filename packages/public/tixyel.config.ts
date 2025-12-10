import { defineWorkspaceConfig } from '@tixyel/cli';

export default defineWorkspaceConfig({
  search: {
    maxDepth: 3,
    ignore: ['node_modules', 'dist', 'build', '.git'],
  },

  metadata: {
    author: 'Your Name',
    clientId: 'your-client-id',
  },

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
          name: 'style.css',
          type: 'file',
          content: '',
        },
        {
          name: 'script.js',
          type: 'file',
          content: '',
        },
        {
          name: 'resources.js',
          type: 'file',
          content: ``,
        },
        {
          name: 'panel.js',
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

  dirs: {
    entry: 'development',
    output: 'finished',
    compacted: 'widgetIO',
  },

  build: {
    parallel: true,
    verbose: false,

    find: {
      html: ['index.html'],
      script: ['index.js', 'resources.js', 'script.js'],
      css: ['styles.css', 'style.css'],
      fields: ['fields.json', 'cf.json', 'cf.jsonc', 'fields.jsonc'],
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
});
