import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { basename, join, resolve } from 'path';

import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { transformSync } from 'esbuild';
import { minify as minifyHTML } from 'html-minifier-terser';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { parse } from 'jsonc-parser';
import JSZip from 'jszip';
import { Ora } from 'ora';
import postcss from 'postcss';
import nested from 'postcss-nested';

import { DotTixyel } from '../types/widget.js';
import { watermark } from '../utils/watermark.js';
import { DEFAULT_WORKSPACE_CONFIG } from './constants.workspace.js';
import { Workspace } from './workspace.js';

export namespace Widget {
  export type WidgetOptions = {
    path: string;
    config: DotTixyel;
    relativePath: string;
    workspace: Workspace.Service;
    content?: { folders: number; files: number };
  };

  export class Service {
    public path: string;
    public spinner?: Ora;
    public config: DotTixyel;
    public relativePath: string;
    public workspace: Workspace.Service;
    public content: { folders: number; files: number } = { folders: 0, files: 0 };

    constructor(options: WidgetOptions) {
      this.path = options.path;
      this.config = options.config;
      this.workspace = options.workspace;
      this.spinner = this.workspace.spinner;
      this.relativePath = options.relativePath;
      this.content = options.content ?? { folders: 0, files: 0 };
    }

    public async build(
      verbose: boolean = this.workspace.config.data.build?.verbose ?? false,
      versionBump: 'none' | 'patch' | 'minor' | 'major' = 'none',
    ) {
      if (versionBump !== 'none') {
        const newVersion = await this.bumpVersion(versionBump);

        if (this.spinner && this.spinner.isSpinning && verbose) {
          this.spinner.text = `Building widget ${this.config.name} (version bumped to ${newVersion})...`;
        }
      }

      try {
        const entryDir = join(
          this.path,
          this.config.dirs?.entry ?? this.workspace.config.data.dirs?.entry ?? 'development',
        );
        const outDir = join(
          this.path,
          this.config.dirs?.output ?? this.workspace.config.data.dirs?.output ?? 'finished',
        );
        const sharedDir = join(
          this.path,
          this.config.dirs?.shared ?? this.workspace.config.data.dirs?.shared ?? 'shared',
        );
        const extDir = join(
          this.path,
          this.config.dirs?.extension ?? this.workspace.config.data.dirs?.extension ?? 'widgetIO',
        );

        if (!existsSync(entryDir)) {
          throw new Error(`Entry directory does not exist: ${entryDir}`);
        }

        mkdirSync(outDir, { recursive: true });
        mkdirSync(extDir, { recursive: true });

        const findPatterns =
          this.config.build?.find ??
          this.workspace.config.data.build?.find ??
          DEFAULT_WORKSPACE_CONFIG.build?.find!;

        const sharedPatterns =
          this.config.build?.shared ??
          this.workspace.config.data.build?.shared ??
          DEFAULT_WORKSPACE_CONFIG.build?.shared!;

        const resultMapping =
          this.config.build?.result ??
          this.workspace.config.data.build?.result ??
          DEFAULT_WORKSPACE_CONFIG.build?.result!;

        const extensionMap =
          this.config.build?.widgetIO ??
          this.workspace.config.data.build?.widgetIO ??
          DEFAULT_WORKSPACE_CONFIG.build?.widgetIO!;

        const normalizeList = (value?: string[]): string[] =>
          Array.isArray(value) ? value.filter(Boolean) : [];

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

        // const shared = findAndRead(sharedDir, Object.values(sharedMap).flat());
        const shared = Object.entries(sharedPatterns).reduce(
          (acc, [key, patterns]) => {
            acc[key] = patterns.map((pattern) => `../../${basename(sharedDir)}/${pattern}`);

            return acc;
          },
          {} as Record<string, string[]>,
        );

        /**
         * Find all files based on patterns and process them according to their type (html, css, script, fields)
         * Group results based on resultMapping and extensionMap
         * Compact/minify where applicable
         */
        const buildTarget = async (entryDir: string, targetOutDir: string, zipName: string) => {
          const usedWatermarks = new Set<string>();
          const processedFiles = new Set<string>();
          const fieldKeys = ['fields', 'customfields', 'cf', 'fielddata', 'fieldData', 'data'];

          const resolveReplacement = (value: string): string => {
            const trimmed = value.trim();

            const candidates = new Set<string>();

            if (trimmed.startsWith('file://')) {
              candidates.add(trimmed.replace('file://', ''));
            }

            if (trimmed.startsWith('file:./')) {
              candidates.add(trimmed.replace('file:./', ''));
            }

            if (trimmed.startsWith('file:')) {
              candidates.add(trimmed.replace('file:', ''));
            }

            candidates.add(trimmed);

            for (const candidate of candidates) {
              if (!candidate) continue;

              if (existsSync(candidate)) {
                return readFileSync(candidate, 'utf-8');
              }

              const relativeCandidate = join(this.path, candidate);
              if (existsSync(relativeCandidate)) {
                return readFileSync(relativeCandidate, 'utf-8');
              }
            }

            return trimmed;
          };

          const replacePlaceholders = (content: string): string => {
            const applyReplacement = (match: string, rawKey: string, syntax: string): string => {
              const key = rawKey.trim();
              let replacement = this.config.replace?.[key];

              if (replacement) {
                if (verbose)
                  console.log(
                    `   ✓ Replaced placeholder (${syntax}): ${key} with "${replacement}"`,
                  );

                replacement = resolveReplacement(replacement);
              } else {
                if (verbose)
                  console.log(
                    `   ⚠️  No replacement found for placeholder (${syntax}): ${key}, keeping as is.`,
                  );
              }

              return replacement ?? match;
            };

            const extractTxReplaceAttributeKey = (match: string): string | null => {
              const attributeMatch = match.match(/\bkey\s*=\s*(["'])([\s\S]*?)\1/);

              return attributeMatch?.[2]?.trim() || null;
            };

            let replaced = content;

            // Common template syntaxes.
            // Example: {{widgetName}}
            replaced = replaced.replace(/{{\s*([A-Za-z0-9._-]+)\s*}}/g, (match, key) =>
              applyReplacement(match, key, '{{key}}'),
            );

            // Example: <tx-replace key="widgetName" />
            replaced = replaced.replace(/<\s*tx-replace\b[^>]*\/>/g, (match) => {
              const key = extractTxReplaceAttributeKey(match);

              return key ? applyReplacement(match, key, '<tx-replace key="..." />') : match;
            });

            // Example: <tx-replace key="widgetName"></tx-replace>
            // Example two: <tx-replace>widgetName</tx-replace>
            replaced = replaced.replace(
              /<\s*tx-replace\b[^>]*>[\s\S]*?<\/\s*tx-replace\s*>/g,
              (match) => {
                const attributeKey = extractTxReplaceAttributeKey(match);

                if (attributeKey) {
                  return applyReplacement(
                    match,
                    attributeKey,
                    '<tx-replace key="..."></tx-replace>',
                  );
                }

                const childrenMatch = match.match(
                  /<\s*tx-replace\b[^>]*>([\s\S]*?)<\/\s*tx-replace\s*>/,
                );
                const childrenKey = childrenMatch?.[1]?.trim();

                return childrenKey
                  ? applyReplacement(match, childrenKey, '<tx-replace>...</tx-replace>')
                  : match;
              },
            );

            // Example: [[widgetName]]
            replaced = replaced.replace(/\[\[\s*([A-Za-z0-9._-]+)\s*\]\]/g, (match, key) =>
              applyReplacement(match, key, '[[key]]'),
            );

            // Example: <<widgetName>>
            replaced = replaced.replace(/<<\s*([A-Za-z0-9._-]+)\s*>>/g, (match, key) =>
              applyReplacement(match, key, '<<key>>'),
            );

            return replaced;
          };

          const buildMappedContent = async (
            key: string | string[],
            watermarkSet: Set<string>,
            mergedPartLabel: 'for' | 'for ZIP',
          ): Promise<string> => {
            let content = '';
            const keys = Array.isArray(key) ? key : [key];

            if (keys.some((k) => k.includes('script'))) {
              if (!watermarkSet.has('script')) content += watermark.script(this) + '\n';
              watermarkSet.add('script');
            } else if (keys.some((k) => k.includes('css'))) {
              if (!watermarkSet.has('css')) content += watermark.css(this) + '\n';
              watermarkSet.add('css');
            } else if (keys.some((k) => k.includes('html'))) {
              if (!watermarkSet.has('html')) content += watermark.html(this) + '\n';
              watermarkSet.add('html');
            }

            if (typeof key === 'string' && results[key]?.trim().length) {
              content += results[key];
            } else if (Array.isArray(key)) {
              for await (const k of key) {
                const part = results[k];

                if (part && part.trim().length) {
                  if (fieldKeys.some((f) => k.toLowerCase().includes(f.toLowerCase()))) {
                    const old = JSON.parse(content || '{}');
                    const addition = JSON.parse(part);

                    content = JSON.stringify({ ...old, ...addition }, null, 2);
                  } else {
                    content += '\n' + part.trim();
                  }

                  if (verbose) console.log(`   ✓ Merged part ${mergedPartLabel}: ${k}`);
                }
              }
            }

            content = content.trim();

            return content ? replacePlaceholders(content) : '';
          };

          const results: Record<string, string> = Object.fromEntries(
            await Promise.all(
              Object.entries({ ...findPatterns, ...shared }).map(async ([key, patterns]) => {
                let result = '';

                let list = normalizeList(patterns.filter((p) => !processedFiles.has(p)));

                if (!list.length) return [key, ''];

                const check = (keys: string | string[], formats: string | string[]) => {
                  !Array.isArray(keys) && (keys = [keys]);
                  !Array.isArray(formats) && (formats = [formats]);

                  return (
                    // check keys
                    keys.some((k) => key.toLowerCase().includes(k.toLowerCase())) ||
                    // check formats
                    list.some((p) => formats.some((f) => p.toLowerCase().endsWith(f.toLowerCase())))
                  );
                };

                const processed = new Set<string>();

                // Process HTML
                if (check('html', '.html')) {
                  const fileList = list.filter(
                    (e) => e.endsWith('.html') && !processedFiles.has(e),
                  );

                  if (fileList.length) {
                    if (verbose)
                      console.log(
                        `  - Processing HTML for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                      );

                    const files = findAndRead(entryDir, fileList);

                    let mergedHTML = '';

                    for await (const [pattern, fileContent] of Object.entries(files)) {
                      // Extract body content
                      const bodyMatch = fileContent.match(
                        this.workspace.config.data.build?.htmlRegex ??
                          DEFAULT_WORKSPACE_CONFIG.build?.htmlRegex!,
                      );
                      if (bodyMatch && bodyMatch[1]) {
                        mergedHTML += bodyMatch[1].trim() + '\n';

                        processedFiles.add(pattern);
                      }
                    }

                    const minified = await minifyHTML(
                      mergedHTML,
                      this.workspace.config.data.build?.obfuscation?.html,
                    );

                    result += minified.trim();

                    processed.add('html');
                  }
                }

                if (check(['css', 'style', 'styles'], '.css')) {
                  const fileList = list.filter((e) => e.endsWith('.css') && !processedFiles.has(e));

                  if (fileList.length) {
                    if (verbose) {
                      console.log(
                        `  - Processing CSS for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                      );
                    }

                    const files = findAndRead(entryDir, fileList);

                    const cssContents = Object.values(files).filter(Boolean);

                    let mergedCSS = '';

                    for await (const content of cssContents) {
                      const plugin: postcss.AcceptedPlugin[] = [
                        autoprefixer({
                          overrideBrowserslist: ['Chrome 127'],
                          ...this.workspace.config.data.build?.obfuscation?.css?.autoprefixer,
                        }),
                        cssnano(this.workspace.config.data.build?.obfuscation?.css?.cssnano),
                      ];

                      if (this.workspace.config.data.build?.obfuscation?.css?.removeNesting) {
                        plugin.unshift(nested());
                      }

                      const processed = await postcss(plugin).process(content, { from: undefined });

                      mergedCSS += processed.css + '\n';
                    }

                    for (const pattern of Object.keys(files)) {
                      processedFiles.add(pattern);
                    }

                    if (processed.has('html')) {
                      result = result += `<style>${mergedCSS.trim()}</style>`;
                    } else result += mergedCSS.trim();

                    processed.add('css');
                  }
                }

                if (check(['typescript', 'ts'], ['.ts', '.tsx', '.cts', '.mts'])) {
                  const fileList = list.filter((e) => e.endsWith('.ts') && !processedFiles.has(e));

                  if (fileList.length) {
                    if (verbose)
                      console.log(
                        `  - Processing TypeScript for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                      );
                    const files = findAndRead(entryDir, fileList);

                    let mergedTS = '';

                    for await (const [pattern, content] of Object.entries(files)) {
                      try {
                        const transpiled = transformSync(content, {
                          loader: 'ts',
                          target: 'es2020',
                          format: 'cjs',
                        });

                        mergedTS += transpiled.code + '\n';
                      } catch (error) {
                        console.warn(`   ⚠️  Failed to compile TypeScript: ${error}`);
                        throw error;
                      } finally {
                        processedFiles.add(pattern);
                      }
                    }

                    // Obfuscate the compiled JavaScript
                    const obfuscated = JavaScriptObfuscator.obfuscate(
                      mergedTS.trim(),
                      this.workspace.config.data.build?.obfuscation?.javascript,
                    );

                    if (processed.has('html')) {
                      result = result += `<script>${obfuscated.getObfuscatedCode()}</script>\n`;
                    } else result += obfuscated.getObfuscatedCode() + '\n';

                    processed.add('typescript');
                  }
                }

                if (check(['script', 'js', 'javascript'], ['.js', '.mjs', '.cjs', '.jsx'])) {
                  // if (!usedWatermarks.has('script')) result += watermark.script(this) + '\n';
                  // usedWatermarks.add('script');

                  const fileList = list.filter((e) => e.endsWith('.js') && !processedFiles.has(e));

                  if (fileList.length) {
                    if (verbose)
                      console.log(
                        `  - Processing JavaScript for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                      );
                    const files = findAndRead(entryDir, fileList);

                    let mergedJS = '';

                    for await (const [pattern, content] of Object.entries(files)) {
                      const obfuscated = JavaScriptObfuscator.obfuscate(
                        content,
                        this.workspace.config.data.build?.obfuscation?.javascript,
                      );

                      mergedJS += obfuscated.getObfuscatedCode() + '\n';

                      processedFiles.add(pattern);
                    }

                    if (processed.has('html')) {
                      result = result += `<script>${mergedJS.trim()}</script>`;
                    } else result += mergedJS.trim();

                    processed.add('script');
                  }
                }

                if (
                  check(
                    ['fields', 'fielddata', 'fieldData', 'cf', 'customfields'],
                    ['.json', '.jsonc'],
                  )
                ) {
                  const fileList = list.filter(
                    (e) => (e.endsWith('.json') || e.endsWith('.jsonc')) && !processedFiles.has(e),
                  );

                  if (fileList.length) {
                    if (verbose)
                      console.log(
                        `  - Processing JSON for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                      );
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

                      processedFiles.add(pattern);
                    }

                    if (!processed.has('fields')) {
                      result += JSON.stringify(mergedFields, null, 2);
                    }

                    processed.add('fields');
                  }
                }

                if (!result.length) {
                  if (verbose)
                    console.log(
                      `  - Unknown build key: ${key}, the available keys are html, css, script and fields.`,
                    );

                  result += '';
                }

                return [key, result];
              }),
            ),
          );

          await Promise.all([
            (async () => {
              for (const [filename, key] of Object.entries(resultMapping)) {
                const content = await buildMappedContent(
                  key as string | string[],
                  usedWatermarks,
                  'for',
                );

                if (content) {
                  const outPath = join(targetOutDir, filename);

                  writeFileSync(outPath, content, 'utf-8');

                  if (verbose) console.log(`   ✓ Written: ${outPath}`);
                }
              }
            })(),
            (async () => {
              try {
                const zip = new JSZip();

                const zipWatermarks = new Set<string>();

                for (const [filename, key] of Object.entries(extensionMap)) {
                  const content = await buildMappedContent(
                    key as string | string[],
                    zipWatermarks,
                    'for ZIP',
                  );

                  if (content) {
                    zip.file(filename, content.trim());

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

                const zipPath = join(
                  extDir + '/' + (this.config.version || '0.0.0'),
                  `${zipName ?? this.config.name}.zip`,
                );

                mkdirSync(extDir + '/' + (this.config.version || '0.0.0'), { recursive: true });
                writeFileSync(zipPath, result, 'base64');
              } catch (error) {
                throw new Error(`Failed to create ZIP archive: ${error}`);
              }
            })(),
          ]);
        };

        if (this.config.type === 'multiple') {
          const configuredWidgets = (this.config.widgets ?? []).filter(Boolean);

          const folderWidgets = readdirSync(entryDir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);

          const subWidgets = configuredWidgets.length ? configuredWidgets : folderWidgets;
          if (!subWidgets.length) {
            throw new Error(
              `No widgets found in multiple widget entry directory: ${entryDir}. Make sure to create subfolders for each widget or configure the "widgets" property in the widget configuration with the names of the widget folders.`,
            );
          }

          let builtWidgets = 0;

          for await (const subWidget of subWidgets) {
            const subEntryDir = join(entryDir, subWidget);
            const subOutDir = join(outDir, subWidget);

            if (!existsSync(subEntryDir) && verbose) {
              console.warn(
                `   ⚠️  Skipping widget "${subWidget}" because the entry directory does not exist: ${subEntryDir}`,
              );
              continue;
            }

            mkdirSync(subOutDir, { recursive: true });

            await buildTarget(subEntryDir, subOutDir, `${this.config.name}-${subWidget}`);
            builtWidgets++;
          }

          if (!builtWidgets) {
            throw new Error(
              `No valid widgets were built for multiple widget configuration. Please check the entry directory and configuration.`,
            );
          }
        } else {
          await buildTarget(entryDir, outDir, this.config.name);
        }
      } catch (error) {
        throw new Error(`Failed to build widget: ${error}`);
      }
    }

    public async bumpVersion(type: 'patch' | 'minor' | 'major') {
      const configPath = resolve(this.path, '.tixyel');
      const config = this.config;

      if (!config.version) config.version = '0.0.0';

      const [major, minor, patch] = config.version.split('.').map(Number);

      let newVersion: string;

      switch (type) {
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
    }

    static async readConfig(path: string): Promise<DotTixyel | null> {
      try {
        const dotTixyelPath = resolve(path, '.tixyel');

        if (!existsSync(dotTixyelPath)) {
          return null;
        }

        const content = await readFile(dotTixyelPath, 'utf-8');
        const config = parse(content) as DotTixyel;

        if (
          typeof config !== 'object' ||
          !config ||
          config === null ||
          !config?.name ||
          typeof config.name !== 'string' ||
          !config.name.trim().length
        ) {
          // throw new Error(`Invalid widget configuration in ${dotTixyelPath}: Missing or invalid "name" property`);
          return null;
        }

        return Service.mergeConfig(config);
      } catch (error) {}
      return null;
    }

    static async mergeConfig(config: DotTixyel): Promise<DotTixyel> {
      const widgets =
        config.type === 'multiple'
          ? Array.isArray(config.widgets)
            ? config.widgets.filter(Boolean)
            : []
          : undefined;

      const dirs = {
        entry: config.dirs?.entry ?? 'development',
        output: config.dirs?.output ?? 'finished',
        shared: config.dirs?.shared ?? 'widgetIO',
        extension: config.dirs?.extension ?? 'widgetIO',
      };

      const merged: DotTixyel = {
        ...config,
        widgets: widgets,
        type: config.type ?? 'single',
        version: config.version ?? '0.0.0',
        description: config.description ?? '',
        metadata: config.metadata ?? {},
        dirs: dirs,
        replace: config.replace ?? {},
      };

      return merged;
    }
  }
}
