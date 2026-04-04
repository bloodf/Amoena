import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, '../..');

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
      shared: path.resolve(dirname, 'src/shared'),
      main: path.resolve(dirname, 'src/main'),
      '@lunaria/shared': path.resolve(rootDir, 'packages/shared/src'),
      '@lunaria/ui': path.resolve(rootDir, 'packages/ui/src'),
      '@lunaria/tokens': path.resolve(rootDir, 'packages/tokens/src'),
      '@lunaria/i18n': path.resolve(rootDir, 'packages/i18n/src'),
      '@lunaria/amoena-service': path.resolve(rootDir, 'packages/lunaria-service/src'),
      '@lunaria/memory': path.resolve(rootDir, 'packages/memory/src'),
      '@lunaria/runtime-client': path.resolve(rootDir, 'packages/runtime-client/src'),
      '@lunaria/local-db': path.resolve(rootDir, 'packages/local-db/src'),
      '@lunaria/terminal-host': path.resolve(rootDir, 'packages/terminal-host/src'),
      '@lunaria/trpc': path.resolve(rootDir, 'packages/trpc/src'),
      '@lunaria/types': path.resolve(rootDir, 'packages/typescript/src'),
      '@lunaria/workspace-client': path.resolve(rootDir, 'packages/workspace-client/src'),
      '@lunaria/workspace-fs': path.resolve(rootDir, 'packages/workspace-fs/src'),
      '@lunaria/desktop-mcp': path.resolve(rootDir, 'packages/desktop-mcp/src'),
      '@lunaria/host-service': path.resolve(rootDir, 'packages/host-service/src'),
      '@lunaria/db': path.resolve(rootDir, 'packages/db/src'),
      '@lunaria/contracts': path.resolve(rootDir, 'packages/contracts/src'),
      '@lunaria/macos-process-metrics': path.resolve(rootDir, 'packages/macos-process-metrics/src'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: [path.resolve(dirname, 'src/test/vitest-setup.ts')],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: [
      'src/shared/utils/agent-launch-request.test.ts',
      'src/lib/trpc/routers/changes/branches.test.ts',
      'src/lib/trpc/routers/config/config.test.ts',
      'src/lib/trpc/routers/workspaces/utils/workspace-creation.test.ts',
      'src/shared/utils/agent-settings.test.ts',
      'src/lib/trpc/routers/settings/agent-preset-router.utils.test.ts',
      'src/lib/trpc/routers/settings/preset-execution-mode.test.ts',
      'src/lib/trpc/routers/window.test.ts',
      'src/lib/trpc/routers/menu.test.ts',
      'src/lib/trpc/routers/notifications.test.ts',
      'src/lib/trpc/routers/permissions.test.ts',
      'src/lib/trpc/routers/resource-metrics.test.ts',
      'src/lib/trpc/routers/browser/browser.test.ts',
      'src/lib/trpc/routers/ports/ports.test.ts',
      'src/lib/trpc/routers/workspaces/workspaces.test.ts',
      'src/app/session-workspace/use-session-stream.test.ts',
      'src/main/lib/terminal-host-service.test.ts',
      'src/lib/trpc/routers/workspaces/procedures/external-worktree-import.test.ts',
      'src/lib/trpc/routers/workspaces/utils/git.test.ts',
      'src/main/lib/local-network-permission.test.ts',
      'src/App.test.tsx',
      'src/main/lib/host-service-manager.test.ts',
      'src/main/lib/agent-setup/agent-wrappers-claude-codex-opencode.test.ts',
      'src/main/lib/agent-setup/agent-wrappers-gemini.test.ts',
      'src/main/lib/agent-setup/agent-wrappers.test.ts',
      'src/lib/trpc/routers/changes/security/path-validation.test.ts',
      'src/lib/trpc/routers/terminal/terminal.test.ts',
      'src/lib/trpc/routers/changes/workers/git-task-handlers.test.ts',
      'src/lib/trpc/routers/terminal/utils/workspace-terminal-context.test.ts',
    ],
    testTimeout: 60000,
  },
});
