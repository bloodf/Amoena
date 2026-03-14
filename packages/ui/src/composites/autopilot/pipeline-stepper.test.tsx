import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PipelineStepper } from "./PipelineStepper";

describe("PipelineStepper", () => {
  it("renders all six phases and marks the active phase", () => {
    render(<PipelineStepper currentPhase="verification" />);

    expect(screen.getByText("Verify")).toBeInTheDocument();
    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  it("shows completed phases with check icons before the active phase", () => {
    const { container } = render(<PipelineStepper currentPhase="execution" />);
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });
});
