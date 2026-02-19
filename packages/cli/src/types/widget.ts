import { WorkspaceConfig } from './workspace';

export interface DotTixyel {
  name: string;
  config: string;
  version: string;
  description: string;
  dirs: WorkspaceConfig['dirs'];
  build?: WorkspaceConfig['build'];
  metadata: WorkspaceConfig['metadata'];
}
