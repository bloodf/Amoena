/**
 * Viewer Routes
 *
 * Handles health check, viewer UI, and SSE stream endpoints.
 * These are used by the web viewer UI at http://localhost:37777
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import express, { type Request, type Response } from "express";
import { getPackageRoot } from "../../../../shared/paths.js";
import type { DatabaseManager } from "../../DatabaseManager.js";
import type { SessionManager } from "../../SessionManager.js";
import type { SSEBroadcaster } from "../../SSEBroadcaster.js";
import { BaseRouteHandler } from "../BaseRouteHandler.js";

export class ViewerRoutes extends BaseRouteHandler {
	constructor(
		private sseBroadcaster: SSEBroadcaster,
		private dbManager: DatabaseManager,
		private sessionManager: SessionManager,
	) {
		super();
	}

	setupRoutes(app: express.Application): void {
		// Serve static UI assets (JS, CSS, fonts, etc.)
		const packageRoot = getPackageRoot();
		app.use(express.static(path.join(packageRoot, "ui")));

		app.get("/health", this.handleHealth.bind(this));
		app.get("/", this.handleViewerUI.bind(this));
		app.get("/stream", this.handleSSEStream.bind(this));
	}

	/**
	 * Health check endpoint
	 */
	private handleHealth = this.wrapHandler(
		(_req: Request, res: Response): void => {
			res.json({ status: "ok", timestamp: Date.now() });
		},
	);

	/**
	 * Serve viewer UI
	 */
	private handleViewerUI = this.wrapHandler(
		(_req: Request, res: Response): void => {
			const packageRoot = getPackageRoot();

			// Try cache structure first (ui/viewer.html), then marketplace structure (plugin/ui/viewer.html)
			const viewerPaths = [
				path.join(packageRoot, "ui", "viewer.html"),
				path.join(packageRoot, "plugin", "ui", "viewer.html"),
			];

			const viewerPath = viewerPaths.find((p) => existsSync(p));

			if (!viewerPath) {
				throw new Error("Viewer UI not found at any expected location");
			}

			const html = readFileSync(viewerPath, "utf-8");
			res.setHeader("Content-Type", "text/html");
			res.send(html);
		},
	);

	/**
	 * SSE stream endpoint
	 */
	private handleSSEStream = this.wrapHandler(
		(_req: Request, res: Response): void => {
			// Setup SSE headers
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");

			// Add client to broadcaster
			this.sseBroadcaster.addClient(res);

			// Send initial_load event with projects list
			const allProjects = this.dbManager.getSessionStore().getAllProjects();
			this.sseBroadcaster.broadcast({
				type: "initial_load",
				projects: allProjects,
				timestamp: Date.now(),
			});

			// Send initial processing status (based on queue depth + active generators)
			const isProcessing = this.sessionManager.isAnySessionProcessing();
			const queueDepth = this.sessionManager.getTotalActiveWork(); // Includes queued + actively processing
			this.sseBroadcaster.broadcast({
				type: "processing_status",
				isProcessing,
				queueDepth,
			});
		},
	);
}
