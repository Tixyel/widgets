import { join, resolve } from 'path';
import { DotTixyel } from '../types/widget';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'jsonc-parser';
import { readFile, writeFile } from 'fs/promises';
import { Workspace } from './workspace';
import { Ora } from 'ora';
import { watermark } from '../utils/watermark';
import postcss from 'postcss';
import cssnano from 'cssnano';
import JSZip from 'jszip';
import nested from 'postcss-nested';
import { transformSync } from 'esbuild';
import autoprefixer from 'autoprefixer';
import { minify as minifyHTML } from 'html-minifier-terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

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
        const extDir = join(
          this.path,
          this.config.dirs?.extension ?? this.workspace.config.data.dirs?.extension ?? 'widgetIO',
        );

        if (!existsSync(entryDir)) {
          throw new Error(`Entry directory does not exist: ${entryDir}`);
        }

        mkdirSync(outDir, { recursive: true });

        const findPatterns = this.config.build?.find ??
          this.workspace.config.data.build?.find ?? {
            html: ['index.html'],
            script: ['script.js'],
            typescript: ['script.ts'],
            css: ['styles.css'],
            fields: ['fields.json'],
          };
        const resultMapping = this.config.build?.result ??
          this.workspace.config.data.build?.result ?? {
            'HTML.html': 'html',
            'SCRIPT.js': 'script',
            'CSS.css': 'css',
            'FIELDS.json': 'fields',
          };
        const extensionMap = this.config.build?.widgetIO ??
          this.workspace.config.data.build?.widgetIO ?? {
            'html.txt': 'html',
            'js.txt': 'script',
            'css.txt': 'css',
            'fields.txt': 'fields',
          };

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

        const usedWatermarks = new Set<string>();
        const processedFiles = new Set<string>();

        /**
         * Find all files based on patterns and process them according to their type (html, css, script, fields)
         * Group results based on resultMapping and extensionMap
         * Compact/minify where applicable
         */
        const results: Record<keyof typeof findPatterns, string> = Object.fromEntries(
          await Promise.all(
            Object.entries(findPatterns).map(async ([key, patterns]) => {
              let result = '';

              let list = normalizeList(patterns.filter((p) => !processedFiles.has(p)));

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
                if (!usedWatermarks.has('html')) result += watermark.html(this) + '\n';
                usedWatermarks.add('html');

                const fileList = list.filter((e) => e.endsWith('.html') && !processedFiles.has(e));

                if (verbose)
                  console.log(
                    `  - Processing HTML for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                  );
                const files = findAndRead(entryDir, fileList);

                let mergedHTML = '';

                for await (const [pattern, fileContent] of Object.entries(files)) {
                  // Extract body content
                  const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
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

              if (check(['css', 'style', 'styles'], '.css')) {
                if (!usedWatermarks.has('css')) result += watermark.css(this) + '\n';
                usedWatermarks.add('css');

                const fileList = list.filter((e) => e.endsWith('.css') && !processedFiles.has(e));

                if (verbose)
                  console.log(
                    `  - Processing CSS for ${this.config.name} [${key}, ${fileList.join(', ')}]...`,
                  );
                const files = findAndRead(entryDir, fileList);

                let mergedCSS = '';

                for await (const [pattern, content] of Object.entries(files)) {
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

                  processedFiles.add(pattern);
                }

                if (processed.has('html')) {
                  result = result += `<style>${mergedCSS.trim()}</style>`;
                } else result += mergedCSS.trim();

                processed.add('css');
              }

              if (check(['typescript', 'ts'], '.ts')) {
                if (!usedWatermarks.has('script')) result += watermark.script(this) + '\n';

                usedWatermarks.add('script');

                const fileList = list.filter((e) => e.endsWith('.ts') && !processedFiles.has(e));

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

              if (check(['script', 'js', 'javascript'], '.js')) {
                if (!usedWatermarks.has('script')) result += watermark.script(this) + '\n';
                usedWatermarks.add('script');

                const fileList = list.filter((e) => e.endsWith('.js') && !processedFiles.has(e));

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

              if (check(['fields', 'fielddata', 'fieldData', 'cf', 'customfields'], '.json')) {
                const fileList = list.filter((e) => e.endsWith('.json') && !processedFiles.has(e));

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
                }

                if (!processed.size) result += JSON.stringify(mergedFields, null, 2);

                processed.add('fields');
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

        try {
          const zip = new JSZip();

          for await (const [filename, key] of Object.entries(extensionMap)) {
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

          const zipPath = join(
            extDir + '/' + (this.config.version || '0.0.0'),
            `${this.config.name}.zip`,
          );

          mkdirSync(extDir + '/' + (this.config.version || '0.0.0'), { recursive: true });
          writeFileSync(zipPath, result, 'base64');
        } catch (error) {
          throw new Error(`Failed to create ZIP archive: ${error}`);
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
      const merged: DotTixyel = {
        ...config,
        version: config.version ?? '0.0.0',
        description: config.description ?? '',
        metadata: {
          ...config.metadata,
        },
        dirs: {
          entry: config.dirs?.entry ?? 'development',
          output: config.dirs?.output ?? 'finished',
          extension: config.dirs?.extension ?? 'widgetIO',
        },
      };

      return merged;
    }
  }
}
