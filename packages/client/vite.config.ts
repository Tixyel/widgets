import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: true,
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: '@tixyel/streamelements',
      fileName: (format) => `index.${format}.js`,
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
});
