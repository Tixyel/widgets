import { defineConfig, type OxfmtConfig } from 'oxfmt';

export default defineConfig({
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  endOfLine: 'crlf',
  htmlWhitespaceSensitivity: 'css',
  insertFinalNewline: true,
  jsxSingleQuote: true,
  objectWrap: 'preserve',

  printWidth: 100,
  proseWrap: 'preserve',
  quoteProps: 'preserve',
  semi: true,
  singleAttributePerLine: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',

  sortPackageJson: true,
  sortImports: { order: 'asc' },

  overrides: [{ options: { trailingComma: 'none' }, files: ['*.tixyel'] }],

  ignorePatterns: [
    'dist',
    'build',
    'coverage',
    '*.md',
    'node_modules',
    '*.env',
    '.turbo',
    '.github',
    '.changeset',
  ],
} as OxfmtConfig);
