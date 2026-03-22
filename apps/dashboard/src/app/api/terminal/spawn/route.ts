import { NextResponse } from "next/server";

const TERMINAL_HOST_URL = `http://localhost:${process.env.LUNARIA_TERMINAL_HOST_PORT ?? 4879}`;

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { command, cwd, env: extraEnv } = body;

		if (!command) {
			return NextResponse.json(
				{ error: "command is required" },
				{ status: 400 },
			);
		}

		const response = await fetch(`${TERMINAL_HOST_URL}/trpc/terminal.create`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				json: {
					command,
					cwd: cwd ?? process.cwd(),
					env: extraEnv ?? {},
				},
			}),
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
			{ error: `Failed to spawn terminal: ${message}` },
			{ status: 500 },
		);
	}
}
