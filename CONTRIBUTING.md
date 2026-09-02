# Contributing to QuickShed

Thanks for helping improve QuickShed. Keep changes small, factual, and easy to review.

## Before you start

```bash
npm ci
npm run dev
```

The development server runs on port 7125. Use the English and Arabic routes when a change affects public copy or layout.

## Source of truth

- `content/tools/*.json` is the authored inventory.
- `content/tools-index.json` is the runtime index. Keep it in parity with the authored descriptors.
- `src/lib/tool-schema.ts` defines required tool metadata.
- `src/components/tools/` contains client-side tools. Keep browser APIs, hooks, and browser storage out of server render paths.
- `messages/en.json` and `messages/ar.json` must receive matching shared copy updates with placeholders preserved.

## Public copy and privacy

Describe the behavior shown by the tool's badge. Do not turn a Local or File-only tool into a claim about the entire site, and do not promise unlimited file sizes, permanent availability, or guaranteed offline navigation. If a tool uses an external service, its metadata, page copy, and disclosure path must agree before implementation.

Avoid unsupported superlatives and absolute claims. Keep technical truth and user-facing explanation aligned across English and Arabic.

## Development workflow

1. Branch from the current main branch.
2. Keep the change focused; do not add dependencies or refactor unrelated code.
3. Update both locales for shared user-facing copy.
4. Update `CHANGELOG.md` for user-visible, privacy, security, release-gate, or CI behavior changes.
5. Run the narrowest relevant checks before opening a pull request.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run guard:public-assets
npm run test:public-boundary
npm run test:codeql-security
npm run test:e2e
```

For a release candidate, run the complete gate:

```bash
npm run release:check
```

A push, build, or test run is not a deployment. Do not run a local deployment command as a substitute for the project release process.

## Pull requests

A pull request should include:

- what changed and why;
- the user-visible or security impact;
- checks that passed and any remaining warnings;
- screenshots or rendered checks when presentation changed;
- confirmation that English and Arabic behavior were checked when relevant.

Do not include credentials, private URLs, real user data, or sensitive tool inputs in commits, issues, pull requests, screenshots, or examples.

## Adding a tool

Follow the complete metadata contract in `src/lib/tool-schema.ts`. Add the authored descriptor, synchronized runtime index entry, client component, registry entry, and both locale descriptions. Document every external destination and data purpose before adding an API-class tool.

## License

By contributing, you agree that your contribution is provided under the [MIT License](LICENSE).
