import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import type { TixyelCliConfig, RequiredCliConfig } from '../types/tixyel-cli-config.js';
import { mergeCliConfig } from '../types/tixyel-cli-config.js';

/**
 * Loads tixyel.config.ts or tixyel.config.js from the workspace root
 */
export async function loadCliConfig(rootPath: string): Promise<RequiredCliConfig> {
  const configTs = resolve(rootPath, 'tixyel.config.ts');
  const configJs = resolve(rootPath, 'tixyel.config.js');
  const configMjs = resolve(rootPath, 'tixyel.config.mjs');

  let userConfig: TixyelCliConfig | undefined;

  try {
    // Try .mjs first (already ES module)
    if (existsSync(configMjs)) {
      const module = await import(`file://${configMjs}`);
      userConfig = module.default || module.config;
    }
    // Try .js (if package.json has type: module)
    else if (existsSync(configJs)) {
      const module = await import(`file://${configJs}`);
      userConfig = module.default || module.config;
    }
    // Try .ts file (compile on-the-fly)
    else if (existsSync(configTs)) {
      userConfig = await loadTypeScriptConfig(configTs, rootPath);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load tixyel.config: ${error}`);
  }

  return mergeCliConfig(userConfig);
}

/**
 * Loads TypeScript config by compiling it on-the-fly
 */
async function loadTypeScriptConfig(configPath: string, rootPath: string): Promise<TixyelCliConfig | undefined> {
  const tempJs = resolve(rootPath, '.tixyel.config.temp.mjs');

  try {
    // Read TypeScript content
    const tsContent = readFileSync(configPath, 'utf-8');

    // Simple conversion: remove type imports and convert to JS
    const jsContent = tsContent
      .replace(/import type .+ from .+;/g, '') // Remove type imports
      .replace(/: TixyelCliConfig/g, ''); // Remove type annotations

    // Write temporary .mjs file
    writeFileSync(tempJs, jsContent, 'utf-8');

    // Import the temporary file
    const module = await import(`file://${tempJs}?t=${Date.now()}`);
    const config = module.default || module.config;

    return config;
  } catch (error) {
    throw new Error(`Failed to load TypeScript config: ${error}`);
  } finally {
    // Clean up temporary file
    if (existsSync(tempJs)) {
      try {
        unlinkSync(tempJs);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
