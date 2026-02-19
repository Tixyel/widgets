import { Command as Commander } from 'commander';
import { createRequire } from 'module';

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
