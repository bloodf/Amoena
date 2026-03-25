import { describe, expect, it, vi } from "vitest";

describe("client-logger", () => {
	it("createClientLogger returns logger with all methods", async () => {
		const { createClientLogger } = await import("@/lib/client-logger");
		const logger = createClientLogger("TestModule");
		expect(typeof logger.debug).toBe("function");
		expect(typeof logger.info).toBe("function");
		expect(typeof logger.warn).toBe("function");
		expect(typeof logger.error).toBe("function");
	});

	it("warn and error log in any environment", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { createClientLogger } = await import("@/lib/client-logger");
		const logger = createClientLogger("Test");
		logger.warn("warning message");
		logger.error("error message");

		expect(warnSpy).toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalled();

		warnSpy.mockRestore();
		errorSpy.mockRestore();
	});

	it("formats messages with module prefix", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { createClientLogger } = await import("@/lib/client-logger");
		const logger = createClientLogger("MyModule");
		logger.warn("test");

		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining("MyModule"),
			"test",
		);

		warnSpy.mockRestore();
	});

	it("accepts object as first argument", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { createClientLogger } = await import("@/lib/client-logger");
		const logger = createClientLogger("Mod");
		logger.warn({ key: "value" }, "msg");

		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
