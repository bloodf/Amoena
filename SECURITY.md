# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release | Yes |
| Previous release | Security fixes only |
| Older versions | No |

## Reporting a Vulnerability

Do not report security vulnerabilities through public GitHub Issues.

Instead:
1. Use GitHub's private vulnerability reporting feature.
2. Go to https://github.com/LunariaAi/lunaria/security/advisories and click "Report a vulnerability."
3. Include as much detail as possible: steps to reproduce, impact assessment, and suggested fix.

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 1 week
- **Fix timeline:** Depends on severity; critical issues are patched within 72 hours

## Security Design

Lunaria's security model is documented in `docs/architecture/security-model.md`. Key principles:
- Desktop is the trust anchor; mobile and remote clients are untrusted
- Agent tool execution requires explicit user permission
- Provider API keys are stored in the OS keychain, never in plaintext files
- Workspace isolation prevents agents from modifying the user's working tree
- All remote connections use E2E encryption with device-scoped JWT tokens
