const [kind, ...rest] = process.argv.slice(2);

if (rest.includes("--version") || kind === "--version") {
  const actualKind = kind === "--version" ? "wrapper" : kind;
  console.log(`${actualKind} 0.9.0`);
  process.exit(0);
}

console.error("unsupported invocation");
process.exit(1);
