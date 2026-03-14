# Installation

## Prerequisites

Before building Lunaria from source, ensure you have the following installed:

### Required

| Tool | Version | Install |
|------|---------|---------|
| **Rust** | 1.75+ | [rustup.rs](https://rustup.rs) |
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **Bun** | 1.1+ | [bun.sh](https://bun.sh) |
| **Tauri CLI** | 2.x | `cargo install tauri-cli` |

### Platform-Specific Dependencies

Tauri requires platform-level libraries for WebView and system tray support. Follow the official prerequisites guide for your OS:

- **Linux**: [Tauri Linux prerequisites](https://v2.tauri.app/start/prerequisites/#linux)
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: Microsoft C++ Build Tools + WebView2

## Clone and Install

```bash
# Clone the repository
git clone https://github.com/LunariaAi/lunaria.git
cd lunaria

# Install all JavaScript/TypeScript dependencies
bun install

# Build the shared UI package (required before running the app)
cd packages/ui && bun run build && cd ../..
```

## Running in Development

```bash
# Start the desktop app in development mode (hot reload)
cd apps/desktop
cargo tauri dev
```

This will:
1. Compile the Rust backend
2. Start the Bun AI worker daemon
3. Launch the Tauri webview with Vite hot reload

The first compile takes 2–5 minutes. Subsequent rebuilds are incremental.

## Building from Source

```bash
# Produce a signed, optimized release bundle
cargo tauri build
```

Release artifacts are placed in `apps/desktop/src-tauri/target/release/bundle/`.

| Platform | Output |
|----------|--------|
| macOS | `.app` + `.dmg` |
| Linux | `.AppImage` + `.deb` |
| Windows | `.msi` + `.exe` |

## Verifying the Build

After installation, launch Lunaria. The Setup Wizard will guide you through:

1. Selecting your default AI provider
2. Entering your API key (stored securely in the system keyring)
3. Configuring your default model
4. Optional: enabling remote access

See [Configuration](/getting-started/configuration) for detailed settings documentation.

## Troubleshooting

### Rust compile errors

Ensure you are on Rust 1.75+:

```bash
rustup update stable
rustc --version
```

### `cargo tauri` not found

```bash
cargo install tauri-cli
# Ensure ~/.cargo/bin is in your PATH
```

### Bun worker fails to start

The Bun AI worker is started automatically by Tauri. If it fails:

```bash
# Test the worker directly
cd apps/desktop/worker
bun run index.ts
```

Check `~/.lunaria/logs/` for worker error output.

### WebView not rendering (Linux)

Install WebKitGTK:

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev

# Arch
sudo pacman -S webkit2gtk-4.1
```
