import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { QueuePanel } from "./QueuePanel";

const messages = [
  { id: "1", content: "Fix the login bug", queueType: "app" as const, status: "pending", orderIndex: 0 },
  { id: "2", content: "Add unit tests", queueType: "app" as const, status: "pending", orderIndex: 1 },
  { id: "3", content: "Deploy to staging", queueType: "app" as const, status: "sent", orderIndex: 2 },
];

function makeHandlers() {
  return {
    onEdit: mock(() => {}),
    onRemove: mock(() => {}),
    onReorder: mock(() => {}),
    onFlush: mock(() => {}),
  };
}

describe("QueuePanel", () => {
  test("shows empty state when no messages", () => {
    render(<QueuePanel messages={[]} {...makeHandlers()} />);
    // empty state paragraph rendered
    const paras = screen.getAllByRole("paragraph").concat(
      Array.from(document.querySelectorAll("p")),
    );
    expect(paras.length).toBeGreaterThan(0);
  });

  test("renders message list", () => {
    render(<QueuePanel messages={messages} {...makeHandlers()} />);
    expect(screen.getByText("Fix the login bug")).toBeTruthy();
    expect(screen.getByText("Add unit tests")).toBeTruthy();
    expect(screen.getByText("Deploy to staging")).toBeTruthy();
  });

  test("shows pending count", () => {
    render(<QueuePanel messages={messages} {...makeHandlers()} />);
    expect(screen.getByText(/2/)).toBeTruthy();
  });

  test("calls onRemove when Remove clicked", () => {
    const handlers = makeHandlers();
    render(<QueuePanel messages={messages} {...handlers} />);
    const removeButtons = screen.getAllByRole("button").filter(
      (b) => b.className.includes("destructive") || b.textContent?.toLowerCase().includes("remove") || b.textContent?.toLowerCase().includes("queue.remove"),
    );
    fireEvent.click(removeButtons[0]);
    expect(handlers.onRemove).toHaveBeenCalledWith("1");
  });

  test("calls onFlush when Send Next clicked", () => {
    const handlers = makeHandlers();
    render(<QueuePanel messages={messages} {...handlers} />);
    const buttons = screen.getAllByRole("button");
    const flushBtn = buttons.find(
      (b) => b.className.includes("primary") && !b.className.includes("text-xs px-1"),
    );
    if (flushBtn) fireEvent.click(flushBtn);
    expect(handlers.onFlush).toHaveBeenCalled();
  });

  test("shows edit form when Edit clicked", () => {
    render(<QueuePanel messages={messages} {...makeHandlers()} />);
    const editButtons = screen.getAllByRole("button").filter(
      (b) => b.textContent?.toLowerCase().includes("edit") || b.textContent?.toLowerCase().includes("queue.edit"),
    );
    fireEvent.click(editButtons[0]);
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  test("calls onEdit with new content on Save", () => {
    const handlers = makeHandlers();
    render(<QueuePanel messages={messages} {...handlers} />);
    const editButtons = screen.getAllByRole("button").filter(
      (b) => b.textContent?.toLowerCase().includes("edit") || b.textContent?.toLowerCase().includes("queue.edit"),
    );
    fireEvent.click(editButtons[0]);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated content" } });
    const saveBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.toLowerCase().includes("save") || b.textContent?.toLowerCase().includes("queue.save"),
    );
    if (saveBtn) fireEvent.click(saveBtn);
    expect(handlers.onEdit).toHaveBeenCalledWith("1", "Updated content");
  });
});
