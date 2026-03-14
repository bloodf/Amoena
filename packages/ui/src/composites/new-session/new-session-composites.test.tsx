import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";

import { ContextDropzone } from "./ContextDropzone";
import { ModelPicker } from "./ModelPicker";
import { NewSessionFieldLabel } from "./NewSessionFieldLabel";
import { NewSessionModalFooter } from "./NewSessionModalFooter";
import { NewSessionModalHeader } from "./NewSessionModalHeader";
import { PermissionPresetPicker } from "./PermissionPresetPicker";
import { ExternalProviderCard, FeaturedProviderCard } from "./ProviderCard";
import { ProviderPicker } from "./ProviderPicker";
import { ReasoningControls } from "./ReasoningControls";
import { SessionOptionGrid } from "./SessionOptionGrid";
import {
  newSessionPermissionPresets,
  newSessionProviders,
  newSessionReasoningDepths,
  newSessionWorkTargets,
} from "./data";

describe("ProviderPicker", () => {
  test("renders all providers", () => {
    render(
      <ProviderPicker
        providers={newSessionProviders}
        selectedProvider="lunaria"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Lunaria AI")).toBeTruthy();
    expect(screen.getByText("Claude Code")).toBeTruthy();
    expect(screen.getByText("OpenCode")).toBeTruthy();
    expect(screen.getByText("Codex CLI")).toBeTruthy();
    expect(screen.getByText("Gemini CLI")).toBeTruthy();
    expect(screen.getByText("Ollama")).toBeTruthy();
  });

  test("fires onSelect when clicking a provider", () => {
    const onSelect = mock(() => {});
    render(
      <ProviderPicker
        providers={newSessionProviders}
        selectedProvider="lunaria"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("Claude Code"));
    expect(onSelect).toHaveBeenCalledWith("claude");
  });
});

describe("FeaturedProviderCard", () => {
  const provider = newSessionProviders[0]!;

  test("renders provider label and description", () => {
    render(<FeaturedProviderCard provider={provider} onSelect={() => {}} />);
    expect(screen.getByText("Lunaria AI")).toBeTruthy();
    expect(screen.getByText(provider.desc)).toBeTruthy();
  });

  test("renders model badges", () => {
    render(<FeaturedProviderCard provider={provider} onSelect={() => {}} />);
    expect(screen.getByText("Lunaria Pro")).toBeTruthy();
    expect(screen.getByText("Lunaria Fast")).toBeTruthy();
  });

  test("fires onSelect when clicked", () => {
    const onSelect = mock(() => {});
    render(<FeaturedProviderCard provider={provider} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Lunaria AI"));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("ExternalProviderCard", () => {
  const provider = newSessionProviders[1]!;

  test("renders provider label, desc, and models", () => {
    render(<ExternalProviderCard provider={provider} onSelect={() => {}} />);
    expect(screen.getByText("Claude Code")).toBeTruthy();
    expect(screen.getByText(provider.desc)).toBeTruthy();
    expect(screen.getByText("Claude 4 Sonnet")).toBeTruthy();
  });

  test("fires onSelect when clicked", () => {
    const onSelect = mock(() => {});
    render(<ExternalProviderCard provider={provider} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Claude Code"));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("SessionOptionGrid", () => {
  test("renders all work target options", () => {
    render(
      <SessionOptionGrid
        options={newSessionWorkTargets}
        selected="local"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Local Project")).toBeTruthy();
    expect(screen.getByText("New Worktree")).toBeTruthy();
    expect(screen.getByText("Cloud")).toBeTruthy();
  });

  test("fires onSelect with the option id", () => {
    const onSelect = mock(() => {});
    render(
      <SessionOptionGrid
        options={newSessionWorkTargets}
        selected="local"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("New Worktree"));
    expect(onSelect).toHaveBeenCalledWith("worktree");
  });
});

describe("ModelPicker", () => {
  const models = ["Claude 4 Sonnet", "Claude 4 Opus", "Claude 3.5 Sonnet"];

  test("renders all model buttons", () => {
    render(
      <ModelPicker models={models} selectedModel="Claude 4 Sonnet" onSelect={() => {}} />,
    );
    expect(screen.getByText("Claude 4 Sonnet")).toBeTruthy();
    expect(screen.getByText("Claude 4 Opus")).toBeTruthy();
    expect(screen.getByText("Claude 3.5 Sonnet")).toBeTruthy();
  });

  test("fires onSelect with the model name", () => {
    const onSelect = mock(() => {});
    render(
      <ModelPicker models={models} selectedModel="Claude 4 Sonnet" onSelect={onSelect} />,
    );
    fireEvent.click(screen.getByText("Claude 4 Opus"));
    expect(onSelect).toHaveBeenCalledWith("Claude 4 Opus");
  });
});

describe("PermissionPresetPicker", () => {
  test("renders all presets", () => {
    render(
      <PermissionPresetPicker
        presets={newSessionPermissionPresets}
        selected="default"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Default")).toBeTruthy();
    expect(screen.getByText("Full Access")).toBeTruthy();
    expect(screen.getByText("Plan Only")).toBeTruthy();
    expect(screen.getByText("Read Only")).toBeTruthy();
  });

  test("fires onSelect with preset id", () => {
    const onSelect = mock(() => {});
    render(
      <PermissionPresetPicker
        presets={newSessionPermissionPresets}
        selected="default"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("Full Access"));
    expect(onSelect).toHaveBeenCalledWith("full");
  });
});

describe("ReasoningControls", () => {
  test("renders mode select and depth buttons", () => {
    render(
      <ReasoningControls
        mode="auto"
        depth="medium"
        depths={newSessionReasoningDepths}
        onModeChange={() => {}}
        onDepthChange={() => {}}
      />,
    );
    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("Medium")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
    expect(screen.getByText("Extra High")).toBeTruthy();
  });

  test("fires onDepthChange on depth button click", () => {
    const onDepthChange = mock(() => {});
    render(
      <ReasoningControls
        mode="auto"
        depth="medium"
        depths={newSessionReasoningDepths}
        onModeChange={() => {}}
        onDepthChange={onDepthChange}
      />,
    );
    fireEvent.click(screen.getByText("High"));
    expect(onDepthChange).toHaveBeenCalledWith("high");
  });

  test("fires onModeChange when select changes", () => {
    const onModeChange = mock(() => {});
    render(
      <ReasoningControls
        mode="auto"
        depth="medium"
        depths={newSessionReasoningDepths}
        onModeChange={onModeChange}
        onDepthChange={() => {}}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "always" } });
    expect(onModeChange).toHaveBeenCalledWith("always");
  });
});

describe("ContextDropzone", () => {
  test("renders dropzone text", () => {
    render(<ContextDropzone />);
    expect(screen.getByText("Drop files or click to attach context...")).toBeTruthy();
  });
});

describe("NewSessionFieldLabel", () => {
  test("renders children", () => {
    render(<NewSessionFieldLabel>Provider</NewSessionFieldLabel>);
    expect(screen.getByText("Provider")).toBeTruthy();
  });
});

describe("NewSessionModalHeader", () => {
  test("renders title", () => {
    render(<NewSessionModalHeader onClose={() => {}} />);
    expect(screen.getByText("New Session")).toBeTruthy();
  });

  test("fires onClose when close button is clicked", () => {
    const onClose = mock(() => {});
    render(<NewSessionModalHeader onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("NewSessionModalFooter", () => {
  test("renders cancel and create buttons", () => {
    render(<NewSessionModalFooter onClose={() => {}} onCreate={() => {}} />);
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Create Session")).toBeTruthy();
  });

  test("fires onClose when cancel is clicked", () => {
    const onClose = mock(() => {});
    render(<NewSessionModalFooter onClose={onClose} onCreate={() => {}} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  test("fires onCreate when create button is clicked", () => {
    const onCreate = mock(() => {});
    render(<NewSessionModalFooter onClose={() => {}} onCreate={onCreate} />);
    fireEvent.click(screen.getByText("Create Session"));
    expect(onCreate).toHaveBeenCalled();
  });
});
