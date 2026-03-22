import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

let cachedSpec: string | null = null;

export async function GET() {
	if (!cachedSpec) {
		const specPath = join(process.cwd(), "openapi.json");
		cachedSpec = readFileSync(specPath, "utf-8");
	}

	return new NextResponse(cachedSpec, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
