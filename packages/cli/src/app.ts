import { createRequire } from 'module';

import { Command as Commander } from 'commander';

const program = new Commander();

program
  .name('tixyel cli')
  .description('CLI tool for streamelements widgets made by Tixyel')
  .version(
    (() => {
      try {
        const require = createRequire(import.meta.url);
        const { version } = require('../package.json');
        return version ?? 'dev';
      } catch (error) {
        return 'dev';
      }
    })(),
  );

export { program };
