/**
 * Lunaria CLI entry point.
 *
 * Handles --version and --help flags, then delegates to the TUI renderer.
 */

const VERSION = '0.1.0';

function printVersion(): void {
  console.log(`lunaria ${VERSION}`);
}

function printHelp(): void {
  console.log(`lunaria ${VERSION}

Usage: lunaria [options] [command]

Options:
  --version, -v    Show version number
  --help, -h       Show this help message

Commands:
  start            Start the Lunaria TUI (default)
  agents           List available agents
  run <task>       Run a task with the orchestrator
`);
}

export function main(argv: readonly string[] = process.argv.slice(2)): void {
  const args = [...argv];

  if (args.includes('--version') || args.includes('-v')) {
    printVersion();
    return;
  }

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // Default: print version for now (TUI rendering will be added in a future phase)
  printVersion();
}

main();
