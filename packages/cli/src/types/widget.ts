import { WorkspaceConfig } from './workspace';

export interface DotTixyel {
  name: string;
  config: string;
  version: string;
  type: WidgetType;
  widgets?: string[];
  description: string;
  dirs: WorkspaceConfig['dirs'];
  build?: WorkspaceConfig['build'];
  metadata: WorkspaceConfig['metadata'];
}

export type WidgetType = 'single' | 'multiple';
