import { WorkspaceConfig, WorkspaceScaffold } from '../types/workspace';

export const WORKSPACE_DEFAULT_MAX_DEPTH = 3;
export const WORKSPACE_SEARCH_LIMIT = 50;

export const WORKSPACE_DEFAULT_WIDGET_DIRS = {
  entry: 'development',
  output: 'finished',
  shared: 'shared',
  extension: 'widgetIO',
} as const;

export const WORKSPACE_CONFIG_FILES = [
  'tixyel.config.ts',
  'tixyel.config.tsx',
  'tixyel.config.js',
  'tixyel.config.mjs',
  'tixyel.config.cjs',
  'tixyel.config.json',
  'tixyel.config.jsonc',
  '.tixyelrc',
  '.tixyelrc.json',
  '.tixyelrc.jsonc',
  '.tixyelrc.js',
  '.tixyelrc.ts',
  '.tixyelrc.mjs',
  '.tixyelrc.cjs',
] as const;

export const WORKSPACE_DEFAULT_IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  '.git',
  '.svn',
  '.hg',
] as const;

export const WORKSPACE_DEFAULT_SCAFFOLD: WorkspaceScaffold.Item[] = [
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
    name: 'resources',
    type: 'folder',
  },
];

export const WORKSPACE_DEFAULT_MULTIPLE_SCAFFOLD: WorkspaceScaffold.Item[] = [
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
    name: 'shared',
    type: 'folder',
    content: [
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
];

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  search: {
    maxDepth: WORKSPACE_DEFAULT_MAX_DEPTH,
    ignore: WORKSPACE_DEFAULT_IGNORE_PATTERNS as unknown as string[],
  },
  dirs: WORKSPACE_DEFAULT_WIDGET_DIRS,
  scaffold: {
    single: WORKSPACE_DEFAULT_SCAFFOLD,
    multiple: WORKSPACE_DEFAULT_SCAFFOLD,
  },
  build: {
    parallel: true,
    verbose: false,
    find: {
      html: ['index.html'],
      css: ['style.css'],
      script: ['script.js'],
      fields: ['fields.json'],
    },
    result: {
      'HTML.html': 'html',
      'CSS.css': 'css',
      'SCRIPT.js': 'script',
      'FIELDS.json': 'fields',
    },
    widgetIO: {
      'html.txt': 'html',
      'css.txt': 'css',
      'js.txt': 'script',
      'fields.txt': 'fields',
    },
    obfuscation: {
      html: {},
      css: {
        removeNesting: true,
        autoprefixer: {
          overrideBrowserslist: ['Chrome 127'],
        },
        cssnano: {},
      },
      javascript: {},
    },
    htmlRegex: /<body[^>]*>([\s\S]*?)<\/body>/i,
  },
};
