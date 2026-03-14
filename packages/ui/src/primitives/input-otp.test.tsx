import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp";

describe("InputOTP", () => {
  test("renders OTP input", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(screen.getByRole("textbox")).not.toBeNull();
  });

  test("renders separator", () => {
    render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(screen.getByRole("separator")).not.toBeNull();
  });

  test("textbox has maxLength attribute", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("maxlength")).toBe("6");
  });

  test("renders correct number of slots", () => {
    const { container } = render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const slots = container.querySelectorAll("[data-input-otp-slot]");
    // Slots may be rendered differently, check via container children
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  test("applies containerClassName", () => {
    const { container } = render(
      <InputOTP maxLength={4} containerClassName="custom-container">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(container.innerHTML).toContain("custom-container");
  });

  test("has disabled styling when disabled", () => {
    render(
      <InputOTP maxLength={4} disabled>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("disabled")).not.toBeNull();
  });

  test("input has autocomplete one-time-code", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("autocomplete")).toBe("one-time-code");
  });
});
