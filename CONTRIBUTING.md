# Contributing to QuickShed

QuickShed is a privacy-first browser toolbox. Contributions should preserve local-first behavior, bilingual support, and static deployment compatibility.

## Development Setup

Use Node.js 22 for CI parity. npm is the official package manager and release gate. Do not update or introduce a second lockfile for release work.

```bash
npm ci
npm run dev
```

Local development runs on `http://127.0.0.1:7125`.

## Required Checks

Before opening a pull request, run:

```bash
npm run release:check
```

This runs:

- public asset leak guard
- tool metadata validation
- English/Arabic metadata parity and fixture checks
- tool-count reconciliation and count regression checks
- ESLint
- TypeScript
- production build
- build provenance and client-boundary checks after the production build
- critical production dependency audit gate
- Playwright smoke tests on Chromium desktop and mobile, matching GitHub Actions

For a broader local browser pass, install all Playwright browsers and run:

```bash
npx playwright install
npm run test:e2e:all
```

## Tool Metadata and Disclosure Contract

Tool metadata lives in `content/tools/*.json`; the matching
`content/tools-index.json` entry is part of the parity check and is not an
additional tool. Every definition must keep its English and Arabic identity,
route, component, inputs, outputs, privacy, offline, retention, risk, and
data-flow evidence fields valid. The full field contract and disclosure
behavior are documented in [docs/tool-metadata-contract.md](docs/tool-metadata-contract.md).

For metadata or disclosure changes, run:

```bash
npm run validate:tools
npm run test:tool-fixtures
npm run check:tool-count
npm run test:tool-count
```

Keep `messages/en.json` and `messages/ar.json` aligned when disclosure copy
changes. The disclosure must appear before tool content mounts; an API path
must show its destination/data/purpose and obtain explicit consent before any
transmission. Do not place secrets, tokens, credentials, or environment values
in metadata, disclosure strings, evidence, tests, or logs.

## Security and Privacy Rules

- Do not place archives, `.env` files, generated workspace dumps, or internal folders in `public/`.
- Do not add telemetry, analytics, ads, or remote processing without a documented product decision.
- User input rendered as HTML must be escaped or sanitized.
- Security tools must use Web Crypto where randomness matters.
- Keep Arabic RTL and English LTR flows working.

## Pull Request Expectations

- Keep changes focused.
- Include tests for user-visible behavior or security fixes.
- Update docs when commands, URLs, release process, or public claims change.
- Mention any accepted risk explicitly in the PR description.

## Release Notes

Every user-facing, privacy/security, release-gate, or CI behavior change must
add a concise entry under `## [Unreleased]` in `CHANGELOG.md` in the same
working change. Keep the v0.6.0 release checklist and any local `.codex/`
evidence aligned with the latest validation result; do not copy an older pass
count into a current release claim.
