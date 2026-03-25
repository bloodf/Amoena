import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CostBadge } from "./CostBadge";

describe("CostBadge", () => {
  describe("compact format", () => {
    it("shows '<1c' for very small costs", () => {
      render(<CostBadge costUsd={0.005} compact />);
      expect(screen.getAllByText("<1c").length).toBeGreaterThanOrEqual(1);
    });

    it("shows cents for costs under $1", () => {
      render(<CostBadge costUsd={0.05} compact />);
      expect(screen.getAllByText("5c").length).toBeGreaterThanOrEqual(1);
    });

    it("shows dollar format for costs >= $1", () => {
      render(<CostBadge costUsd={2.5} compact />);
      expect(screen.getAllByText("$2.50").length).toBeGreaterThanOrEqual(1);
    });

    it("rounds cents correctly", () => {
      render(<CostBadge costUsd={0.156} compact />);
      expect(screen.getAllByText("16c").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("full format", () => {
    it("shows 4 decimal places", () => {
      render(<CostBadge costUsd={0.0523} />);
      expect(screen.getAllByText("$0.0523").length).toBeGreaterThanOrEqual(1);
    });

    it("shows 4 decimal places for large values", () => {
      render(<CostBadge costUsd={12.345} />);
      expect(screen.getAllByText("$12.3450").length).toBeGreaterThanOrEqual(1);
    });

    it("formats zero correctly", () => {
      render(<CostBadge costUsd={0} />);
      expect(screen.getAllByText("$0.0000").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("color coding", () => {
    it("renders green-tier cost without crashing", () => {
      const { container } = render(<CostBadge costUsd={0.05} />);
      expect(container).toBeTruthy();
    });

    it("renders yellow-tier cost without crashing", () => {
      const { container } = render(<CostBadge costUsd={0.5} />);
      expect(container).toBeTruthy();
    });

    it("renders red-tier cost without crashing", () => {
      const { container } = render(<CostBadge costUsd={1.5} />);
      expect(container).toBeTruthy();
    });
  });

  it("handles exact $1.00 boundary", () => {
    render(<CostBadge costUsd={1.0} compact />);
    expect(screen.getAllByText("$1.00").length).toBeGreaterThanOrEqual(1);
  });

  it("handles exact $0.10 boundary in compact", () => {
    render(<CostBadge costUsd={0.1} compact />);
    expect(screen.getAllByText("10c").length).toBeGreaterThanOrEqual(1);
  });
});
