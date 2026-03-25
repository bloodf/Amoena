/**
 * Amoena Smoke Test — verifies all critical API endpoints respond correctly.
 * Run: bun run scripts/smoke-test.ts
 *
 * Expects the dashboard to be running on AMOENA_DASHBOARD_PORT (default 3456).
 */

const DASHBOARD_PORT = process.env.AMOENA_DASHBOARD_PORT ?? "3456";
const BASE_URL = `http://localhost:${DASHBOARD_PORT}`;

interface TestResult {
	name: string;
	passed: boolean;
	status?: number;
	error?: string;
	duration: number;
}

async function testEndpoint(
	name: string,
	path: string,
	options?: { method?: string; body?: unknown; expectStatus?: number },
): Promise<TestResult> {
	const start = Date.now();
	try {
		const res = await fetch(`${BASE_URL}${path}`, {
			method: options?.method ?? "GET",
			headers: options?.body ? { "Content-Type": "application/json" } : undefined,
			body: options?.body ? JSON.stringify(options.body) : undefined,
		});
		const duration = Date.now() - start;
		const expectedStatus = options?.expectStatus ?? 200;
		const passed = res.status === expectedStatus;
		return { name, passed, status: res.status, duration };
	} catch (error) {
		const duration = Date.now() - start;
		const message = error instanceof Error ? error.message : "Unknown error";
		return { name, passed: false, error: message, duration };
	}
}

async function runSmokeTests(): Promise<void> {
	console.log(`\n  Amoena Smoke Test`);
	console.log(`  Dashboard: ${BASE_URL}\n`);

	const results: TestResult[] = [];

	// Core endpoints
	results.push(await testEndpoint("Dashboard root", "/"));
	results.push(await testEndpoint("API health", "/api/status"));
	results.push(await testEndpoint("Agents list", "/api/agents"));
	results.push(await testEndpoint("Tasks list", "/api/tasks"));
	results.push(await testEndpoint("Recipes list", "/api/recipes"));
	results.push(await testEndpoint("Settings", "/api/settings"));
	results.push(await testEndpoint("Activities", "/api/activities"));
	results.push(await testEndpoint("Sessions", "/api/sessions"));

	// Memory endpoints (503/500 expected when memory service not running)
	results.push(await testEndpoint("Memory health", "/api/memory/health", { expectStatus: 503 }));
	results.push(await testEndpoint("Memory search", "/api/memory/search?q=test&limit=5", { expectStatus: 500 }));

	// Amoena-specific endpoints
	results.push(await testEndpoint("Cost advisor", "/api/cost-advisor", {
		method: "POST",
		body: {
			currentModel: "claude-opus-4-6",
			taskDescription: "rename a variable",
		},
	}));
	results.push(await testEndpoint("Upstream sync", "/api/upstream-sync"));
	results.push(await testEndpoint("Remote devices", "/api/remote"));

	// Security
	results.push(await testEndpoint("Security audit", "/api/security-audit"));
	results.push(await testEndpoint("Token stats", "/api/tokens?action=stats"));

	// Print results
	const passed = results.filter((r) => r.passed).length;
	const failed = results.filter((r) => !r.passed).length;

	for (const r of results) {
		const icon = r.passed ? "  ✓" : "  ✗";
		const status = r.status ? `${r.status}` : "ERR";
		const time = `${r.duration}ms`;
		console.log(`${icon} ${r.name} [${status}] (${time})`);
		if (r.error) console.log(`    Error: ${r.error}`);
	}

	console.log(`\n  ${passed} passed, ${failed} failed out of ${results.length}`);

	if (failed > 0) {
		console.log("\n  Some endpoints failed. This may be expected if services aren't running.");
		process.exit(1);
	} else {
		console.log("\n  All smoke tests passed!");
	}
}

runSmokeTests();
