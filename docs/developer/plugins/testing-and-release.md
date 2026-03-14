# Plugin Testing And Release

## Local Development

Recommended workflow:

1. validate manifest
2. test lifecycle activation
3. test permissions behavior
4. test hook execution
5. test UI registration
6. test failure isolation

## What To Verify

- required manifest fields exist
- declared permissions are actually sufficient
- hooks fire on expected lifecycle events
- plugin failures do not break the host
- settings UI renders and persists correctly
- install/update/remove paths behave correctly

## Release Expectations

- sign the package if distributed through the marketplace
- document required permissions clearly
- include compatibility notes
- include minimum app version
- include migration notes if the plugin changes its stored data or config behavior
