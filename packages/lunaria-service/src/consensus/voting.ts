/**
 * Weighted consensus voting for multi-agent decision making.
 *
 * Each participating agent casts a vote with a numeric weight and a score
 * in [0, 1].  The aggregated weighted average is compared against a
 * configurable threshold to produce a final `ConsensusResult`.
 */

/** A single vote cast by one agent. */
export interface ConsensusVote {
  /** Identifier of the agent casting this vote. */
  readonly agentId: string;
  /**
   * Relative importance of this agent's opinion.
   * Must be >= 0.  Agents with weight 0 effectively abstain.
   */
  readonly weight: number;
  /**
   * Confidence / approval score in the range [0, 1].
   * 0 = strongly reject, 1 = strongly approve.
   */
  readonly score: number;
  /** Human-readable rationale for the vote. */
  readonly reasoning: string;
}

/** The outcome of a consensus vote. */
export type ConsensusResult = "Approved" | "Rejected" | "Inconclusive";

/** Full output of `runConsensusVote`, including the aggregate score. */
export interface ConsensusOutcome {
  /** Final decision. */
  readonly result: ConsensusResult;
  /**
   * Weighted average score used to reach the decision.
   * `null` when no weighted votes were cast (all abstained).
   */
  readonly weightedScore: number | null;
  /** Threshold that was applied. */
  readonly threshold: number;
  /** Total weight of all non-zero votes that participated. */
  readonly totalWeight: number;
}

/** Default approval threshold (60 %). */
const DEFAULT_THRESHOLD = 0.6;

/**
 * Validates that a vote is structurally sound.
 * Throws a descriptive error on first violation found.
 */
function validateVote(vote: ConsensusVote, index: number): void {
  if (vote.weight < 0) {
    throw new RangeError(
      `Vote at index ${index} (agent "${vote.agentId}") has negative weight ${vote.weight}.`,
    );
  }
  if (vote.score < 0 || vote.score > 1) {
    throw new RangeError(
      `Vote at index ${index} (agent "${vote.agentId}") has score ${vote.score} outside [0, 1].`,
    );
  }
}

/**
 * Runs a weighted consensus vote and returns the outcome.
 *
 * Algorithm:
 *   weightedScore = Σ(weight_i × score_i) / Σ(weight_i)
 *
 * Edge cases:
 * - Empty votes array → Inconclusive (no participants).
 * - All weights are 0 (all agents abstain) → Inconclusive.
 * - weightedScore >= threshold → Approved, otherwise → Rejected.
 *
 * @param votes - Array of votes from participating agents.
 * @param threshold - Approval threshold in [0, 1].  Defaults to 0.6.
 * @returns `ConsensusOutcome` with result, weighted score, and metadata.
 *
 * @example
 * ```ts
 * const outcome = runConsensusVote([
 *   { agentId: "a1", weight: 2, score: 0.8, reasoning: "looks good" },
 *   { agentId: "a2", weight: 1, score: 0.4, reasoning: "risky" },
 * ]);
 * // weightedScore = (2*0.8 + 1*0.4) / 3 ≈ 0.667 → Approved
 * ```
 */
export function runConsensusVote(
  votes: ReadonlyArray<ConsensusVote>,
  threshold: number = DEFAULT_THRESHOLD,
): ConsensusOutcome {
  if (threshold < 0 || threshold > 1) {
    throw new RangeError(`Threshold ${threshold} must be in [0, 1].`);
  }

  votes.forEach((vote, i) => validateVote(vote, i));

  const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);

  if (totalWeight === 0) {
    return { result: "Inconclusive", weightedScore: null, threshold, totalWeight };
  }

  const weightedScore =
    votes.reduce((sum, v) => sum + v.weight * v.score, 0) / totalWeight;

  const result: ConsensusResult = weightedScore >= threshold ? "Approved" : "Rejected";

  return { result, weightedScore, threshold, totalWeight };
}
