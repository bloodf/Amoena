import { NextResponse } from "next/server";

const MEMORY_URL = `http://localhost:${process.env.AMOENA_MEMORY_PORT ?? 37777}`;

export async function GET() {
	try {
		const res = await fetch(`${MEMORY_URL}/health`);
		const data = await res.json();
		return NextResponse.json({ status: "ok", memory: data });
	} catch {
		return NextResponse.json(
			{ status: "unavailable", memory: null },
			{ status: 503 },
		);
	}
}
