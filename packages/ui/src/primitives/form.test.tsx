import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";

function TestForm() {
  const form = useForm({ defaultValues: { email: "" } });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>We will never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Send</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  test("renders form fields", () => {
    render(<TestForm />);

    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(screen.getByText("We will never share your email.")).toBeTruthy();
  });

  test("renders submit button", () => {
    render(<TestForm />);

    expect(screen.getByRole("button", { name: "Send" })).toBeTruthy();
  });

  test("label is associated with input via htmlFor", () => {
    render(<TestForm />);
    const label = screen.getByText("Email");
    const input = screen.getByPlaceholderText("you@example.com");
    // FormLabel renders with htmlFor matching the input's id
    const labelFor = label.getAttribute("for");
    const inputId = input.getAttribute("id");
    expect(labelFor).toBeTruthy();
    expect(labelFor).toBe(inputId);
  });

  test("description has id linked via aria-describedby", () => {
    render(<TestForm />);
    const input = screen.getByPlaceholderText("you@example.com");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!.split(" ")[0]);
    expect(descEl?.textContent).toBe("We will never share your email.");
  });

  test("input updates value on change", () => {
    render(<TestForm />);
    const input = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");
  });

  test("form with validation shows error messages", async () => {
    function ValidatedForm() {
      const form = useForm({
        defaultValues: { name: "" },
      });

      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type="submit">Submit</button>
          </form>
        </Form>
      );
    }
    render(<ValidatedForm />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    // Wait for validation error
    const errorMsg = await screen.findByText("Name is required");
    expect(errorMsg).toBeTruthy();
  });
});
