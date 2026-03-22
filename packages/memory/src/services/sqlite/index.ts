// Export main components
export {
	ClaudeMemDatabase,
	DatabaseManager,
	getDatabase,
	initializeDatabase,
	MigrationRunner,
} from "./Database.js";
export * from "./Import.js";
// Export migrations
export { migrations } from "./migrations.js";
export * from "./Observations.js";
export * from "./Prompts.js";
// Export session search (FTS5 and structured search)
export { SessionSearch } from "./SessionSearch.js";
// Export session store (CRUD operations for sessions, observations, summaries)
// @deprecated Use modular functions from Database.ts instead
export { SessionStore } from "./SessionStore.js";
// Re-export all modular functions for convenient access
export * from "./Sessions.js";
export * from "./Summaries.js";
export * from "./Timeline.js";
// Export transactions
export {
	storeObservations,
	storeObservationsAndMarkComplete,
} from "./transactions.js";
// Export types
export * from "./types.js";
