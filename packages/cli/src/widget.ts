import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { minify as minifyHTML } from 'html-minifier-terser';
import { ScaffoldItem, WorkspaceConfig } from './workspace';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { dirname, join, relative, resolve } from 'path';
import { readFile as readFilePromise } from 'fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdir, writeFile } from 'fs/promises';
import autoprefixer from 'autoprefixer';
import { isValidElement } from 'react';
import { parse } from 'jsonc-parser';
import nested from 'postcss-nested';
import FastGlob from 'fast-glob';
import inquirer from 'inquirer';
import postcss from 'postcss';
import cssnano from 'cssnano';
import JSZip from 'jszip';
import { transformSync } from 'esbuild';
import { watermark } from './utils/watermark.js';

export interface DotTixyel {
  name: string;
  description: string;
  version: string;
  config?: string;
  metadata: WorkspaceConfig['metadata'];
  dirs: WorkspaceConfig['dirs'];
}

export async function createWidget(path: string, metadata: WorkspaceConfig['metadata'], config: WorkspaceConfig, root: string) {
  try {
    console.log(`📁 Creating ${metadata?.name} at: ${path}`);

    // Create directory
    await mkdir(path, { recursive: true });

    // Calculate config path if workspace root is provided
    const configPath = root ? getConfigPathFromWidget(path, root) : undefined;

    // Prompt for metadata if not provided
    const widgetMetadata = await getMetadata(metadata);

    // Create .tixyel configuration
    const dotTixyel: DotTixyel = {
      name: metadata?.name as string,
      version: '0.0.0',
      description: widgetMetadata?.description || '',
      config: configPath,
      metadata: {
        ...config.metadata,
        ...widgetMetadata,
        name: undefined,
        description: undefined,
      },
      dirs: config.dirs || {
        entry: 'development',
        output: 'finished',
        compacted: 'compacted',
      },
    };

    await writeFile(resolve(path, '.tixyel'), JSON.stringify(dotTixyel, null, 2), 'utf-8');

    // Create scaffold files from the workspace config
    const scaffold = config.scaffold || [];

    let created = { files: 0, folders: 0 };

    async function serializeScaffoldContent(content: ScaffoldItem['content']): Promise<string> {
      if (content === undefined || content === null) return '';
      if (typeof content === 'string') return content;

      if (isValidElement(content)) {
        return renderToStaticMarkup(content);
      }

      // Fallback to string conversion for unexpected types
      return String(content ?? '');
    }

    async function processScaffoldItem(item: ScaffoldItem, basePath: string) {
      const fullPath = resolve(basePath, item.name);

      if (item.type === 'folder') {
        await mkdir(fullPath, { recursive: true });

        created.folders++;

        // Process folder children if any
        if (item.content && Array.isArray(item.content) && item.content.length) {
          for (const child of item.content) {
            await processScaffoldItem(child, fullPath);
          }
        }
      } else if (item.type === 'file') {
        const content = await serializeScaffoldContent(item.content);
        await writeFile(fullPath, content, 'utf-8');
        created.files++;
      }
    }

    for (const item of scaffold) {
      await processScaffoldItem(item, path);
    }

    console.log(`✅ Widget ${dotTixyel.name} created successfully!`);
    if (dotTixyel.description && dotTixyel.description.length) {
      console.log(`  - Description: ${dotTixyel.description}`);
    }
    if (dotTixyel.metadata?.tags && dotTixyel.metadata?.tags.length) {
      console.log(`  - Tags: ${dotTixyel.metadata.tags.join(', ')}`);
    }
    if (dotTixyel.config) {
      console.log(`  - Config Path: ${dotTixyel.config}`);
    }
    if (created.folders > 0 || created.files > 0) {
      console.log(`  - Scaffolded: ${created.folders} folders, ${created.files} files`);
    }
  } catch (error) {
    console.error('❌ Failed to create widget:', error);
    throw error;
  }
}

async function getMetadata(existingMetadata?: WorkspaceConfig['metadata']): Promise<WorkspaceConfig['metadata']> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Widget description:',
      default: existingMetadata?.description || '',
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Widget tags (comma-separated):',
      default: existingMetadata?.tags ? existingMetadata.tags.join(', ') : '',
    },
  ]);

  const tagsArray: string[] = answers.tags
    ? (answers.tags as string)
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length)
    : [];

  return {
    description: answers.description as string,
    tags: tagsArray,
  };
}

function getConfigPathFromWidget(widgetPath: string, workspaceRoot: string): string {
  const configTs = resolve(workspaceRoot, 'tixyel.config.ts');
  const configJs = resolve(workspaceRoot, 'tixyel.config.js');
  const configPathMjs = resolve(workspaceRoot, 'tixyel.config.mjs');

  const targetConfig = existsSync(configTs) ? configTs : existsSync(configJs) ? configJs : existsSync(configPathMjs) ? configPathMjs : null;

  if (!targetConfig) {
    throw new Error('❌ Workspace configuration file not found.');
  }

  const relativePath = relative(widgetPath, targetConfig);

  const normalized = relativePath.replace(/\\/g, '/');

  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

export async function getNextWidgetNumber(parentPath: string): Promise<string> {
  try {
    if (!existsSync(parentPath)) {
      return '01';
    }

    const entries = readdirSync(parentPath);
    const widgetNumbers = entries
      .filter((name) => /^\d+\s*-\s*/.test(name))
      .map((name) => parseInt(name.split('-')[0], 10))
      .filter((num) => !isNaN(num));

    const maxNum = widgetNumbers.length > 0 ? Math.max(...widgetNumbers) : 0;

    return String(maxNum + 1).padStart(2, '0');
  } catch (error) {
    return '01';
  }
}

async function merge(config: DotTixyel) {
  const merged: DotTixyel = {
    ...config,
    version: config.version || '0.0.0',
    description: config.description || '',
    metadata: {
      ...config.metadata,
    },
    dirs: {
      entry: 'development',
      output: 'finished',
      compacted: 'compacted',
      ...config.dirs,
    },
  };

  return merged;
}

export function validateDotTixyel(config: DotTixyel) {
  if (typeof config !== 'object' || !config || config === null || !config.name || typeof config.name !== 'string' || !config.name.trim().length) {
    throw new Error('❌ Invalid .tixyel: "name" is required and must be a non-empty string.');
  }

  return true;
}

export type WidgetInfo = {
  /**
   * Absolute path to the widget directory
   */
  path: string;
  /**
   * Relative path from the root directory
   */
  relativePath: string;
  /**
   * Parsed .tixyel configuration
   */
  config: DotTixyel;
};

export async function readDotTixyel(path: string): Promise<DotTixyel | null> {
  try {
    const dotTixyelPath = resolve(path, '.tixyel');
    if (!existsSync(dotTixyelPath)) {
      return null;
    }

    const content = await readFilePromise(dotTixyelPath, 'utf-8');
    const config = parse(content) as DotTixyel;

    if (!validateDotTixyel(config)) {
      console.error(`Invalid .tixyel configuration in ${path}`);
      return null;
    }

    return merge(config);
  } catch (error) {
    return null;
  }
}

export async function findWidgets(root: string, depth: number, ignore: string[]) {
  // Build glob pattern with depth limit
  const depthPattern = Array.from({ length: depth }, (_, i) => '*'.repeat(i + 1)).join(',');

  const pattern = `{${depthPattern}}/.tixyel`;

  // Build ignore patterns (folders and files)
  const ignorePatterns = ['node_modules', '.git', 'dist', ...ignore];

  // Find all .tixyel files
  const dotTixyels = await FastGlob(pattern, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    ignore: ignorePatterns,
  });

  const widgets: WidgetInfo[] = [];

  for (const dotTixyelPath of dotTixyels) {
    const path = dirname(dotTixyelPath);

    const config = await readDotTixyel(path);

    if (config) {
      widgets.push({
        path,
        relativePath: relative(root, path),
        config,
      });
    }
  }

  return widgets;
}

export async function build(widget: WidgetInfo, versionBump: 'none' | 'patch' | 'minor' | 'major', verbose: boolean = false, workspaceConfig: WorkspaceConfig) {
  console.log(`🔨 Building widget: ${widget.config.name}`);

  if (verbose) {
    console.log(`   - Path: ${widget.path}`);
  }

  if (versionBump !== 'none') {
    const newVersion = await bumpVersion(widget.path, versionBump);

    if (newVersion) {
      console.log(`   - Bumped version to: ${newVersion}`);

      widget.config.version = newVersion;
    }
  }

  if (widget.config && workspaceConfig) {
    try {
      await processBuild(widget, workspaceConfig, verbose);
    } catch (error) {
      console.error(`❌ Build failed for widget ${widget.config.name}:`, error);
      throw error;
    }
  } else {
    console.warn(`⚠️ Skipping build for widget ${widget.config.name}: Missing configuration.`);
    throw new Error('Missing configuration for build process.');
  }

  console.log(`✅ Build completed for widget: ${widget.config.name}`);
}

export async function processBuild(widget: WidgetInfo, workspaceConfig: WorkspaceConfig, verbose: boolean = false) {
  const entryDir = join(widget.path, widget.config.dirs?.entry || workspaceConfig.dirs?.entry || 'development');
  const outDir = join(widget.path, widget.config.dirs?.output || workspaceConfig.dirs?.output || 'finished');
  const compactedDir = join(widget.path, widget.config.dirs?.compacted || workspaceConfig.dirs?.compacted || 'widgetIO');

  if (!existsSync(entryDir)) {
    throw new Error(`Entry directory not found: ${entryDir}`);
  }

  mkdirSync(outDir, { recursive: true });

  const findPatterns = workspaceConfig.build?.find || {
    html: ['index.html'],
    script: ['script.js'],
    typescript: ['script.ts'],
    css: ['styles.css'],
    fields: ['fields.json'],
  };
  const resultMapping = workspaceConfig.build?.result || {
    'HTML.html': 'html',
    'SCRIPT.js': 'script',
    'CSS.css': 'css',
    'FIELDS.json': 'fields',
  };
  const compactedMapping = workspaceConfig.build?.widgetIO || {
    'html.txt': 'html',
    'js.txt': 'script',
    'css.txt': 'css',
    'fields.txt': 'fields',
  };

  // const results: Record<string, string> = {};

  const normalizeList = (value?: string[]): string[] => (Array.isArray(value) ? value.filter(Boolean) : []);

  const findAndRead = (baseDir: string, patterns: string[]) => {
    const contents: Record<string, string> = {};

    for (const pattern of patterns) {
      const fullPath = join(baseDir, pattern);

      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        contents[pattern] = content;
      }
    }

    return contents;
  };

  const usedWatermarks = new Set<string>();
  const processedFile = new Set<string>();

  /**
   * Build results processing
   * Find all files based on patterns and process them according to their type
   * (html, css, script, fields)
   * Group results based on resultMapping and compactedMapping
   * Compact/minify where applicable
   */
  const results: Record<keyof typeof findPatterns, string> = Object.fromEntries(
    await Promise.all(
      Object.entries(findPatterns).map(async ([key, patterns]) => {
        let result = '';

        let list = normalizeList(patterns.filter((p) => !processedFile.has(p)));

        if (!list.length) return [key, ''];

        const check = (keys: string | string[], formats: string | string[]) => {
          !Array.isArray(keys) && (keys = [keys]);
          !Array.isArray(formats) && (formats = [formats]);

          return (
            // check keys
            keys.some((k) => key.toLowerCase() === k.toLowerCase()) ||
            // check formats
            list.some((p) => formats.some((f) => p.toLowerCase().endsWith(f.toLowerCase())))
          );
        };

        const processed = new Set<string>();

        // Process HTML
        if (check('html', '.html')) {
          if (!usedWatermarks.has('html')) result += watermark.html(widget) + '\n';
          usedWatermarks.add('html');

          const fileList = list.filter((e) => e.endsWith('.html') && !processedFile.has(e));

          if (verbose) console.log(`  - Processing HTML for ${widget.config.name} [${key}, ${fileList.join(', ')}]...`);
          const files = findAndRead(entryDir, fileList);

          let mergedHTML = '';

          for await (const [pattern, fileContent] of Object.entries(files)) {
            // Extract body content
            const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch && bodyMatch[1]) {
              mergedHTML += bodyMatch[1].trim() + '\n';

              processedFile.add(pattern);
            }
          }

          const minified = await minifyHTML(mergedHTML, workspaceConfig.build?.obfuscation?.html);

          result += minified.trim();

          processed.add('html');
        }

        if (check(['css', 'style', 'styles'], '.css')) {
          if (!usedWatermarks.has('css')) result += watermark.css(widget) + '\n';
          usedWatermarks.add('css');

          const fileList = list.filter((e) => e.endsWith('.css') && !processedFile.has(e));

          if (verbose) console.log(`  - Processing CSS for ${widget.config.name} [${key}, ${fileList.join(', ')}]...`);
          const files = findAndRead(entryDir, fileList);

          let mergedCSS = '';

          for await (const [pattern, content] of Object.entries(files)) {
            const plugin: postcss.AcceptedPlugin[] = [
              autoprefixer({
                overrideBrowserslist: ['Chrome 127'],
                ...workspaceConfig.build?.obfuscation?.css?.autoprefixer,
              }),
              cssnano(workspaceConfig.build?.obfuscation?.css?.cssnano),
            ];

            if (workspaceConfig.build?.obfuscation?.css?.removeNesting) {
              plugin.unshift(nested());
            }

            const processed = await postcss(plugin).process(content, { from: undefined });

            mergedCSS += processed.css + '\n';

            processedFile.add(pattern);
          }

          if (processed.has('html')) {
            result = result += `<style>${mergedCSS.trim()}</style>`;
          } else result += mergedCSS.trim();

          processed.add('css');
        }

        if (check(['typescript', 'ts'], '.ts')) {
          if (!usedWatermarks.has('script')) result += watermark.script(widget) + '\n';

          usedWatermarks.add('script');

          const fileList = list.filter((e) => e.endsWith('.ts') && !processedFile.has(e));

          if (verbose) console.log(`  - Processing TypeScript for ${widget.config.name} [${key}, ${fileList.join(', ')}]...`);
          const files = findAndRead(entryDir, fileList);

          let mergedTS = '';

          for await (const [pattern, content] of Object.entries(files)) {
            try {
              const transpiled = transformSync(content, {
                loader: 'ts',
                target: 'es2021',
                format: 'iife',
              });

              mergedTS += transpiled.code + '\n';
            } catch (error) {
              console.warn(`   ⚠️  Failed to compile TypeScript: ${error}`);
              throw error;
            } finally {
              processedFile.add(pattern);
            }
          }

          // Obfuscate the compiled JavaScript
          const obfuscated = JavaScriptObfuscator.obfuscate(mergedTS.trim(), workspaceConfig.build?.obfuscation?.javascript);

          if (processed.has('html')) {
            result = result += `<script>${obfuscated.getObfuscatedCode()}</script>`;
          } else result += obfuscated.getObfuscatedCode();

          processed.add('typescript');
        }

        if (check(['script', 'js', 'javascript'], '.js')) {
          if (!usedWatermarks.has('script')) result += watermark.script(widget) + '\n';
          usedWatermarks.add('script');

          const fileList = list.filter((e) => e.endsWith('.js') && !processedFile.has(e));

          if (verbose) console.log(`  - Processing JavaScript for ${widget.config.name} [${key}, ${fileList.join(', ')}]...`);
          const files = findAndRead(entryDir, fileList);

          let mergedJS = '';

          for await (const [pattern, content] of Object.entries(files)) {
            const obfuscated = JavaScriptObfuscator.obfuscate(content, workspaceConfig.build?.obfuscation?.javascript);

            mergedJS += obfuscated.getObfuscatedCode() + '\n';

            processedFile.add(pattern);
          }

          if (processed.has('html')) {
            result = result += `<script>${mergedJS.trim()}</script>`;
          } else result += mergedJS.trim();

          processed.add('script');
        }

        if (check(['fields', 'fielddata', 'fieldData', 'cf', 'customfields'], '.json')) {
          const fileList = list.filter((e) => e.endsWith('.json') && !processedFile.has(e));

          if (verbose) console.log(`  - Processing JSON for ${widget.config.name} [${key}, ${fileList.join(', ')}]...`);
          const files = findAndRead(entryDir, fileList);

          let mergedFields = {};

          for await (const [pattern, content] of Object.entries(files)) {
            try {
              const noComments = parse(content);
              const parsed = JSON.parse(JSON.stringify(noComments));

              Object.assign(mergedFields, parsed);
            } catch (error) {
              console.warn(`   ⚠️  Failed to parse fields JSON: ${error}`);
              throw error;
            }
          }

          if (!processed.size) result += JSON.stringify(mergedFields, null, 2);

          processed.add('fields');
        }

        if (!result.length) {
          if (verbose) console.log(`  - Unknown build key: ${key}, the available keys are html, css, script and fields.`);

          result += '';
        }

        return [key, result];
      }),
    ),
  );

  if (verbose) {
    console.log(
      `   - Build results:`,
      Object.keys(results)
        .map((k) => `${k}: ${results[k].length} bytes`)
        .join(', '),
    );
  }

  for await (const [filename, key] of Object.entries(resultMapping)) {
    let content = '';
    if (typeof key === 'string') content = results[key];
    else if (Array.isArray(key)) {
      for await (const k of key) {
        const part = results[k];

        if (part) {
          content += '\n' + part;

          if (verbose) console.log(`   ✓ Merged part for: ${k}`);
        }
      }
    }

    if (content) {
      const outPath = join(outDir, filename);

      writeFileSync(outPath, content, 'utf-8');

      if (verbose) console.log(`   ✓ Written: ${outPath}`);
    }
  }

  // widgetIO zip
  try {
    const zip = new JSZip();

    for await (const [filename, key] of Object.entries(compactedMapping)) {
      let content = '';

      if (typeof key === 'string') content = results[key];
      else if (Array.isArray(key)) {
        for await (const k of key) {
          const part = results[k];

          if (part) {
            content += '\n' + part;

            if (verbose) console.log(`   ✓ Merged part for ZIP: ${k}`);
          }
        }
      }

      if (content) {
        zip.file(filename, content);

        if (verbose) console.log(`   ✓ Added to ZIP: ${filename}`);
      }
    }

    zip.file(
      'widget.ini',
      `[HTML]\npath = "html.txt"\n\n[CSS]\npath = "css.txt"\n\n[JS]\npath = "js.txt"\n\n[FIELDS]\npath = "fields.txt"\n\n[DATA]\npath = "data.txt"`,
    );

    // check if data.txt exists in results, otherwise create empty
    const dataContent = results['data'] || '{}';
    zip.file('data.txt', dataContent);

    const result = await zip
      .generateInternalStream({ type: 'base64' })
      .accumulate()
      .then((data) => data);

    const zipPath = join(compactedDir + '/' + widget.config.version || '0.0.0', `${widget.config.name}.zip`);

    mkdirSync(compactedDir + '/' + widget.config.version, { recursive: true });
    writeFileSync(zipPath, result, 'base64');
  } catch (error) {
    console.error(`❌ Failed to create widgetIO ZIP for widget ${widget.config.name}:`, error);
    throw error;
  }
}

export async function bumpVersion(widgetPath: string, bumpType: 'major' | 'minor' | 'patch' = 'patch'): Promise<string | null> {
  try {
    const configPath = join(widgetPath, '.tixyel');
    const content = await readFilePromise(configPath, 'utf-8');
    const config = parse(content) as DotTixyel;

    if (!config.version) {
      config.version = '0.0.0';
    }

    const [major, minor, patch] = config.version.split('.').map(Number);

    let newVersion: string;

    switch (bumpType) {
      case 'major': {
        newVersion = `${major + 1}.0.0`;
        break;
      }
      case 'minor': {
        newVersion = `${major}.${minor + 1}.0`;
        break;
      }
      case 'patch': {
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      }
    }

    config.version = newVersion;

    const formattedContent = JSON.stringify(config, null, 2);
    await writeFile(configPath, formattedContent, 'utf-8');

    return newVersion;
  } catch (error) {
    console.error(`Failed to bump version in ${widgetPath}:`, error);
    return null;
  }
}
