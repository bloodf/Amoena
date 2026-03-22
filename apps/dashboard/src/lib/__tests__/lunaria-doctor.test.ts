import { describe, expect, it } from "vitest";
import { parseLunariaDoctorOutput } from "@/lib/lunaria-doctor";

describe("parseLunariaDoctorOutput", () => {
	it("marks warning output as fixable and extracts bullet issues", () => {
		const result = parseLunariaDoctorOutput(
			`
Config warnings
- tools.exec.safeBins includes interpreter/runtime 'bun' without profile
- tools.exec.safeBins includes interpreter/runtime 'python3' without profile
Run: lunaria doctor --fix
`,
			0,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.category).toBe("general");
		expect(result.canFix).toBe(true);
		expect(result.issues).toEqual([
			"tools.exec.safeBins includes interpreter/runtime 'bun' without profile",
			"tools.exec.safeBins includes interpreter/runtime 'python3' without profile",
		]);
	});

	it("marks invalid config output as an error", () => {
		const result = parseLunariaDoctorOutput(
			`
Invalid config at /home/lunaria/.lunaria/lunaria.json:
- <root>: Unrecognized key: "test"
Config invalid
File: $LUNARIA_HOME/lunaria.json
Problem:
- <root>: Unrecognized key: "test"
Run: lunaria doctor --fix
`,
			1,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("error");
		expect(result.category).toBe("config");
		expect(result.summary).toContain("Unrecognized key");
	});

	it("classifies state integrity warnings separately from config drift", () => {
		const result = parseLunariaDoctorOutput(
			`
◇  State integrity
- Multiple state directories detected. This can split session history.
- Found 1 orphan transcript file(s) in ~/.lunaria/agents/jarv/sessions.
Run "lunaria doctor --fix" to apply changes.
`,
			0,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.category).toBe("state");
		expect(result.summary).toContain("Multiple state directories");
	});

	it("suppresses foreign state-directory warnings for the active instance", () => {
		const result = parseLunariaDoctorOutput(
			`
◇  State integrity
- Multiple state directories detected. This can split session history.
  - /home/nefes/.lunaria
  Active state dir: ~/.lunaria
- Found 1 orphan transcript file(s) in ~/.lunaria/agents/jarv/sessions.
Run "lunaria doctor --fix" to apply changes.
`,
			0,
			{ stateDir: "/home/lunaria/.lunaria" },
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.category).toBe("state");
		expect(result.issues).toEqual([
			"Found 1 orphan transcript file(s) in ~/.lunaria/agents/jarv/sessions.",
		]);
		expect(result.raw).not.toContain("/home/nefes/.lunaria");
	});

	it("suppresses foreign state-directory warnings when the active dir is shown via LUNARIA_HOME alias", () => {
		const result = parseLunariaDoctorOutput(
			`
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
┌  Lunaria doctor
│
◇  State integrity
- Multiple state directories detected. This can split session history.
  - $LUNARIA_HOME/.lunaria
  - /home/nefes/.lunaria
  Active state dir: $LUNARIA_HOME
- Found 11 orphan transcript file(s) in $LUNARIA_HOME/agents/jarv/sessions.
Run "lunaria doctor --fix" to apply changes.
`,
			0,
			{ stateDir: "/home/lunaria/.lunaria" },
		);

		expect(result.summary).toContain("Found 11 orphan transcript file(s)");
		expect(result.raw).not.toContain("/home/nefes/.lunaria");
		expect(result.raw).not.toContain("Multiple state directories detected");
	});

	it("parses state integrity blocks when lines are prefixed by box-drawing gutters", () => {
		const result = parseLunariaDoctorOutput(
			`
┌  Lunaria doctor
│
◇  State integrity
│  - Multiple state directories detected. This can split session history.
│    - $LUNARIA_HOME/.lunaria
│    - /home/nefes/.lunaria
│    Active state dir: $LUNARIA_HOME
│  - Found 11 orphan transcript file(s) in $LUNARIA_HOME/agents/jarv/sessions.
Run "lunaria doctor --fix" to apply changes.
`,
			0,
			{ stateDir: "/home/lunaria/.lunaria" },
		);

		expect(result.level).toBe("warning");
		expect(result.category).toBe("state");
		expect(result.issues).toEqual([
			"Found 11 orphan transcript file(s) in $LUNARIA_HOME/agents/jarv/sessions.",
		]);
		expect(result.raw).not.toContain("/home/nefes/.lunaria");
		expect(result.raw).not.toContain("Multiple state directories detected");
	});

	it("marks clean output as healthy", () => {
		const result = parseLunariaDoctorOutput("OK: configuration valid", 0);

		expect(result.healthy).toBe(true);
		expect(result.level).toBe("healthy");
		expect(result.category).toBe("general");
		expect(result.canFix).toBe(false);
	});

	it("treats positive security lines as healthy, not warnings (#331)", () => {
		const result = parseLunariaDoctorOutput(
			`
? Security
- No channel security warnings detected.
- Run: lunaria security audit --deep
`,
			0,
		);

		expect(result.healthy).toBe(true);
		expect(result.level).toBe("healthy");
		expect(result.issues).toEqual([]);
	});

	it("still detects real security warnings alongside positive lines", () => {
		const result = parseLunariaDoctorOutput(
			`
? Security
- Channel "public" has no auth configured.
- No channel security warnings detected.
- Run: lunaria security audit --deep
`,
			0,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.issues).toEqual(['Channel "public" has no auth configured.']);
	});
});
