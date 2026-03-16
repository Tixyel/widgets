import { Workspace } from './lib/workspace';
import { BuildFindMap, WorkspaceConfig } from './types/workspace';

export function defineConfig<const Find extends BuildFindMap = BuildFindMap>(
  config: WorkspaceConfig<Find>,
): WorkspaceConfig<Find> {
  return Workspace.Service.mergeConfig(config as any) as unknown as WorkspaceConfig<Find>;
}
export default defineConfig;

export type { WorkspaceConfig };
