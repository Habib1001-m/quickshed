# Security Policy

## Supported Versions

Security fixes are prepared for the active release branch and the current production deployment.

| Version | Supported |
| --- | --- |
| v0.6.x | Yes |
| older prerelease snapshots | No |

## Reporting a Vulnerability

Do not open a public issue for exploitable security details, secrets, or private user data.

Preferred reporting path:

1. Use GitHub private vulnerability reporting if it is enabled for this repository.
2. If private reporting is not available, open a minimal public issue that says a private security report is needed, without exploit payloads or sensitive data.

Please include:

- Affected URL, tool, or file.
- Reproduction steps.
- Browser and operating system.
- Impact assessment.
- Whether any secret, token, archive, or private file was exposed.

## Response Targets

- Critical exposure or active exploit: triage within 24 hours.
- High severity vulnerability: triage within 3 business days.
- Moderate or low severity vulnerability: triage within 7 business days.

These targets are operational goals, not a guarantee.

## Current Release Gate

Before an official v0.6.0 launch, the project must verify:

- No archives or internal workspace material are served from `public/`.
- Potentially exposed secrets have a recorded rotation decision.
- `npm run release:check` passes.
- Dependency audit findings have an explicit remediation or risk decision.
