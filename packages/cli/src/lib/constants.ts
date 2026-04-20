export const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun'] as const;

export const INITIAL_PACKAGES = [
  '@tixyel/cli',
  '@tixyel/streamelements',
  'comfy.js',
  'motion',
  'typescript',
  '@types/node',
  '@types/jquery',
  'lottie-web',
] as const;

export const UPDATE_PACKAGES = ['@tixyel/cli@latest', '@tixyel/streamelements@latest'] as const;

export const INSTALL_COMMANDS = {
  npm: (packages: string[], nocache?: boolean) =>
    `npm install ${packages.join(' ')}${nocache ? ' --no-cache' : ''}`,
  yarn: (packages: string[], nocache?: boolean) =>
    `yarn add ${packages.join(' ')}${nocache ? ' --no-cache' : ''}`,
  pnpm: (packages: string[], nocache?: boolean) =>
    `pnpm add ${packages.join(' ')}${nocache ? ' --no-cache' : ''}`,
  bun: (packages: string[], nocache?: boolean) =>
    `bun add ${packages.join(' ')}${nocache ? ' --no-cache' : ''}`,
} as const;

export * from './constants.widget.js';
export * from './constants.workspace.js';
