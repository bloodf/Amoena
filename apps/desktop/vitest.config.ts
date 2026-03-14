import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('../../packages/ui/src', import.meta.url).pathname,
      '@lunaria/ui': new URL('../../packages/ui/src/index.ts', import.meta.url).pathname,
      '@lunaria/runtime-client': new URL('../../packages/runtime-client/src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
