import { resolve, relative } from 'path';
import { existsSync } from 'fs';

/**
 * Finds the workspace root by searching for tixyel.config.ts or tixyel.config.js
 * Searches upwards from the current directory
 */
export async function findWorkspaceRoot(startPath: string = process.cwd()): Promise<string | null> {
  let currentPath = resolve(startPath);

  // Limit search to 10 levels up to avoid infinite loops
  for (let i = 0; i < 10; i++) {
    const configTs = resolve(currentPath, 'tixyel.config.ts');
    const configJs = resolve(currentPath, 'tixyel.config.js');

    if (existsSync(configTs) || existsSync(configJs)) {
      return currentPath;
    }

    const parentPath = resolve(currentPath, '..');
    if (parentPath === currentPath) {
      // Reached filesystem root
      break;
    }

    currentPath = parentPath;
  }

  return null;
}

/**
 * Gets the relative path from a widget directory to the workspace root config
 */
export function getConfigPathFromWidget(widgetPath: string, workspaceRoot: string): string {
  const relPath = relative(widgetPath, resolve(workspaceRoot, 'tixyel.config.ts'));
  // Normalize path separators and ensure it starts with ./
  const normalized = relPath.replace(/\\/g, '/');
  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

/**
 * Validates that workspace is initialized
 */
export async function validateWorkspaceInit(): Promise<string> {
  const workspaceRoot = await findWorkspaceRoot();

  if (!workspaceRoot) {
    throw new Error('❌ Workspace not initialized. Run `tixyel init` in your workspace root first.');
  }

  return workspaceRoot;
}
