import { NextResponse } from "next/server";

const MEMORY_URL = `http://localhost:${process.env.AMOENA_MEMORY_PORT ?? 37777}`;

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const ids = searchParams.get("ids");

		if (!ids) {
			return NextResponse.json(
				{ error: "ids parameter required (comma-separated)" },
				{ status: 400 },
			);
		}

		const res = await fetch(
			`${MEMORY_URL}/api/observations?ids=${encodeURIComponent(ids)}`,
		);
		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: `Memory observations failed: ${message}` },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const res = await fetch(`${MEMORY_URL}/api/observations`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: `Create observation failed: ${message}` },
			{ status: 500 },
		);
	}
}
