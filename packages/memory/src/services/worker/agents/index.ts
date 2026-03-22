/**
 * Agent Consolidation Module
 *
 * This module provides shared utilities for SDK, Gemini, and OpenRouter agents.
 * It extracts common patterns to reduce code duplication and ensure consistent behavior.
 *
 * Usage:
 * ```typescript
 * import { processAgentResponse, shouldFallbackToClaude } from './agents/index.js';
 * ```
 */

// Error Handling
export {
	isAbortError,
	shouldFallbackToClaude,
} from "./FallbackErrorHandler.js";
// SSE Broadcasting
export {
	broadcastObservation,
	broadcastSummary,
} from "./ObservationBroadcaster.js";

// Response Processing
export { processAgentResponse } from "./ResponseProcessor.js";
// Session Cleanup
export { cleanupProcessedMessages } from "./SessionCleanupHelper.js";
// Types
export type {
	BaseAgentConfig,
	FallbackAgent,
	ObservationSSEPayload,
	ParsedResponse,
	ResponseProcessingContext,
	SSEEventPayload,
	StorageResult,
	SummarySSEPayload,
	WorkerRef,
} from "./types.js";
export { FALLBACK_ERROR_PATTERNS } from "./types.js";
