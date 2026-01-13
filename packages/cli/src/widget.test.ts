import { describe, expect, it, test } from 'bun:test';
import { transformSync } from 'esbuild';

describe('Should parse typescript into javascript', () => {
  const tsContent = `function wait(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms));}`;

  const transpiled = transformSync(tsContent, {
    loader: 'ts',
    target: 'es2020',
    format: 'cjs',
  });

  it('should transpile TypeScript to JavaScript', () => {
    expect(transpiled.code).toContain('function wait(ms) {');
    expect(transpiled.code).toContain('return new Promise((resolve) => setTimeout(resolve, ms));');
  });
});
