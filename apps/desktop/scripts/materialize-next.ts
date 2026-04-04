#!/usr/bin/env bun

import fs from 'node:fs';
import path from 'node:path';

// This script fixes broken symlinks in Next.js standalone output.
// Next.js output:'standalone' creates symlinks that point outside the standalone tree.
// When electron-builder packages the app, these symlinks break.
//
// This script dereferences the 'next' symlink by copying the actual package.

const workspaceRoot = path.resolve(import.meta.dir, '../..');
const dashboardDir = path.join(workspaceRoot, 'apps/dashboard');
const standaloneNextDir = path.join(
  dashboardDir,
  '.next/standalone/apps/dashboard/node_modules/next',
);

function log(msg: string) {
  console.log(`[materialize-next] ${msg}`);
}

function run() {
  // Check if standalone has been built
  if (!fs.existsSync(standaloneNextDir)) {
    log('Standalone not found. Run `bun run --cwd apps/dashboard build` first. Skipping.');
    return;
  }

  // Check if it's actually a symlink
  const stats = fs.lstatSync(standaloneNextDir);
  if (!stats.isSymbolicLink()) {
    log('Next package is not a symlink, no need to materialize. Skipping.');
    return;
  }

  // Read the symlink target
  const symlinkTarget = fs.readlinkSync(standaloneNextDir);
  log(`Found broken symlink pointing to: ${symlinkTarget}`);

  // Resolve the actual next package path
  // The symlink is relative to the symlink's directory
  const actualNextDir = path.resolve(path.dirname(standaloneNextDir), symlinkTarget);

  // Verify the target exists
  if (!fs.existsSync(actualNextDir)) {
    log(`ERROR: Symlink target does not exist: ${actualNextDir}`);
    process.exit(1);
  }

  log(`Copying actual next package from: ${actualNextDir}`);
  log(`To: ${standaloneNextDir}`);

  try {
    // Remove the symlink and copy the actual directory
    fs.unlinkSync(standaloneNextDir);
    fs.cpSync(actualNextDir, standaloneNextDir, {
      dereference: true,
      force: true,
    });
    log('Successfully materialized next package');
  } catch (err) {
    log(`ERROR: Failed to materialize next package: ${err}`);
    process.exit(1);
  }
}

run();
