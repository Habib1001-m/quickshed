# Contributing to QuickShed

QuickShed is a privacy-first browser toolbox. Contributions should preserve local-first behavior, bilingual support, and static deployment compatibility.

## Development Setup

Use Node.js 22 for CI parity. Bun can be used locally, but npm is the release gate until the project formally chooses one package manager.

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
- ESLint
- TypeScript
- production build
- Playwright smoke tests across Chromium, Firefox, and WebKit

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

User-facing changes should be recorded in `CHANGELOG.md` under the next unreleased version.
