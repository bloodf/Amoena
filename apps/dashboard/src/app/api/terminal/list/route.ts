import { NextResponse } from "next/server";

const TERMINAL_HOST_URL = `http://localhost:${process.env.LUNARIA_TERMINAL_HOST_PORT ?? 4879}`;

export async function GET() {
	try {
		const response = await fetch(`${TERMINAL_HOST_URL}/trpc/terminal.list`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			const text = await response.text();
			return NextResponse.json(
				{ error: `Terminal host error: ${text}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: `Failed to list terminals: ${message}` },
			{ status: 500 },
		);
	}
}
