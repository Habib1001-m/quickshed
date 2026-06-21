# Changelog

All notable changes to QuickShed will be documented in this file.

The format follows Keep a Changelog, and this project uses semantic versioning once public releases begin.

## [Unreleased]

### Security

- Removed public release archives from the static site source.
- Added a public asset guard that blocks archives, `.env` files, large files, and internal folders under `public/`.
- Escaped Markdown and JSON formatter output before rendering highlighted HTML.
- Replaced the math equation solver `new Function` evaluator with a parser.
- Replaced non-cryptographic password and PIN randomness with Web Crypto.

### Fixed

- Generated canonical locale-aware tool share URLs.
- Made `Ctrl+K` handling case-insensitive.
- Avoided a Radix mobile menu hydration mismatch in the header.

### Added

- QuickShed Playwright smoke tests across Chromium, Firefox, and WebKit.
- Release readiness audit and v0.6.0 launch plan.
- GitHub governance templates for issues, pull requests, code ownership, security, and Dependabot.
