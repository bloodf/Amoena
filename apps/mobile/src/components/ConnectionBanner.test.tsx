import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConnectionBanner } from "./ConnectionBanner";

describe("ConnectionBanner", () => {
  it("renders the connection message", () => {
    render(<ConnectionBanner message="Connection lost" />);

    expect(screen.getByText("Connection lost")).toBeTruthy();
  });
});
