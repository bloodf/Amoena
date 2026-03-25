#!/usr/bin/env bash
#
# Post-build smoke tests for Lunaria artifacts.
#
# Verifies:
#   1. Tauri desktop binary exists (dev build)
#   2. CLI binary runs and outputs a version string
#
# Exit code: non-zero on any failure.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FAILURES=0

pass() { echo "  [PASS] $1"; }
fail() { echo "  [FAIL] $1"; FAILURES=$((FAILURES + 1)); }

echo "==> Running Lunaria smoke tests..."

# ─── 1. Tauri desktop binary ────────────────────────────────────────────────────

echo ""
echo "--- Desktop (Tauri) ---"

TAURI_TARGET_DIR="$ROOT_DIR/apps/desktop/src-tauri/target"

# Check for debug or release binary (platform-dependent name)
BINARY_NAME="lunaria-desktop"
if [ "$(uname)" = "Darwin" ]; then
  DESKTOP_BIN=$(find "$TAURI_TARGET_DIR" -name "$BINARY_NAME" -type f 2>/dev/null | head -1)
elif [ "$(uname)" = "Linux" ]; then
  DESKTOP_BIN=$(find "$TAURI_TARGET_DIR" -name "$BINARY_NAME" -type f 2>/dev/null | head -1)
else
  # Windows: look for .exe
  DESKTOP_BIN=$(find "$TAURI_TARGET_DIR" -name "$BINARY_NAME.exe" -type f 2>/dev/null | head -1)
fi

if [ -n "${DESKTOP_BIN:-}" ] && [ -f "$DESKTOP_BIN" ]; then
  pass "Desktop binary found: $DESKTOP_BIN"
else
  # In CI the binary may not exist if only a web build was done. Warn, don't fail.
  echo "  [WARN] Desktop binary not found in $TAURI_TARGET_DIR (skipped — requires 'tauri build')"
fi

# ─── 2. CLI binary ──────────────────────────────────────────────────────────────

echo ""
echo "--- CLI (TUI) ---"

CLI_BIN="$ROOT_DIR/apps/tui/bin/lunaria.js"

if [ ! -f "$CLI_BIN" ]; then
  fail "CLI binary not found at $CLI_BIN"
else
  pass "CLI binary exists: $CLI_BIN"

  # Verify it's executable
  if [ -x "$CLI_BIN" ]; then
    pass "CLI binary is executable"
  else
    fail "CLI binary is not executable"
  fi

  # Verify --version outputs something reasonable
  CLI_VERSION_OUTPUT=$(node "$CLI_BIN" --version 2>&1) || true
  if echo "$CLI_VERSION_OUTPUT" | grep -q "lunaria"; then
    pass "CLI --version output: $CLI_VERSION_OUTPUT"
  else
    fail "CLI --version did not contain 'lunaria': $CLI_VERSION_OUTPUT"
  fi
fi

# ─── 3. Web build artifacts ─────────────────────────────────────────────────────

echo ""
echo "--- Web build ---"

WEB_DIST="$ROOT_DIR/apps/desktop/dist"
if [ -d "$WEB_DIST" ] && [ "$(ls -A "$WEB_DIST" 2>/dev/null)" ]; then
  pass "Web dist directory exists and is non-empty"
else
  echo "  [WARN] Web dist not found at $WEB_DIST (skipped — requires 'vite build')"
fi

# ─── Summary ────────────────────────────────────────────────────────────────────

echo ""
if [ "$FAILURES" -gt 0 ]; then
  echo "==> Smoke tests FAILED ($FAILURES failure(s))"
  exit 1
else
  echo "==> All smoke tests passed."
  exit 0
fi
