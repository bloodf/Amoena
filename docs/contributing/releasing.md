# Releasing

## Overview

Amoena uses a tag-driven release process. Maintainers tag a release commit, and CI builds and publishes platform bundles automatically.

## Versioning

Amoena follows [Semantic Versioning](https://semver.org/):

- `MAJOR` — breaking changes to the API, extension manifest format, or database schema requiring migration
- `MINOR` — new features, new API endpoints, new extension contribution types
- `PATCH` — bug fixes, security patches, documentation corrections

The version is defined in:

- `package.json` (root)
- `apps/desktop/package.json`

Both files must be kept in sync.

## Commit Messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/). This drives the changelog:

```
feat(memory): add L2 abstraction summarisation
fix(hooks): prevent duplicate hook registration on reload
docs(api): add SSE event payload documentation
chore(deps): upgrade vitepress to 1.6.0
```

A breaking change is indicated by `!` after the type:

```
feat(extensions)!: change .luna manifest schema to v2
```

## Changelog

`CHANGELOG.md` at the repo root is maintained manually. Before each release:

1. Review all commits since the last tag
2. Group by Added, Changed, Fixed, Removed, Security
3. Add the new version section at the top following the existing format

```markdown
## [0.2.0] - 2026-04-01

### Added

- Feature X
- Feature Y

### Fixed

- Bug Z
```

## Release Process

### 1. Prepare the release

```bash
# Ensure main is clean and run the release checks that are green in this repo
git checkout main
git pull
bun run --cwd apps/dashboard build
bun run --cwd apps/desktop electron:build
bun run docs:build
```

### 2. Bump versions

Update the version in both files:

- `package.json`
- `apps/desktop/package.json`

```bash
# Update CHANGELOG.md
# Then commit:
git add -A
git commit -m "chore(release): v0.2.0"
```

### 3. Tag the release

```bash
git tag -a v0.2.0 -m "v0.2.0"
git push origin main --tags
```

### 4. CI builds platform bundles

The GitHub Actions workflow `release.yml` triggers on tag push and:

1. Runs the Bun-based release checks configured in the workflow
2. Builds Electron packages with `bun run --cwd apps/desktop electron:build`
3. Uploads the generated desktop artifacts for the matrix targets
4. Publishes the docs site with `bun run docs:build`

### 5. Publish the release

After CI completes, edit the GitHub Release:

- Paste the relevant CHANGELOG section as the release notes
- Mark as latest

## Electron Build Pipeline

The Electron build produces platform-native bundles through `electron-builder`:

| Platform | Bundle                 | Notes                                             |
| -------- | ---------------------- | ------------------------------------------------- |
| macOS    | `.app`, `.dmg`, `.zip` | Built by `electron-builder` from the Electron app |
| Linux    | `.AppImage`, `.deb`    | Built on Linux runners                            |
| Windows  | `.nsis`, unpacked app  | Built on Windows runners                          |

The packaging command expects a built dashboard and uses `apps/desktop/scripts/materialize-next.ts` to materialize the Next standalone dependency tree before `electron-builder` runs.

## Hotfix Process

For critical security or stability fixes:

```bash
# Branch from the release tag
git checkout -b hotfix/v0.1.1 v0.1.0

# Apply fix
# ...

# Bump patch version and tag
git commit -m "fix(security): patch API key exposure in logs"
git tag -a v0.1.1 -m "v0.1.1"
git push origin hotfix/v0.1.1 --tags

# Merge back to main
git checkout main
git merge hotfix/v0.1.1
git push
```
