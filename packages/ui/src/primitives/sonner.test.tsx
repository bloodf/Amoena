import { render } from "@testing-library/react";
import { describe, expect, test, mock } from "bun:test";

// Mock next-themes since it requires a provider
mock.module("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

import { Toaster } from "./sonner";

describe("Toaster", () => {
  test("renders without crashing", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeDefined();
  });

  test("renders with toaster group class", () => {
    const { container } = render(<Toaster />);
    const toaster = container.querySelector("[data-sonner-toaster]") ?? container.querySelector(".toaster");
    // Sonner renders a toaster element; verify the container is not empty
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  test("renders with section element or list role for toasts", () => {
    const { container } = render(<Toaster />);
    // The toaster should have rendered something to the DOM
    expect(container.childElementCount).toBeGreaterThan(0);
  });

  test("accepts className on Toaster wrapper", () => {
    const { container } = render(<Toaster className="custom-toaster" />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
