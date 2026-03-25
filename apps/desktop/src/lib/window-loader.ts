import type { BrowserWindow } from "electron";

/** Window IDs defined in the router configuration */
type WindowId = "main" | "about";

/**
 * The default port for the embedded Next.js dashboard server.
 * In development, the Next.js dev server runs on this port.
 * In production, the bundled Next.js standalone server runs on this port.
 */
const DASHBOARD_PORT = Number(process.env.AMOENA_DASHBOARD_PORT ?? 3456);

/**
 * Load an Electron window with the Next.js dashboard URL.
 *
 * Both development and production load from http://localhost:DASHBOARD_PORT
 * because the Next.js server runs as a child process in both modes.
 */
export function registerRoute(props: {
	id: WindowId;
	browserWindow: BrowserWindow;
	htmlFile: string;
	query?: Record<string, string>;
}): void {
	const url = `http://localhost:${DASHBOARD_PORT}`;
	console.log("[window-loader] Loading Next.js dashboard at:", url);
	props.browserWindow.loadURL(url);

	// Log successful loads
	props.browserWindow.webContents.on("did-finish-load", () => {
		console.log(
			"[window-loader] Successfully loaded:",
			props.browserWindow.webContents.getURL(),
		);
	});

	// Log and handle load failures — retry with backoff since Next.js may still be starting
	let retryCount = 0;
	const maxRetries = 10;
	const retryDelay = 1000; // ms

	props.browserWindow.webContents.on(
		"did-fail-load",
		(_event, errorCode, errorDescription, validatedURL) => {
			console.error("[window-loader] Failed to load URL:", validatedURL);
			console.error("[window-loader] Error:", errorCode, errorDescription);

			if (retryCount < maxRetries) {
				retryCount++;
				console.log(`[window-loader] Retrying (${retryCount}/${maxRetries}) in ${retryDelay}ms...`);
				setTimeout(() => {
					if (!props.browserWindow.isDestroyed()) {
						props.browserWindow.loadURL(url);
					}
				}, retryDelay);
			} else {
				console.error("[window-loader] Max retries reached. Next.js dashboard may not be running.");
			}
		},
	);
}
