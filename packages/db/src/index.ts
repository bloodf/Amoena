export * from "@lunaria/local-db";

import type { createLocalDb } from "@lunaria/local-db";

// Type alias for cloud DB compatibility — same shape as the local SQLite instance.
export type CloudDb = ReturnType<typeof createLocalDb>;
