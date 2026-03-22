import { describe, it, expect } from "vitest";
import {
  runConsensusVote,
  type ConsensusVote,
} from "./voting.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function vote(agentId: string, weight: number, score: number): ConsensusVote {
  return { agentId, weight, score, reasoning: `${agentId} says so` };
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("runConsensusVote — happy path", () => {
  it("calculates weighted average correctly for three agents", () => {
    const votes = [
      vote("a1", 2, 0.8),
      vote("a2", 1, 0.4),
      vote("a3", 1, 0.6),
    ];
    // weightedScore = (2*0.8 + 1*0.4 + 1*0.6) / 4 = 2.6/4 = 0.65
    const outcome = runConsensusVote(votes);
    expect(outcome.weightedScore).toBeCloseTo(0.65, 5);
    expect(outcome.totalWeight).toBe(4);
  });

  it("returns the votes array threshold in the outcome", () => {
    const outcome = runConsensusVote([vote("a1", 1, 0.9)], 0.7);
    expect(outcome.threshold).toBe(0.7);
  });
});

// ---------------------------------------------------------------------------
// Threshold: Approved / Rejected
// ---------------------------------------------------------------------------

describe("runConsensusVote — threshold decisions", () => {
  it("returns Approved when weighted score equals the threshold exactly", () => {
    // score 0.6, weight 1 → weightedScore = 0.6 == default threshold
    const outcome = runConsensusVote([vote("a1", 1, 0.6)]);
    expect(outcome.result).toBe("Approved");
  });

  it("returns Approved when weighted score is above the threshold", () => {
    const outcome = runConsensusVote([vote("a1", 1, 0.9)]);
    expect(outcome.result).toBe("Approved");
  });

  it("returns Rejected when weighted score is below the threshold", () => {
    const outcome = runConsensusVote([vote("a1", 1, 0.3)]);
    expect(outcome.result).toBe("Rejected");
  });

  it("respects a custom threshold passed by the caller", () => {
    // score 0.5 is below 0.75 threshold → Rejected
    const rejected = runConsensusVote([vote("a1", 1, 0.5)], 0.75);
    expect(rejected.result).toBe("Rejected");

    // score 0.5 is above 0.4 threshold → Approved
    const approved = runConsensusVote([vote("a1", 1, 0.5)], 0.4);
    expect(approved.result).toBe("Approved");
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("runConsensusVote — edge cases", () => {
  it("returns Inconclusive with null weightedScore when all agents abstain (weight 0)", () => {
    const votes = [
      vote("a1", 0, 0.9),
      vote("a2", 0, 0.1),
    ];
    const outcome = runConsensusVote(votes);
    expect(outcome.result).toBe("Inconclusive");
    expect(outcome.weightedScore).toBeNull();
    expect(outcome.totalWeight).toBe(0);
  });

  it("returns Inconclusive when the votes array is empty", () => {
    const outcome = runConsensusVote([]);
    expect(outcome.result).toBe("Inconclusive");
    expect(outcome.weightedScore).toBeNull();
  });

  it("handles a single voter correctly", () => {
    const outcome = runConsensusVote([vote("solo", 5, 0.8)]);
    expect(outcome.weightedScore).toBeCloseTo(0.8, 5);
    expect(outcome.totalWeight).toBe(5);
    expect(outcome.result).toBe("Approved");
  });

  it("handles an equal split (two voters at 0 and 1 → 0.5 score, below default threshold)", () => {
    const votes = [vote("yes", 1, 1.0), vote("no", 1, 0.0)];
    const outcome = runConsensusVote(votes);
    expect(outcome.weightedScore).toBeCloseTo(0.5, 5);
    expect(outcome.result).toBe("Rejected"); // 0.5 < 0.6 default
  });

  it("throws RangeError when threshold is outside [0, 1]", () => {
    expect(() => runConsensusVote([], 1.5)).toThrow(RangeError);
    expect(() => runConsensusVote([], -0.1)).toThrow(RangeError);
  });

  it("throws RangeError when a vote has negative weight", () => {
    expect(() => runConsensusVote([vote("bad", -1, 0.5)])).toThrow(RangeError);
  });

  it("throws RangeError when a vote score is outside [0, 1]", () => {
    expect(() => runConsensusVote([vote("bad", 1, 1.5)])).toThrow(RangeError);
    expect(() => runConsensusVote([vote("bad", 1, -0.1)])).toThrow(RangeError);
  });
});
