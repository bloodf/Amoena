# The .luna Binary Format

A `.luna` file is a self-contained binary bundle that packages an extension manifest with all its assets (HTML panels, JavaScript, icons, etc.) into a single file. This page documents the exact byte layout and how to create or inspect `.luna` files programmatically.

## Format Version

Current format version: **1**

The format is intentionally simple — a flat binary with a fixed header followed by a length-prefixed manifest and an array of length-prefixed assets. All multi-byte integers are **little-endian**.

## Byte Layout

```
Offset  Size   Type      Description
──────  ────   ────      ───────────
0       4      bytes     Magic: "LUNA" (0x4C 0x55 0x4E 0x41)
4       4      u32 LE    Format version (currently 1)
8       4      u32 LE    Manifest length in bytes (M)
12      M      bytes     Manifest JSON (UTF-8)
12+M    4      u32 LE    Asset count (N)

  For each of N assets:
  ┌────────────────────────────────────────────┐
  │ 4      u32 LE    Asset name length (L)     │
  │ L      bytes     Asset name (UTF-8)         │
  │ 4      u32 LE    Asset data length (D)     │
  │ D      bytes     Asset data (raw bytes)    │
  └────────────────────────────────────────────┘
```

## Field Descriptions

### Magic (bytes 0–3)

Always the ASCII string `LUNA`. Lunaria validates these 4 bytes first. A file with any other prefix is rejected with:

```
invalid .luna file: bad magic bytes
```

### Format Version (bytes 4–7)

A `u32` in little-endian encoding. Currently must be exactly `1`. A file with any other version is rejected with:

```
unsupported .luna format version: <N>
```

This allows future format revisions while maintaining backward compatibility checks.

### Manifest Length (bytes 8–11)

A `u32` in little-endian encoding specifying the number of bytes in the manifest JSON that follows.

### Manifest JSON (bytes 12 to 12+M)

UTF-8 encoded JSON matching the [`ExtensionManifest`](./manifest.md) schema. Parsed by `serde_json` — invalid JSON causes a load failure logged as a warning, and the extension is skipped.

### Asset Count (bytes 12+M to 12+M+4)

A `u32` in little-endian encoding specifying how many assets follow. May be `0` for extensions with no embedded assets.

### Assets (variable)

Each asset is stored as:

1. **Name length** (`u32 LE`) — byte length of the name string
2. **Name** (`UTF-8 bytes`) — the asset's path within the bundle, e.g. `"panel.html"`, `"assets/icon.png"`
3. **Data length** (`u32 LE`) — byte length of the asset data
4. **Data** (raw bytes) — the asset content

Asset names are arbitrary UTF-8 strings. By convention they use forward slashes for subdirectories. The manifest references assets by these names (e.g. `"entry": "panel.html"`, `"icon": "icon.png"`).

## Creating .luna Files

### Using lunaria-pack (recommended)

```bash
# Install once
bun install -g @lunaria/pack

# Package a project directory
lunaria-pack manifest.json \
  --asset panel.html \
  --asset main.js \
  --asset icon.png \
  --out my-extension.luna
```

### Programmatically (TypeScript / Bun)

```ts
import { writeFileSync } from 'fs';

function writeLunaBundle(
  manifest: object,
  assets: Map<string, Uint8Array>,
  outPath: string,
): void {
  const enc = new TextEncoder();
  const manifestJson = enc.encode(JSON.stringify(manifest));

  const chunks: Uint8Array[] = [];

  const u32le = (n: number): Uint8Array => {
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, n, true /* little-endian */);
    return buf;
  };

  // Magic + version
  chunks.push(enc.encode('LUNA'));
  chunks.push(u32le(1));

  // Manifest
  chunks.push(u32le(manifestJson.length));
  chunks.push(manifestJson);

  // Assets
  chunks.push(u32le(assets.size));
  for (const [name, data] of assets) {
    const nameBytes = enc.encode(name);
    chunks.push(u32le(nameBytes.length));
    chunks.push(nameBytes);
    chunks.push(u32le(data.length));
    chunks.push(data);
  }

  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }

  writeFileSync(outPath, out);
}
```

### Programmatically (Python)

```python
import json
import struct

def write_luna_bundle(manifest: dict, assets: dict[str, bytes], out_path: str) -> None:
    """Write a .luna bundle file."""
    manifest_json = json.dumps(manifest, separators=(',', ':')).encode('utf-8')

    with open(out_path, 'wb') as f:
        # Magic + version
        f.write(b'LUNA')
        f.write(struct.pack('<I', 1))  # format version 1, little-endian

        # Manifest
        f.write(struct.pack('<I', len(manifest_json)))
        f.write(manifest_json)

        # Assets
        f.write(struct.pack('<I', len(assets)))
        for name, data in assets.items():
            name_bytes = name.encode('utf-8')
            f.write(struct.pack('<I', len(name_bytes)))
            f.write(name_bytes)
            f.write(struct.pack('<I', len(data)))
            f.write(data)
```

## Inspecting .luna Files

### Using lunaria-pack

```bash
lunaria-pack inspect my-extension.luna
```

Output:
```
.luna bundle: my-extension.luna
  ID:          com.example.my-extension
  Name:        My Extension
  Version:     1.0.0
  Format:      v1
  Manifest:    842 bytes
  Assets (3):
    panel.html   4,218 bytes
    main.js      1,102 bytes
    icon.png     2,831 bytes
```

### Using Python (quick inspection)

```python
import json
import struct

def inspect_luna(path: str) -> None:
    with open(path, 'rb') as f:
        magic = f.read(4)
        assert magic == b'LUNA', f"Invalid magic: {magic!r}"

        version = struct.unpack('<I', f.read(4))[0]
        print(f"Format version: {version}")

        manifest_len = struct.unpack('<I', f.read(4))[0]
        manifest = json.loads(f.read(manifest_len))
        print(f"Extension: {manifest['id']} v{manifest['version']}")

        asset_count = struct.unpack('<I', f.read(4))[0]
        print(f"Assets ({asset_count}):")
        for _ in range(asset_count):
            name_len = struct.unpack('<I', f.read(4))[0]
            name = f.read(name_len).decode('utf-8')
            data_len = struct.unpack('<I', f.read(4))[0]
            f.read(data_len)  # skip data
            print(f"  {name}  ({data_len:,} bytes)")

inspect_luna('my-extension.luna')
```

## Extracting Assets

```python
def extract_luna(path: str, out_dir: str) -> None:
    import os
    os.makedirs(out_dir, exist_ok=True)

    with open(path, 'rb') as f:
        f.read(8)  # skip magic + version
        manifest_len = struct.unpack('<I', f.read(4))[0]
        manifest_bytes = f.read(manifest_len)
        with open(os.path.join(out_dir, 'manifest.json'), 'wb') as mf:
            mf.write(manifest_bytes)

        asset_count = struct.unpack('<I', f.read(4))[0]
        for _ in range(asset_count):
            name_len = struct.unpack('<I', f.read(4))[0]
            name = f.read(name_len).decode('utf-8')
            data_len = struct.unpack('<I', f.read(4))[0]
            data = f.read(data_len)
            asset_path = os.path.join(out_dir, name)
            os.makedirs(os.path.dirname(asset_path), exist_ok=True)
            with open(asset_path, 'wb') as af:
                af.write(data)
```

## Size Limits

There are no hard size limits enforced by the parser, but practical constraints apply:

- Manifest JSON: keep under 64 KB (large manifests indicate a design issue)
- Individual assets: the `u32` length field caps each at ~4 GB, but panels should be lightweight
- Total bundle size: no enforced limit; Lunaria reads the entire file into memory on load

## Validation on Load

When Lunaria loads a `.luna` file it performs these checks in order:

1. File exists and is readable
2. First 4 bytes are `LUNA`
3. Format version is `1`
4. Manifest length is within the remaining file size
5. Manifest bytes parse as valid JSON matching `ExtensionManifest`

If any check fails, the file is skipped with a `WARN` log entry. The application continues loading other extensions.
