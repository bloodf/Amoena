import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { AgentManagementTabs } from "./AgentManagementTabs";

describe("AgentManagementTabs", () => {
  test("renders Agents and Teams tabs", () => {
    render(<AgentManagementTabs activeTab="agents" onChange={mock(() => {})} />);
    expect(screen.getByText("Agents")).toBeTruthy();
    expect(screen.getByText("Teams")).toBeTruthy();
  });

  test("highlights active agents tab", () => {
    render(<AgentManagementTabs activeTab="agents" onChange={mock(() => {})} />);
    const agentsBtn = screen.getByText("Agents");
    expect(agentsBtn.className).toContain("border-primary");
  });

  test("highlights active teams tab", () => {
    render(<AgentManagementTabs activeTab="teams" onChange={mock(() => {})} />);
    const teamsBtn = screen.getByText("Teams").closest("button")!;
    expect(teamsBtn.className).toContain("border-primary");
  });

  test("calls onChange with agents when Agents tab clicked", () => {
    const onChange = mock((_tab: "agents" | "teams") => {});
    render(<AgentManagementTabs activeTab="teams" onChange={onChange} />);
    fireEvent.click(screen.getByText("Agents"));
    expect(onChange).toHaveBeenCalledWith("agents");
  });

  test("calls onChange with teams when Teams tab clicked", () => {
    const onChange = mock((_tab: "agents" | "teams") => {});
    render(<AgentManagementTabs activeTab="agents" onChange={onChange} />);
    fireEvent.click(screen.getByText("Teams"));
    expect(onChange).toHaveBeenCalledWith("teams");
  });
});
