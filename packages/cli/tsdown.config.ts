import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    api: 'src/api.ts',
  },
  outDir: 'dist',
  minify: true,
  dts: {
    oxc: true,
  },
  'cjsDefault': false,
});
