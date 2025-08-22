// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
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
        'dist/**',
        'coverage/**',
        '**/*.d.ts',
        '**/__mocks__/**',
        '**/.vite/**',
        '**/virtual:*',
        '**/*.css',
        '**/*.wasm',
        'src/**/*.svelte',
        'src/ui/**',
      ],
    },
  },
  resolve: {
    alias: { 
      '@': path.resolve(__dirname, 'src'),
      'src': path.resolve(__dirname, 'src'),
      'obsidian': path.resolve(__dirname, 'test/__mocks__/obsidian.ts'), 
    },
  },
  esbuild: { sourcemap: true },
});
