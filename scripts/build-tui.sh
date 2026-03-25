#!/usr/bin/env bash
#
# Build the Amoena CLI (TUI) for distribution.
#
# Steps:
#   1. Compile TypeScript to dist/ via tsup
#   2. Generate bin/amoena.js wrapper with shebang
#   3. Make the wrapper executable
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TUI_DIR="$ROOT_DIR/apps/tui"

echo "==> Building Amoena CLI..."

# Compile TypeScript
cd "$TUI_DIR"
bunx tsup src/index.ts --format esm --dts --out-dir dist --clean

# Create bin wrapper with shebang
mkdir -p bin
cat > bin/amoena.js << 'WRAPPER'
#!/usr/bin/env node
import "../dist/index.js";
WRAPPER

# Make executable
chmod +x bin/amoena.js

echo "==> CLI build complete: apps/tui/bin/amoena.js"
