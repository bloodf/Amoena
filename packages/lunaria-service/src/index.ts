export * from './orchestration/cli-adapters/index';
export * from './usage-telemetry/index';
export * from './remote-access/index';
export * from './session-replay/cleanup';

// Run cleanup once at startup (non-blocking)
runReplayCleanup({ verbose: false }).catch((err) => {
	process.stderr.write(`[session-replay] startup cleanup failed: ${err}\n`);
});
