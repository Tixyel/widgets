import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { WorkspaceConfig, WorkspaceScaffold } from '../types/workspace';
import { DEFAULT_WORKSPACE_CONFIG, WORKSPACE_CONFIG_FILES } from './constants.workspace';
import { dirname, extname, relative, resolve } from 'path';
import { transform } from 'esbuild';
import { mkdir, writeFile } from 'fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ora } from 'ora';
import { DotTixyel, WidgetType } from '../types/widget';
import { isValidElement } from 'react';
import { Widget } from './widget';
import FastGlob from 'fast-glob';

export namespace Workspace {
  /**
   * todo:
   *  • check path for exiting workspace config files (tixyel.config.{ts,.js,.json,.jsonc})
   *   - if yes: return the workspace config
   *   - if no: return false
   *  • create workspace config file with default config
   */

  export type ServiceOptions = {
    /**
     * Path to the workspace configuration file (tixyel.config.{ts,.js,.json,.jsonc})
     */
    path?: string;
    /**
     * Optional workspace configuration object, if not provided, the service will attempt to load the configuration from the specified path
     */
    config?: Config;
    /**
     * Optional Ora spinner instance for displaying loading states during workspace operations, allowing for visual feedback to the user when loading configurations, generating widgets, or performing other asynchronous tasks within the workspace service
     */
    spinner?: Ora;
  };

  export type Config = {
    data: WorkspaceConfig;
    path: string;
    file: string;
  };

  export class Service {
    public root: string;
    public config: Config;
    public spinner?: Ora;

    constructor(options?: ServiceOptions) {
      const rootPath = resolve(options?.path ?? process.cwd());

      this.root = rootPath;

      // When running from a widget folder, resolve the workspace root from .tixyel config.
      const dotTixyelPath = resolve(rootPath, '.tixyel');

      if (existsSync(dotTixyelPath)) {
        try {
          const content = readFileSync(dotTixyelPath, 'utf-8');
          const dotTixyel = JSON.parse(content) as Partial<DotTixyel>;

          if (typeof dotTixyel.config === 'string' && dotTixyel.config.trim().length) {
            const workspaceConfigPath = resolve(rootPath, dotTixyel.config.trim());

            this.root = dirname(workspaceConfigPath);
          }
        } catch {
          this.root = rootPath;
        }
      }

      this.config = options?.config ?? {
        data: DEFAULT_WORKSPACE_CONFIG,
        path: this.root,
        file: 'tixyel.config.ts',
      };

      this.spinner = options?.spinner;
    }

    public async loadConfig(): Promise<Config | null> {
      const configFile = WORKSPACE_CONFIG_FILES.find((file) =>
        existsSync(resolve(this.root, file)),
      );

      if (!configFile) return null;

      let config: WorkspaceConfig | undefined;
      let path = resolve(this.root, configFile);

      try {
        if (configFile.endsWith('.ts') || configFile.endsWith('.tsx')) {
          config = await Service.loadTsConfig(this.root, path);
        } else if (
          configFile.endsWith('.js') ||
          configFile.endsWith('.mjs') ||
          configFile.endsWith('.cjs')
        ) {
          const mod = await import(path);

          config = mod.default ?? mod.config;
        } else if (
          configFile.endsWith('.json') ||
          configFile.endsWith('.jsonc') ||
          configFile === '.tixyelrc'
        ) {
          const content = readFileSync(path, 'utf-8');

          config = JSON.parse(content);
        } else {
          throw new Error(`Unsupported configuration file format: ${configFile}`);
        }
      } catch (error) {
        throw new Error(`Failed to load workspace configuration: ${error}`);
      } finally {
        if (!config) return null;

        config = Service.mergeConfig(config);

        const result = { data: config, path, file: configFile };

        this.config = result;

        return result;
      }
    }

    public async createWidget(
      path: string,
      metadata?: Partial<WorkspaceConfig['metadata']>,
      options?: {
        type?: WidgetType;
        widgets?: string[];
      },
    ) {
      try {
        await mkdir(path, { recursive: true });

        const workspaceConfigPath = relative(path, this.config.path).replace(/\\/g, '/');

        const dotTixyel: DotTixyel = {
          type: options?.type ?? 'single',
          widgets:
            options?.type === 'multiple'
              ? (options?.widgets ?? [])
                  .map((widget) => widget.trim())
                  .filter((widget) => !!widget.length)
              : undefined,
          name: metadata?.name as string,
          description: metadata?.description as string,
          version: '0.0.0',
          config: workspaceConfigPath.startsWith('.')
            ? workspaceConfigPath
            : `./${workspaceConfigPath}`,
          metadata: {
            ...this.config.data.metadata,
            ...metadata,
            name: undefined,
            description: undefined,
          },
          dirs: this.config.data.dirs ?? {
            entry: 'development',
            output: 'finished',
            shared: 'shared',
            extension: 'widgetIO',
          },
        };

        await writeFile(resolve(path, '.tixyel'), JSON.stringify(dotTixyel, null, 2), 'utf-8');

        // Create scaffold files from the workspace config
        const {
          single: singleScaffold = this.config.data.scaffold?.single ?? [],
          multiple: multipleScaffold = this.config.data.scaffold?.multiple ?? [],
        } = this.config.data.scaffold ?? {};

        let created = { files: 0, folders: 0 };

        async function processItem(item: WorkspaceScaffold.Item, currentPath: string) {
          const fullPath = resolve(currentPath, item.name);

          if (item.type === 'folder') {
            await mkdir(fullPath, { recursive: true });
            created.folders++;

            if (!item.content || !Array.isArray(item.content) || !item.content.length) return;

            if (
              dotTixyel.type === 'multiple' &&
              item.name === (dotTixyel.dirs?.entry ?? 'development') &&
              dotTixyel.widgets?.length
            ) {
              await Promise.all(
                dotTixyel.widgets.map((subWidget) => {
                  return new Promise(async (res) => {
                    const subWidgetPath = resolve(fullPath, subWidget);

                    await mkdir(subWidgetPath, { recursive: true });
                    created.folders++;

                    await Promise.all(
                      item.content!.map((child) => processItem(child, subWidgetPath)),
                    );

                    res(subWidgetPath);
                  });
                }),
              );
            } else {
              await Promise.all(item.content.map((child) => processItem(child, fullPath)));
            }
          } else if (item.type === 'file') {
            let content = item.content;

            if (content === undefined || typeof content === 'undefined' || !content) content = '';
            else if (typeof content === 'string') content = content;
            else if (isValidElement(content)) content = renderToStaticMarkup(content);

            await writeFile(fullPath, String(content ?? ''), 'utf-8');
            created.files++;
          }
        }

        await Promise.all(
          (dotTixyel.type === 'single' ? singleScaffold : multipleScaffold).map((item) =>
            processItem(item, path),
          ),
        );

        return new Widget.Service({
          relativePath: relative(this.root, path),
          config: dotTixyel,
          content: created,
          path,
          workspace: this,
        });
      } catch (error) {
        throw new Error(`Failed to create widget: ${error}`);
      }
    }

    public async findWidgets(
      depth: number = this.config.data.search?.maxDepth ?? 5,
      ignore: string[] = this.config.data.search?.ignore ?? [],
    ) {
      // Build glob pattern with depth limit
      const depthPattern = Array.from({ length: depth }, (_, i) => '*'.repeat(i + 1)).join(',');

      const dotTixyels = await FastGlob(`{${depthPattern}}/.tixyel`, {
        cwd: this.root,
        absolute: true,
        onlyFiles: true,
        ignore: ['node_modules', '.git', 'dist', ...ignore],
      });

      const findWidgets = await Promise.all(
        dotTixyels.map(
          (dotTixyel) =>
            new Promise<Widget.Service | null>(async (resolve) => {
              const path = dirname(dotTixyel);
              const config = await Widget.Service.readConfig(path);

              if (!config || config === null) {
                resolve(null);
                return null;
              }

              const widget = new Widget.Service({
                path,
                config,
                relativePath: relative(this.root, path),
                workspace: this,
              });
              resolve(widget);
              return widget;
            }),
        ),
      );

      return findWidgets.filter((widget): widget is Widget.Service => widget !== null);
    }

    static mergeConfig(config?: WorkspaceConfig): WorkspaceConfig {
      const defaultConfig = DEFAULT_WORKSPACE_CONFIG;

      const merged: WorkspaceConfig = {
        ...(config || {}),
        search: {
          ...defaultConfig.search,
          ...(config?.search || {}),
        },
        metadata: {
          ...defaultConfig.metadata,
          ...(config?.metadata || {}),
        },
        dirs: {
          ...defaultConfig.dirs,
          ...(config?.dirs || {}),
        },
        scaffold: {
          ...defaultConfig.scaffold,
          ...config?.scaffold,
        },
        build: {
          ...defaultConfig.build,
          ...(config?.build || {}),
          obfuscation: {
            ...defaultConfig.build?.obfuscation,
            ...(config?.build?.obfuscation || {}),
          },
        },
      };

      return merged;
    }

    static async loadTsConfig(rootPath: string, configPath: string): Promise<WorkspaceConfig> {
      const temp = resolve(rootPath, '.temp.tixyel.config.mjs');
      const tsContent = readFileSync(configPath, 'utf-8');

      const extension = extname(configPath).toLowerCase();
      const loader = extension === '.tsx' ? 'tsx' : extension === '.jsx' ? 'jsx' : 'ts';

      const { code } = await transform(tsContent, {
        loader,
        format: 'esm',
        target: 'es2022',
        ...(loader === 'tsx' || loader === 'jsx' ? { jsx: 'automatic' as const } : {}),
      });

      writeFileSync(temp, code, 'utf-8');

      try {
        const mod = await import(`file://${temp}?t=${Date.now()}`);

        try {
          unlinkSync(temp);
        } catch (error) {
          throw new Error(`Failed to clean up temporary configuration file: ${error}`);
        }

        return mod.default ?? mod.config;
      } catch (error) {
        throw new Error(`Failed to load TypeScript workspace configuration: ${error}`);
      }
    }
  }
}
