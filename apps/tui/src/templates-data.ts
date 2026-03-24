import type { GoalTemplate } from './types.js';

export const BUILT_IN_TEMPLATES: readonly GoalTemplate[] = [
  {
    id: 'fullstack-app',
    name: 'Full-stack web app',
    description: 'Scaffold a Next.js + API + DB project with auth',
    goal: 'Build a full-stack web application with Next.js frontend, REST API backend, PostgreSQL database, and JWT authentication',
    estimatedTasks: 8,
  },
  {
    id: 'cli-tool',
    name: 'CLI tool',
    description: 'Create a typed CLI utility with tests',
    goal: 'Build a command-line tool with argument parsing, help text, and comprehensive test coverage',
    estimatedTasks: 5,
  },
  {
    id: 'api-integration',
    name: 'API integration',
    description: 'Integrate a third-party API with error handling',
    goal: 'Integrate with a third-party REST API including authentication, error handling, retry logic, and TypeScript types',
    estimatedTasks: 4,
  },
  {
    id: 'refactor',
    name: 'Code refactor',
    description: 'Refactor existing code with tests',
    goal: 'Refactor the codebase to improve maintainability: extract utilities, add type safety, improve error handling, and add missing tests',
    estimatedTasks: 6,
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Write comprehensive docs and examples',
    goal: 'Write comprehensive documentation including README, API reference, usage examples, and contribution guide',
    estimatedTasks: 3,
  },
];
