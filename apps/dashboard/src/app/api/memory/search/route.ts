import { NextResponse } from "next/server";

const MEMORY_URL = `http://localhost:${process.env.LUNARIA_MEMORY_PORT ?? 37777}`;

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q") ?? "";
		const limit = searchParams.get("limit") ?? "20";

		const res = await fetch(
			`${MEMORY_URL}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
		);
		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: `Memory search failed: ${message}` },
			{ status: 500 },
		);
	}
}
