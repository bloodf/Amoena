/**
 * Search Module - Named exports for search functionality
 *
 * This is the public API for the search module.
 */

// Filters
export * from "./filters/DateFilter.js";
export * from "./filters/ProjectFilter.js";
export * from "./filters/TypeFilter.js";
// Formatters
export { ResultFormatter } from "./ResultFormatter.js";
// Main orchestrator
export { SearchOrchestrator } from "./SearchOrchestrator.js";
export { ChromaSearchStrategy } from "./strategies/ChromaSearchStrategy.js";
export { HybridSearchStrategy } from "./strategies/HybridSearchStrategy.js";
// Strategies
export type { SearchStrategy } from "./strategies/SearchStrategy.js";
export { BaseSearchStrategy } from "./strategies/SearchStrategy.js";
export { SQLiteSearchStrategy } from "./strategies/SQLiteSearchStrategy.js";
export type { TimelineData, TimelineItem } from "./TimelineBuilder.js";
export { TimelineBuilder } from "./TimelineBuilder.js";

// Types
export * from "./types.js";
