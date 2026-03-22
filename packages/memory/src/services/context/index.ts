/**
 * Context Module - Public API
 *
 * Re-exports the main context generation functionality.
 */

export { generateContext } from "./ContextBuilder.js";
// Component exports for advanced usage
export { loadContextConfig } from "./ContextConfigLoader.js";
export {
	buildTimeline,
	getPriorSessionMessages,
	queryObservations,
	querySummaries,
} from "./ObservationCompiler.js";
export {
	calculateObservationTokens,
	calculateTokenEconomics,
} from "./TokenCalculator.js";
export type { ContextConfig, ContextInput } from "./types.js";
