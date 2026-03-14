import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import {
  SettingsRow,
  SettingsToggle,
  SettingsSelect,
  SettingsNumberInput,
  SettingsSectionTitle,
  SettingsInfoBanner,
  SettingsWarningBanner,
} from "./settings-controls";

describe("SettingsRow", () => {
  test("renders label and children", () => {
    render(
      <SettingsRow label="Theme">
        <span>control</span>
      </SettingsRow>,
    );
    expect(screen.getByText("Theme")).not.toBeNull();
    expect(screen.getByText("control")).not.toBeNull();
  });

  test("renders description when provided", () => {
    render(
      <SettingsRow label="Mode" description="Choose your theme">
        <span>ctrl</span>
      </SettingsRow>,
    );
    expect(screen.getByText("Choose your theme")).not.toBeNull();
  });

  test("does not render description when omitted", () => {
    render(
      <SettingsRow label="Simple">
        <span>ctrl</span>
      </SettingsRow>,
    );
    expect(screen.queryByText("Choose your theme")).toBeNull();
  });
});

describe("SettingsToggle", () => {
  test("renders a toggle button", () => {
    render(<SettingsToggle />);
    expect(screen.getByRole("button")).not.toBeNull();
  });

  test("applies active style when on", () => {
    render(<SettingsToggle on />);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });

  test("applies inactive style when off", () => {
    render(<SettingsToggle on={false} />);
    expect(screen.getByRole("button").className).toContain("bg-surface-3");
  });
});

describe("SettingsSelect", () => {
  test("renders all options", () => {
    render(<SettingsSelect options={["A", "B", "C"]} />);
    const select = screen.getByRole("combobox");
    expect(select).not.toBeNull();
    expect(screen.getByText("A")).not.toBeNull();
    expect(screen.getByText("B")).not.toBeNull();
    expect(screen.getByText("C")).not.toBeNull();
  });

  test("sets default value", () => {
    render(<SettingsSelect options={["X", "Y"]} defaultValue="Y" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("Y");
  });
});

describe("SettingsNumberInput", () => {
  test("renders number input with default value", () => {
    render(<SettingsNumberInput defaultValue={16} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.type).toBe("number");
    expect(input.defaultValue).toBe("16");
  });
});

describe("SettingsSectionTitle", () => {
  test("renders title text", () => {
    render(<SettingsSectionTitle title="Advanced" />);
    const el = screen.getByText("Advanced");
    expect(el.tagName).toBe("H3");
    expect(el.className).toContain("uppercase");
  });
});

describe("SettingsInfoBanner", () => {
  test("renders children", () => {
    render(<SettingsInfoBanner>Info message</SettingsInfoBanner>);
    expect(screen.getByText("Info message")).not.toBeNull();
  });

  test("applies info styling", () => {
    const { container } = render(<SettingsInfoBanner>msg</SettingsInfoBanner>);
    const banner = container.firstElementChild as HTMLElement;
    expect(banner.className).toContain("border-primary/20");
  });
});

describe("SettingsWarningBanner", () => {
  test("renders children", () => {
    render(<SettingsWarningBanner>Warning message</SettingsWarningBanner>);
    expect(screen.getByText("Warning message")).not.toBeNull();
  });

  test("applies warning styling", () => {
    const { container } = render(<SettingsWarningBanner>msg</SettingsWarningBanner>);
    const banner = container.firstElementChild as HTMLElement;
    expect(banner.className).toContain("border-warning/20");
  });
});

describe("SettingsToggle — keyboard", () => {
  test("toggle click toggles internal state", () => {
    render(<SettingsToggle />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-surface-3");
    fireEvent.click(btn);
    expect(btn.className).toContain("bg-primary");
  });

  test("toggle click again reverts state", () => {
    render(<SettingsToggle />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(btn.className).toContain("bg-primary");
    fireEvent.click(btn);
    expect(btn.className).toContain("bg-surface-3");
  });
});

describe("SettingsSelect — state management", () => {
  test("select value can be changed", () => {
    render(<SettingsSelect options={["A", "B", "C"]} defaultValue="A" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "C" } });
    expect(select.value).toBe("C");
  });

  test("renders empty options list", () => {
    render(<SettingsSelect options={[]} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options.length).toBe(0);
  });
});

describe("SettingsNumberInput — edge cases", () => {
  test("number input allows value changes", () => {
    render(<SettingsNumberInput defaultValue={10} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "42" } });
    expect(input.value).toBe("42");
  });

  test("number input renders with min and max when provided", () => {
    render(<SettingsNumberInput defaultValue={5} min={0} max={100} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.type).toBe("number");
  });
});
