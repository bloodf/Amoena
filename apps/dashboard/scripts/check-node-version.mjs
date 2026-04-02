const requiredMajor = 22;
const currentMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);

if (!Number.isFinite(currentMajor) || currentMajor < requiredMajor) {
  console.error(
    `Node.js ${requiredMajor}+ is required for @lunaria/dashboard. Current version: ${process.version}`,
  );
  process.exit(1);
}
