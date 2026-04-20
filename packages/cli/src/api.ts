import { Workspace } from './lib/workspace.js';
import { BuildFindMap, WorkspaceConfig } from './types/workspace.js';

export function defineConfig<const Find extends BuildFindMap = BuildFindMap>(
  config: WorkspaceConfig<Find>,
): WorkspaceConfig<Find> {
  return Workspace.Service.mergeConfig(config as any) as unknown as WorkspaceConfig<Find>;
}
export default defineConfig;

export type { WorkspaceConfig };
