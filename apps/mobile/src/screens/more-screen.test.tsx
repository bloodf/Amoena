import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MoreScreen } from "./more-screen";

vi.mock("@lunaria/i18n", () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

describe("MoreScreen", () => {
  it("renders all menu items", () => {
    const { getByText } = render(<MoreScreen />);

    expect(getByText("mobile.more")).toBeTruthy();
    expect(getByText("mobile.workspaces")).toBeTruthy();
    expect(getByText("mobile.extensions")).toBeTruthy();
    expect(getByText("mobile.settings")).toBeTruthy();
    expect(getByText("mobile.device")).toBeTruthy();
  });
});
