import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { minify as minifyHTML } from 'html-minifier-terser';
import JavaScriptObfuscator from 'javascript-obfuscator';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import nested from 'postcss-nested';
import type { TixyelConfig } from '../types/tixyel-config.js';
import type { RequiredCliConfig } from '../types/tixyel-cli-config.js';

export interface BuildOptions {
  widgetPath: string;
  config: TixyelConfig;
  cliConfig: RequiredCliConfig;
  verbose?: boolean;
}

/**
 * Processes and builds a widget
 */
export async function buildWidget(options: BuildOptions): Promise<void> {
  const { widgetPath, config, cliConfig, verbose } = options;

  const entryDir = join(widgetPath, config.entry || 'development');
  const outDir = join(widgetPath, config.outDir || 'finished');

  if (!existsSync(entryDir)) {
    throw new Error(`Entry directory not found: ${entryDir}`);
  }

  // Create output directory
  mkdirSync(outDir, { recursive: true });

  // Get file patterns - use widget config first, fallback to CLI config defaults
  const findPatterns = config.build?.find || cliConfig.build.find;
  const finishedMapping = config.build?.finished || cliConfig.build.finished;

  // Process each type
  const results: Record<string, string> = {};

  const normalizeList = (value?: string[]): string[] => (Array.isArray(value) ? value.filter(Boolean) : []);

  const htmlList = normalizeList(findPatterns.html);
  const cssList = normalizeList(findPatterns.css);
  const scriptList = normalizeList(findPatterns.script);
  const fieldsList = normalizeList(findPatterns.fields);

  // Process HTML
  if (htmlList.length > 0) {
    if (verbose) console.log(`  Processing HTML...`);
    results.html = await processHTML(entryDir, htmlList, cliConfig);
  }

  // Process CSS
  if (cssList.length > 0) {
    if (verbose) console.log(`  Processing CSS...`);
    results.css = await processCSS(entryDir, cssList, cliConfig);
  }

  // Process JavaScript
  if (scriptList.length > 0) {
    if (verbose) console.log(`  Processing JavaScript...`);
    results.script = await processJavaScript(entryDir, scriptList, cliConfig);
  }

  // Process Fields (JSON)
  if (fieldsList.length > 0) {
    if (verbose) console.log(`  Processing Fields...`);
    results.fields = await processFields(entryDir, fieldsList);
  }

  // Write output files based on finished mapping
  for (const [filename, type] of Object.entries(finishedMapping)) {
    const content = results[type];
    if (content) {
      const outputPath = join(outDir, filename);
      writeFileSync(outputPath, content, 'utf-8');
      if (verbose) console.log(`  ✓ Written: ${filename}`);
    }
  }
}

/**
 * Finds and reads files matching pattern
 */
function findAndReadFiles(baseDir: string, filenames: string[]): string[] {
  const contents: string[] = [];

  for (const filename of filenames) {
    const filePath = join(baseDir, filename);
    if (existsSync(filePath)) {
      contents.push(readFileSync(filePath, 'utf-8'));
    }
  }

  return contents;
}

/**
 * Processes HTML files - extracts <body> content only
 */
async function processHTML(baseDir: string, filenames: string[], cliConfig: RequiredCliConfig): Promise<string> {
  const files = findAndReadFiles(baseDir, filenames);
  let mergedHTML = '';

  for (const content of files) {
    // Extract body content
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      mergedHTML += bodyMatch[1] + '\n';
    }

    // Extract and inline <style> tags
    const styleMatches = content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    for (const match of styleMatches) {
      mergedHTML += `<style>${match[1]}</style>\n`;
    }

    // Extract and inline <script> tags
    const scriptMatches = content.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of scriptMatches) {
      mergedHTML += `<script>${match[1]}</script>\n`;
    }
  }

  // Minify HTML
  const minified = await minifyHTML(mergedHTML, cliConfig.build.obfuscation.html);
  return minified;
}

/**
 * Processes CSS files
 */
async function processCSS(baseDir: string, filenames: string[], cliConfig: RequiredCliConfig): Promise<string> {
  const files = findAndReadFiles(baseDir, filenames);
  let mergedCSS = '';

  for (const content of files) {
    // Process each file separately
    const plugins: postcss.AcceptedPlugin[] = [
      autoprefixer({ overrideBrowserslist: ['Chrome 127'], ...cliConfig.build.obfuscation.css.autoprefixer }),
      cssnano(cliConfig.build.obfuscation.css.cssnano),
    ];

    if (cliConfig.build.obfuscation.css.removeNesting) {
      plugins.unshift(nested());
    }

    const result = await postcss(plugins).process(content, { from: undefined });
    mergedCSS += result.css + '\n';
  }

  return mergedCSS.trim();
}

/**
 * Processes JavaScript files
 */
async function processJavaScript(baseDir: string, filenames: string[], cliConfig: RequiredCliConfig): Promise<string> {
  const files = findAndReadFiles(baseDir, filenames);
  let mergedJS = '';

  for (const content of files) {
    // Obfuscate each file separately
    const obfuscated = JavaScriptObfuscator.obfuscate(content, cliConfig.build.obfuscation.javascript);
    mergedJS += obfuscated.getObfuscatedCode() + '\n';
  }

  return mergedJS.trim();
}

/**
 * Processes Fields JSON files
 */
async function processFields(baseDir: string, filenames: string[]): Promise<string> {
  const files = findAndReadFiles(baseDir, filenames);

  // Merge all fields
  let mergedFields: any = {};

  for (const content of files) {
    try {
      const parsed = JSON.parse(content);
      mergedFields = { ...mergedFields, ...parsed };
    } catch (error) {
      console.warn(`  ⚠️  Failed to parse fields JSON: ${error}`);
    }
  }

  return JSON.stringify(mergedFields);
}
