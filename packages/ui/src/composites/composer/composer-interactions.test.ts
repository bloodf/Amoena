import { act, renderHook } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { useComposerInteractions } from "./useComposerInteractions";
import type { ComposerAttachment } from "./types";
import type { ComposerAgentVariant } from "./config";
import { createRef } from "react";

const agents: ComposerAgentVariant[] = [
  { id: "sisyphus", name: "Sisyphus", role: "Ultraworker", color: "text-primary" },
  { id: "hephaestus", name: "Hephaestus", role: "Deep Agent", color: "text-primary" },
];

function makeHook(overrides: {
  message?: string;
  attachments?: ComposerAttachment[];
} = {}) {
  const setMessage = mock((v: string) => {});
  const setAttachments = mock((fn: unknown) => {});
  const onCycleAgent = mock(() => {});
  const onSelectAgent = mock((id: string) => {});
  const onAutocompleteOpen = mock(() => {});
  const textareaRef = createRef<HTMLTextAreaElement | null>() as React.RefObject<HTMLTextAreaElement | null>;

  let message = overrides.message ?? "";
  let attachments = overrides.attachments ?? [];

  const { result } = renderHook(() =>
    useComposerInteractions({
      message,
      setMessage: (v) => { message = v; setMessage(v); },
      attachments,
      setAttachments: setAttachments as React.Dispatch<React.SetStateAction<ComposerAttachment[]>>,
      textareaRef,
      agents,
      onCycleAgent,
      onSelectAgent,
      onAutocompleteOpen,
    })
  );

  return { result, setMessage, setAttachments, onCycleAgent, onSelectAgent, onAutocompleteOpen };
}

describe("useComposerInteractions", () => {
  test("initializes with closed autocomplete states", () => {
    const { result } = makeHook();
    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showUnifiedPalette).toBe(false);
    expect(result.current.showSkills).toBe(false);
    expect(result.current.isDragOver).toBe(false);
    expect(result.current.selectedIndex).toBe(0);
  });

  test("handleInput with @ opens file picker", () => {
    const { result, onAutocompleteOpen } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    expect(result.current.showFilePicker).toBe(true);
    expect(result.current.showUnifiedPalette).toBe(false);
    expect(result.current.showSkills).toBe(false);
    expect(onAutocompleteOpen).toHaveBeenCalled();
  });

  test("handleInput with $ opens skills picker", () => {
    const { result, onAutocompleteOpen } = makeHook();
    act(() => { result.current.handleInput("$brain"); });
    expect(result.current.showSkills).toBe(true);
    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showUnifiedPalette).toBe(false);
    expect(onAutocompleteOpen).toHaveBeenCalled();
  });

  test("handleInput with /command opens unified palette", () => {
    const { result, onAutocompleteOpen } = makeHook();
    act(() => { result.current.handleInput("/model"); });
    expect(result.current.showUnifiedPalette).toBe(true);
    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showSkills).toBe(false);
    expect(onAutocompleteOpen).toHaveBeenCalled();
  });

  test("handleInput with plain text closes autocomplete", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    act(() => { result.current.handleInput("hello world"); });
    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showUnifiedPalette).toBe(false);
    expect(result.current.showSkills).toBe(false);
  });

  test("/ in middle of string does not open palette (must be at start)", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("hello /model"); });
    expect(result.current.showUnifiedPalette).toBe(false);
  });

  test("closeAutocomplete closes all pickers", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    expect(result.current.showFilePicker).toBe(true);
    act(() => { result.current.closeAutocomplete(); });
    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showSkills).toBe(false);
    expect(result.current.showUnifiedPalette).toBe(false);
  });

  test("filteredFiles filters by filter text", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    expect(result.current.filteredFiles.some((f) => f.name.includes("tokens"))).toBe(true);
  });

  test("filteredSkills filters by skill name", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("$brain"); });
    expect(result.current.filteredSkills.length).toBeGreaterThan(0);
    expect(result.current.filteredSkills.some((s) => s.name.toLowerCase().includes("brain"))).toBe(true);
  });

  test("handleKeyDown ArrowDown increments selectedIndex", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@t"); });
    expect(result.current.selectedIndex).toBe(0);
    act(() => {
      result.current.handleKeyDown({ key: "ArrowDown", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    expect(result.current.selectedIndex).toBe(1);
  });

  test("handleKeyDown ArrowUp decrements selectedIndex but not below 0", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@t"); });
    act(() => {
      result.current.handleKeyDown({ key: "ArrowUp", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    expect(result.current.selectedIndex).toBe(0);
  });

  test("handleKeyDown ArrowDown does not exceed list length", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@tokens.rs"); });
    // filteredFiles will be small, set index to max via many ArrowDowns
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.handleKeyDown({ key: "ArrowDown", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
      });
    }
    expect(result.current.selectedIndex).toBeLessThanOrEqual(result.current.filteredFiles.length - 1);
  });

  test("handleKeyDown Escape closes autocomplete", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    act(() => {
      result.current.handleKeyDown({ key: "Escape", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    expect(result.current.showFilePicker).toBe(false);
  });

  test("handleKeyDown Enter selects file from file picker", () => {
    const { result, setMessage } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    act(() => {
      result.current.handleKeyDown({ key: "Enter", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    expect(result.current.showFilePicker).toBe(false);
  });

  test("handleKeyDown Tab selects file from file picker", () => {
    const { result } = makeHook();
    act(() => { result.current.handleInput("@tok"); });
    act(() => {
      result.current.handleKeyDown({ key: "Tab", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    expect(result.current.showFilePicker).toBe(false);
  });

  test("handleKeyDown Tab with empty message and no picker calls onCycleAgent", () => {
    const { result, onCycleAgent } = makeHook({ message: "" });
    act(() => {
      result.current.handleKeyDown({ key: "Tab", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    expect(onCycleAgent).toHaveBeenCalled();
  });

  test("handleKeyDown Enter with no pickers and no shift prevents default", () => {
    const { result } = makeHook({ message: "hello" });
    const preventDefault = mock(() => {});
    act(() => {
      result.current.handleKeyDown({ key: "Enter", shiftKey: false, preventDefault } as unknown as React.KeyboardEvent);
    });
    expect(preventDefault).toHaveBeenCalled();
  });

  test("handleKeyDown Enter with shift does not prevent default", () => {
    const { result } = makeHook({ message: "hello" });
    const preventDefault = mock(() => {});
    act(() => {
      result.current.handleKeyDown({ key: "Enter", shiftKey: true, preventDefault } as unknown as React.KeyboardEvent);
    });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test("removeAttachment calls setAttachments", () => {
    const { result, setAttachments } = makeHook({
      attachments: [{ type: "file", name: "foo.ts", path: "src/foo.ts" }],
    });
    act(() => { result.current.removeAttachment("src/foo.ts"); });
    expect(setAttachments).toHaveBeenCalled();
  });

  test("handleDragOver sets isDragOver to true", () => {
    const { result } = makeHook();
    act(() => {
      result.current.handleDragOver({
        preventDefault: mock(() => {}),
        dataTransfer: { dropEffect: "" },
      } as unknown as React.DragEvent);
    });
    expect(result.current.isDragOver).toBe(true);
  });

  test("handleDragLeave sets isDragOver to false when leaving container", () => {
    const { result } = makeHook();
    act(() => {
      result.current.handleDragOver({
        preventDefault: mock(() => {}),
        dataTransfer: { dropEffect: "" },
      } as unknown as React.DragEvent);
    });
    act(() => {
      result.current.handleDragLeave({
        currentTarget: { contains: () => false },
        relatedTarget: null,
      } as unknown as React.DragEvent);
    });
    expect(result.current.isDragOver).toBe(false);
  });

  test("handleDragLeave does not clear when still inside container", () => {
    const { result } = makeHook();
    act(() => {
      result.current.handleDragOver({
        preventDefault: mock(() => {}),
        dataTransfer: { dropEffect: "" },
      } as unknown as React.DragEvent);
    });
    act(() => {
      result.current.handleDragLeave({
        currentTarget: { contains: () => true },
        relatedTarget: {},
      } as unknown as React.DragEvent);
    });
    expect(result.current.isDragOver).toBe(true);
  });

  test("handleDrop with amoena/file JSON adds folder attachment", () => {
    const { result, setAttachments } = makeHook();
    act(() => {
      result.current.handleDrop({
        preventDefault: mock(() => {}),
        dataTransfer: {
          getData: (type: string) =>
            type === "amoena/file"
              ? JSON.stringify({ type: "folder", name: "src/auth", path: "src/auth", itemCount: 7 })
              : "",
          files: [],
        },
      } as unknown as React.DragEvent);
    });
    expect(setAttachments).toHaveBeenCalled();
  });

  test("handleDrop with invalid JSON does not throw", () => {
    const { result } = makeHook();
    expect(() => {
      act(() => {
        result.current.handleDrop({
          preventDefault: mock(() => {}),
          dataTransfer: {
            getData: () => "not-valid-json",
            files: [],
          },
        } as unknown as React.DragEvent);
      });
    }).not.toThrow();
  });

  test("handleDrop with native files adds file attachments", () => {
    const { result, setAttachments } = makeHook();
    const file = new File(["content"], "readme.md");
    act(() => {
      result.current.handleDrop({
        preventDefault: mock(() => {}),
        dataTransfer: {
          getData: () => "",
          files: [file],
        },
      } as unknown as React.DragEvent);
    });
    expect(setAttachments).toHaveBeenCalled();
  });

  test("handlePaste with file item adds attachment", () => {
    const { result, setAttachments } = makeHook();
    const file = new File(["content"], "image.png");
    act(() => {
      result.current.handlePaste({
        preventDefault: mock(() => {}),
        clipboardData: {
          items: [{ kind: "file", getAsFile: () => file }],
        },
      } as unknown as React.ClipboardEvent);
    });
    expect(setAttachments).toHaveBeenCalled();
  });

  test("handlePaste with non-file item does not add attachment", () => {
    const { result, setAttachments } = makeHook();
    act(() => {
      result.current.handlePaste({
        preventDefault: mock(() => {}),
        clipboardData: {
          items: [{ kind: "string", getAsFile: () => null }],
        },
      } as unknown as React.ClipboardEvent);
    });
    expect(setAttachments).not.toHaveBeenCalled();
  });

  test("openUnifiedPalette toggles palette and resets filter", () => {
    const { result, onAutocompleteOpen } = makeHook();
    act(() => { result.current.openUnifiedPalette(); });
    expect(result.current.showUnifiedPalette).toBe(true);
    expect(onAutocompleteOpen).toHaveBeenCalled();
    // Toggle off
    act(() => { result.current.openUnifiedPalette(); });
    expect(result.current.showUnifiedPalette).toBe(false);
  });

  test("handlePaletteSelect with commands category sets message", () => {
    const { result, setMessage } = makeHook();
    act(() => { result.current.handleInput("/mod"); });
    act(() => {
      result.current.handlePaletteSelect({
        category: "commands",
        id: "cmd-model",
        name: "/model",
        desc: "Switch model",
        Icon: {} as unknown as import("lucide-react").LucideIcon,
      });
    });
    expect(setMessage).toHaveBeenCalledWith("/model ");
  });

  test("handlePaletteSelect with agents category calls onSelectAgent", () => {
    const { result, onSelectAgent } = makeHook();
    act(() => {
      result.current.handlePaletteSelect({
        category: "agents",
        id: "agent-sisyphus",
        name: "Sisyphus",
        desc: "Ultraworker",
        Icon: {} as unknown as import("lucide-react").LucideIcon,
      });
    });
    expect(onSelectAgent).toHaveBeenCalledWith("sisyphus");
  });

  test("handlePaletteSelect with unknown agent id does not crash", () => {
    const { result } = makeHook();
    expect(() => {
      act(() => {
        result.current.handlePaletteSelect({
          category: "agents",
          id: "agent-unknown-xyz",
          name: "Unknown",
          desc: "",
          Icon: {} as unknown as import("lucide-react").LucideIcon,
        });
      });
    }).not.toThrow();
  });

  test("insertSkill removes $ trigger and closes skills picker", () => {
    const { result, setMessage } = makeHook({ message: "$brain" });
    act(() => { result.current.handleInput("$brain"); });
    act(() => {
      result.current.insertSkill({ name: "Brainstorming", desc: "Creative work", Icon: {} as unknown as import("lucide-react").LucideIcon, source: "project" });
    });
    expect(result.current.showSkills).toBe(false);
  });

  test("addAttachment does not add duplicate path", () => {
    const existingAttachment: ComposerAttachment = { type: "file", name: "tokens.rs", path: "src/auth/tokens.rs" };
    const setAttachments = mock(() => {});
    const setMessage = mock(() => {});
    const onCycleAgent = mock(() => {});
    const onSelectAgent = mock(() => {});
    const onAutocompleteOpen = mock(() => {});
    const textareaRef = createRef<HTMLTextAreaElement | null>() as React.RefObject<HTMLTextAreaElement | null>;

    const { result } = renderHook(() =>
      useComposerInteractions({
        message: "@tok",
        setMessage,
        attachments: [existingAttachment],
        setAttachments: setAttachments as React.Dispatch<React.SetStateAction<ComposerAttachment[]>>,
        textareaRef,
        agents,
        onCycleAgent,
        onSelectAgent,
        onAutocompleteOpen,
      })
    );

    act(() => { result.current.handleInput("@tok"); });
    act(() => {
      result.current.handleKeyDown({ key: "Enter", preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent);
    });
    // setAttachments should not have been called because the path already exists
    expect(setAttachments).not.toHaveBeenCalled();
  });
});
