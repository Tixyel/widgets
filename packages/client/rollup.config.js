import { dts } from 'rollup-plugin-dts';

const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
    banner: `
/*!
 * This bundled type file includes portions derived from comfy.js
 * Copyright (c) 2019 Instafluff — MIT License
 * See THIRD_PARTY_NOTICES.md for full license texts and attributions.
 */
`.trimStart(),
  },
  plugins: [dts({})],
};

export default config;
