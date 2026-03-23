import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Lunaria',
  description: 'Desktop-first AI development environment',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: ['**/.DS_Store'],
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Lunaria',

    nav: [
      { text: 'Guide', link: '/getting-started/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'Features', link: '/features' },
      { text: 'Extensions', link: '/extensions/' },
      { text: 'API', link: '/api/' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing/' },
        ],
      },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quickstart' },
            { text: 'Configuration', link: '/getting-started/configuration' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Runtime Server', link: '/architecture/runtime-server' },
            { text: 'Database', link: '/architecture/database' },
            { text: 'Data Flow', link: '/architecture/data-flow' },
            { text: 'Security', link: '/architecture/security' },
          ],
        },
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Sessions', link: '/features/sessions' },
            { text: 'Providers & Models', link: '/features/providers' },
            { text: 'Tool Execution', link: '/features/tools' },
            { text: 'Memory System', link: '/features/memory' },
            { text: 'Multi-Agent', link: '/features/agents' },
            { text: 'Autopilot', link: '/features/autopilot' },
            { text: 'Workspaces', link: '/features/workspaces' },
            { text: 'Remote Access', link: '/features/remote-access' },
            { text: 'Terminal', link: '/features/terminal' },
            { text: 'Routing', link: '/features/routing' },
          ],
        },
      ],
      '/extensions/': [
        {
          text: 'Extensions',
          items: [
            { text: 'Overview', link: '/extensions/' },
            { text: 'Getting Started', link: '/extensions/getting-started' },
            { text: 'Manifest', link: '/extensions/manifest' },
            { text: 'Contributions', link: '/extensions/contributions' },
            { text: '.luna Format', link: '/extensions/luna-format' },
            { text: 'Activation Events', link: '/extensions/activation' },
            { text: 'Examples', link: '/extensions/examples' },
          ],
        },
      ],
      '/plugins/': [
        {
          text: 'Plugins',
          items: [
            { text: 'Overview', link: '/plugins/' },
            { text: 'Creating Plugins', link: '/plugins/creating' },
            { text: 'Lifecycle', link: '/plugins/lifecycle' },
            { text: 'Hook Events', link: '/plugins/hooks' },
            { text: 'Manifest', link: '/plugins/manifest' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Sessions', link: '/api/sessions' },
            { text: 'Messages', link: '/api/messages' },
            { text: 'Agents', link: '/api/agents' },
            { text: 'Memory', link: '/api/memory' },
            { text: 'Hooks', link: '/api/hooks' },
            { text: 'Workspaces', link: '/api/workspaces' },
            { text: 'Queue', link: '/api/queue' },
            { text: 'Tasks', link: '/api/tasks' },
            { text: 'Extensions', link: '/api/extensions' },
            { text: 'Plugins', link: '/api/plugins' },
            { text: 'Remote', link: '/api/remote' },
            { text: 'Terminal', link: '/api/terminal' },
            { text: 'Settings', link: '/api/settings' },
            { text: 'SSE Events', link: '/api/sse-events' },
          ],
        },
      ],
      '/ui/': [
        {
          text: 'UI Development',
          items: [
            { text: 'Overview', link: '/ui/' },
            { text: 'Components', link: '/ui/components' },
            { text: 'i18n', link: '/ui/i18n' },
            { text: 'Storybook', link: '/ui/storybook' },
          ],
        },
      ],
      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Overview', link: '/contributing/' },
            { text: 'Development', link: '/contributing/development' },
            { text: 'Code Style', link: '/contributing/code-style' },
            { text: 'Releasing', link: '/contributing/releasing' },
          ],
        },
      ],
      // Preserve existing sidebar sections
      '/product/': [
        {
          text: 'Product',
          items: [
            { text: 'Overview', link: '/product/' },
            { text: 'Desktop Overview', link: '/product/desktop-overview' },
            { text: 'Session Workspace', link: '/product/session-workspace' },
            { text: 'Providers and Models', link: '/product/providers-and-models' },
            { text: 'Workspaces and Review', link: '/product/workspaces-and-review' },
            { text: 'Mobile Remote Access', link: '/product/mobile-remote-access' },
          ],
        },
      ],
      '/developer/': [
        {
          text: 'Developer',
          items: [
            { text: 'Overview', link: '/developer/' },
            { text: 'Contributing', link: '/developer/contributing' },
            { text: 'Plugin Authoring', link: '/developer/plugin-authoring' },
            { text: 'Agent Export', link: '/developer/agent-export' },
            { text: 'Testing Strategy', link: '/developer/testing-strategy' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/reference/' },
            { text: 'Settings Keys', link: '/reference/settings-keys' },
            { text: 'Event Payloads', link: '/reference/event-payloads' },
            { text: 'Provider Model Capabilities', link: '/reference/provider-model-capabilities' },
            { text: 'Workspace Merge Review', link: '/reference/workspace-merge-review' },
            { text: 'Built-in Agents', link: '/reference/built-in-agents' },
          ],
        },
      ],
      '/design-system/': [
        {
          text: 'Design System',
          items: [{ text: 'Overview', link: '/design-system/' }],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LunariaAi/lunaria' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/LunariaAi/lunaria/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026 Lunaria Contributors',
    },
  },
})
