import { WorkspaceConfig } from './workspace.js';

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
  replace?: {
    [key: string]: string;
  };
}

export type WidgetType = 'single' | 'multiple';
