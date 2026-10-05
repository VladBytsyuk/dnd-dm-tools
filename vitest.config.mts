// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'design-system/**',
        'dist/**',
        '.pages/**',
        'coverage/**',
        '**/*.d.ts',
        '**/__mocks__/**',
        '**/.vite/**',
        '**/virtual:*',
        '**/*.css',
        '**/*.wasm',
        'src/**/*.svelte',
      ],
    },
  },
  resolve: {
    alias: [
      { find: /^svelte$/, replacement: path.resolve(__dirname, 'node_modules/svelte/src/index-client.js') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: 'src', replacement: path.resolve(__dirname, 'src') },
      { find: 'obsidian', replacement: path.resolve(__dirname, 'test/__mocks__/obsidian.ts') },
    ],
  },
  esbuild: { sourcemap: true },
});
