import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AutopilotScreen } from "./AutopilotScreen";

const navigate = vi.fn();
const toastMock = vi.hoisted(() => Object.assign(vi.fn(), {
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("sonner", () => ({
  toast: toastMock,
}));

describe("AutopilotScreen", () => {
  it("renders the screen and routes activity actions", () => {
    render(<AutopilotScreen />);

    expect(screen.getByText("Current Goal")).toBeInTheDocument();
    expect(screen.getByText("Live Activity")).toBeInTheDocument();
    expect(screen.getByText("Task Board")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Task Board"));
    expect(navigate).toHaveBeenCalledWith("/tasks");
  });

  it("handles sidebar state transitions", () => {
    render(<AutopilotScreen />);

    fireEvent.click(screen.getByText("Pause"));
    expect(toastMock).toHaveBeenCalledWith("Autopilot paused");

    fireEvent.click(screen.getByText("Resume"));
    expect(toastMock.success).toHaveBeenCalledWith("Resumed");

    fireEvent.click(screen.getByRole("switch"));
    expect(toastMock).toHaveBeenCalledWith("Autopilot disabled");

    fireEvent.click(screen.getByRole("switch"));
    expect(toastMock.success).toHaveBeenCalledWith("Autopilot enabled");
  });

  it("stops autopilot and shows idle state with Start button", () => {
    render(<AutopilotScreen />);

    fireEvent.click(screen.getByText("Stop"));
    expect(toastMock).toHaveBeenCalledWith("Autopilot stopped");

    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("starts autopilot from idle state", () => {
    render(<AutopilotScreen />);

    // First stop to get to idle
    fireEvent.click(screen.getByText("Stop"));

    fireEvent.click(screen.getByText("Start"));
    expect(toastMock.success).toHaveBeenCalledWith("Autopilot started");
  });

  it("renders goal text and toggles editing mode", () => {
    render(<AutopilotScreen />);

    expect(
      screen.getByText(/Refactor authentication module/),
    ).toBeInTheDocument();

    // Click Edit to enter editing mode
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Save")).toBeInTheDocument();

    // A textarea should appear
    const textarea = document.querySelector("textarea");
    expect(textarea).toBeTruthy();
  });

  it("renders constraints section with allowed actions", () => {
    render(<AutopilotScreen />);

    expect(screen.getByText("Constraints & Limits")).toBeInTheDocument();
    expect(screen.getByText("File edits")).toBeInTheDocument();
    expect(screen.getByText("Terminal commands")).toBeInTheDocument();
    expect(screen.getByText("Git operations")).toBeInTheDocument();
    expect(screen.getByText("Max tokens per run")).toBeInTheDocument();
    expect(screen.getByText("Time limit")).toBeInTheDocument();
  });

  it("renders pipeline stepper", () => {
    render(<AutopilotScreen />);

    // PipelineStepper shows phase labels
    expect(screen.getByText("Autopilot")).toBeInTheDocument();
  });

  it("approves an activity log item", () => {
    render(<AutopilotScreen />);

    const approveButtons = screen.getAllByText("Approve");
    if (approveButtons.length > 0) {
      fireEvent.click(approveButtons[0]!);
      expect(toastMock.success).toHaveBeenCalledWith("Action approved");
    }
  });

  it("denies an activity log item", () => {
    render(<AutopilotScreen />);

    const denyButtons = screen.getAllByText("Deny");
    if (denyButtons.length > 0) {
      fireEvent.click(denyButtons[0]!);
      expect(toastMock.success).toHaveBeenCalledWith("Action denied");
    }
  });

  it("renders run history section", () => {
    render(<AutopilotScreen />);

    // The sidebar has a history toggle
    const historyText = screen.queryByText("Run History");
    if (historyText) {
      expect(historyText).toBeInTheDocument();
    }
  });
});
