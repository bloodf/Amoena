import type { ParsedOutput } from "../types.js";

/**
 * Base output parser type. Each adapter implements its own concrete parser.
 */
export type OutputParser = (line: string) => ParsedOutput;
