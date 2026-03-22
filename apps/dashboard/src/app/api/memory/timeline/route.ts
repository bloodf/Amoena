import { NextResponse } from "next/server";

const MEMORY_URL = `http://localhost:${process.env.LUNARIA_MEMORY_PORT ?? 37777}`;

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const observationId = searchParams.get("id");
		const range = searchParams.get("range") ?? "5";

		const params = new URLSearchParams({ range });
		if (observationId) params.set("id", observationId);

		const res = await fetch(`${MEMORY_URL}/api/timeline?${params}`);
		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: `Memory timeline failed: ${message}` },
			{ status: 500 },
		);
	}
}
