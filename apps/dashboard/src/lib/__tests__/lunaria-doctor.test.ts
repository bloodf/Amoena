import { describe, expect, it } from "vitest";
import { parseAmoenaDoctorOutput } from "@/lib/amoena-doctor";

describe("parseAmoenaDoctorOutput", () => {
	it("marks warning output as fixable and extracts bullet issues", () => {
		const result = parseAmoenaDoctorOutput(
			`
Config warnings
- tools.exec.safeBins includes interpreter/runtime 'bun' without profile
- tools.exec.safeBins includes interpreter/runtime 'python3' without profile
Run: amoena doctor --fix
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
		const result = parseAmoenaDoctorOutput(
			`
Invalid config at /home/amoena/.amoena/amoena.json:
- <root>: Unrecognized key: "test"
Config invalid
File: $AMOENA_HOME/amoena.json
Problem:
- <root>: Unrecognized key: "test"
Run: amoena doctor --fix
`,
			1,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("error");
		expect(result.category).toBe("config");
		expect(result.summary).toContain("Unrecognized key");
	});

	it("classifies state integrity warnings separately from config drift", () => {
		const result = parseAmoenaDoctorOutput(
			`
◇  State integrity
- Multiple state directories detected. This can split session history.
- Found 1 orphan transcript file(s) in ~/.amoena/agents/jarv/sessions.
Run "amoena doctor --fix" to apply changes.
`,
			0,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.category).toBe("state");
		expect(result.summary).toContain("Multiple state directories");
	});

	it("suppresses foreign state-directory warnings for the active instance", () => {
		const result = parseAmoenaDoctorOutput(
			`
◇  State integrity
- Multiple state directories detected. This can split session history.
  - /home/nefes/.amoena
  Active state dir: ~/.amoena
- Found 1 orphan transcript file(s) in ~/.amoena/agents/jarv/sessions.
Run "amoena doctor --fix" to apply changes.
`,
			0,
			{ stateDir: "/home/amoena/.amoena" },
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.category).toBe("state");
		expect(result.issues).toEqual([
			"Found 1 orphan transcript file(s) in ~/.amoena/agents/jarv/sessions.",
		]);
		expect(result.raw).not.toContain("/home/nefes/.amoena");
	});

	it("suppresses foreign state-directory warnings when the active dir is shown via AMOENA_HOME alias", () => {
		const result = parseAmoenaDoctorOutput(
			`
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
┌  Amoena doctor
│
◇  State integrity
- Multiple state directories detected. This can split session history.
  - $AMOENA_HOME/.amoena
  - /home/nefes/.amoena
  Active state dir: $AMOENA_HOME
- Found 11 orphan transcript file(s) in $AMOENA_HOME/agents/jarv/sessions.
Run "amoena doctor --fix" to apply changes.
`,
			0,
			{ stateDir: "/home/amoena/.amoena" },
		);

		expect(result.summary).toContain("Found 11 orphan transcript file(s)");
		expect(result.raw).not.toContain("/home/nefes/.amoena");
		expect(result.raw).not.toContain("Multiple state directories detected");
	});

	it("parses state integrity blocks when lines are prefixed by box-drawing gutters", () => {
		const result = parseAmoenaDoctorOutput(
			`
┌  Amoena doctor
│
◇  State integrity
│  - Multiple state directories detected. This can split session history.
│    - $AMOENA_HOME/.amoena
│    - /home/nefes/.amoena
│    Active state dir: $AMOENA_HOME
│  - Found 11 orphan transcript file(s) in $AMOENA_HOME/agents/jarv/sessions.
Run "amoena doctor --fix" to apply changes.
`,
			0,
			{ stateDir: "/home/amoena/.amoena" },
		);

		expect(result.level).toBe("warning");
		expect(result.category).toBe("state");
		expect(result.issues).toEqual([
			"Found 11 orphan transcript file(s) in $AMOENA_HOME/agents/jarv/sessions.",
		]);
		expect(result.raw).not.toContain("/home/nefes/.amoena");
		expect(result.raw).not.toContain("Multiple state directories detected");
	});

	it("marks clean output as healthy", () => {
		const result = parseAmoenaDoctorOutput("OK: configuration valid", 0);

		expect(result.healthy).toBe(true);
		expect(result.level).toBe("healthy");
		expect(result.category).toBe("general");
		expect(result.canFix).toBe(false);
	});

	it("treats positive security lines as healthy, not warnings (#331)", () => {
		const result = parseAmoenaDoctorOutput(
			`
? Security
- No channel security warnings detected.
- Run: amoena security audit --deep
`,
			0,
		);

		expect(result.healthy).toBe(true);
		expect(result.level).toBe("healthy");
		expect(result.issues).toEqual([]);
	});

	it("still detects real security warnings alongside positive lines", () => {
		const result = parseAmoenaDoctorOutput(
			`
? Security
- Channel "public" has no auth configured.
- No channel security warnings detected.
- Run: amoena security audit --deep
`,
			0,
		);

		expect(result.healthy).toBe(false);
		expect(result.level).toBe("warning");
		expect(result.issues).toEqual(['Channel "public" has no auth configured.']);
	});
});
