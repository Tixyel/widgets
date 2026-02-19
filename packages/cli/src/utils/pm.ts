export function detectPackageManager(): 'yarn' | 'npm' | 'pnpm' | 'bun' {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.includes('yarn')) {
      return 'yarn';
    } else if (userAgent.includes('pnpm')) {
      return 'pnpm';
    } else if (userAgent.includes('bun')) {
      return 'bun';
    }
  }

  return 'npm';
}
