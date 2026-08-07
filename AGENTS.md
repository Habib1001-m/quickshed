# QuickShed — Agent Operating Contract

> Canonical repository instructions for independent agents and human
> contributors. Reviewed against the current source tree on 2026-08-06.
> Read this file before inspecting or changing the project.

## 1. Authority and scope

- System, platform, developer, and direct owner instructions take precedence
  over this file.
- This file is the single canonical project instruction file at the repository
  root. Do not look for a second root `agent.md` file.
- `.codex/` briefs and evidence records are task-specific local context. They
  are useful for scope and prior validation, but they are not approval for a
  new task and are not a substitute for the current source code.
- Historical audits, README claims, and planning artifacts are evidence, not
  runtime truth. Verify behavior against the implementation before documenting
  it.

## 2. Project facts

- Product: QuickShed, a free privacy-first browser toolbox.
- Release identity: `0.6.0`.
- Runtime: Next.js `16.2.12` App Router, React `19.2.7`, npm `10.9.8`.
- CI runtime: Node.js 22; GitHub Actions runs `npm ci` and
  `npm run release:check`.
- Deployment target: Vercel. The repository does not define an application
  backend, API routes, database, account system, subscription, ads, or product
  analytics.
- Locales: `/en` (LTR) and `/ar` (RTL). Keep behavior and user-facing copy
  aligned across both locales.
- Inventory: 90 source tool definitions in `content/tools/`, 90 matching
  entries in `content/tools-index.json`, and 11 categories. The index is not an
  additional tool.
- Current production inventory has no tool declaring external API egress. The
  metadata schema still supports `privacy: "api"`; any future API tool needs an
  explicit destination, data/purpose disclosure, consent path, and owner
  approval before implementation.

## 3. Non-negotiable product rules

### Privacy and data flow

- Preserve the local-first contract. Do not add network egress to a tool marked
  local, file-only, or offline without explicit owner approval and matching
  metadata evidence.
- Do not add telemetry, analytics, ads, accounts, subscriptions, remote
  processing, or cloud/database persistence without an explicit product
  decision and a separate approved scope.
- Tool inputs and files are processed in the browser by the application. Do not
  turn this into an absolute claim about hosting-provider access logs; use the
  privacy page and metadata contract wording as the source for public copy.
- Browser persistence is local by design: `localStorage` stores preferences and
  selected tool data; `public/sw.js` may use Cache Storage for selected static
  assets. Neither is a license to send tool inputs off-device.

### Bilingual and accessible behavior

- For new or changed shared user-facing copy, update both
  `messages/en.json` and `messages/ar.json` and preserve placeholders exactly.
- Preserve `<html lang>` and `dir` behavior, Arabic RTL layout, English LTR
  layout, keyboard access, focus behavior, and meaningful accessible names.
- When a UI change affects presentation, check both locales, light and dark
  themes, and mobile behavior.

### Server/client boundaries

- `src/lib/blog.ts` is server-only and uses filesystem access. Never import it
  into a client component.
- Tool components under `src/components/tools/` are client components and are
  loaded through the dynamic tool registry. Keep browser APIs, hooks, and
  `localStorage` access out of server render paths.
- Layouts and page files are server components unless explicitly marked
  otherwise. A server component may compose a client component; the reverse is
  not allowed for server-only modules.
- Do not use `Date.now()`, `Math.random()`, or browser globals in an SSR render
  path unless the existing component explicitly owns the client boundary.

## 4. Architecture map

- `src/components/RoutePageShell.tsx` is the interactive SPA shell for Home,
  Categories, Tools, Favorites, and All Tools. It uses the client store and
  history-based navigation.
- `src/components/StaticPageShell.tsx` wraps Blog, Privacy, and Terms routes;
  those routes use normal links/full-page navigation while sharing the site
  layout.
- `src/proxy.ts` is the Next.js 16 proxy convention. It redirects unlocalized
  paths, allows locale-prefixed paths, and blocks public archive extensions.
- `src/app/[locale]/[...path]/page.tsx` is an intentional error-only catch-all
  that calls `notFound()` for unknown locale-prefixed paths. It is the one
  documented dynamic exception; known locale pages and generated tool/category
  routes remain SSG through `generateStaticParams`.
- `src/lib/ssr-locale.tsx` bridges the server locale to client components before
  the client store hydrates.
- `content/tools/*.json` is the source inventory. The runtime descriptor layer
  is `src/lib/tool-descriptors.ts`; `content/tools-index.json` must remain in
  parity with the source definitions.

## 5. Tool metadata contract

Every tool definition must preserve the schema in `src/lib/tool-schema.ts`:
localized name/description, category, icon, component, route, privacy, offline,
retention, risk, bilingual keywords, inputs, outputs, and data-flow evidence.
Do not add a tool or change the inventory count as an incidental refactor.

For metadata, disclosure, or tool-runtime changes, run the focused checks:

```bash
npm run validate:tools
npm run test:tool-parity
npm run test:tool-fixtures
npm run check:tool-count
npm run test:tool-count
```

## 6. Safe work protocol

1. Inspect `git status --short --branch`, the relevant diff, and the applicable
   `.codex/` brief before editing.
2. Treat existing dirty-worktree changes as owner work. Preserve them; never
   use `git reset --hard`, `git checkout --`, `git clean`, broad formatting, or
   destructive deletion to make a task easier.
3. Read the implementation and neighboring tests before changing a documented
   behavior. Keep the diff scoped to the approved request.
4. Use `apply_patch` for local file edits. Do not read `.env`, `.env.local`,
   credential stores, tokens, or authentication databases. `.env.example` is
   safe to consult when configuration shape is needed.
5. Update `CHANGELOG.md` for user-facing, privacy/security, release-gate, or CI
   behavior changes. Keep durable task evidence under `.codex/`; do not publish
   local `specs/` or `.specify/` planning artifacts.
6. Before handoff, report changed files, validation results, unchanged warnings,
   Git state, and any remaining approval gate.

### Approval and Git boundary

- Diagnosis or review does not authorize implementation, publication, or Git
  mutation beyond the requested scope.
- Local edits and validation are allowed when the owner asks for the change.
- Stage, commit, push, merge, deploy, PR creation, release/tagging, and public
  GitHub setting changes require explicit owner authorization for that action.
- A local preview or a passing test is not deployment approval. Keep clean-CI,
  live smoke, secret-rotation, and owner-release decisions separate.

## 7. Validation commands

Run the narrowest relevant checks first. For a release-readiness or broad UI
change, the authoritative gate is:

```bash
npm run release:check
```

The gate runs public-asset protection, metadata validation, parity and fixture
checks, count reconciliation, lint, typecheck, a production build, build
provenance, client-boundary verification, the production dependency audit, and
Chromium desktop/mobile Playwright coverage. Build-dependent checks intentionally
run after `npm run build`.

Useful individual checks are:

```bash
npm run typecheck
npm run lint
npm run build
CI=1 npm run test:e2e
npm run guard:public-assets
npm run check:build-provenance
npm run check:tool-client-boundary
git diff --check
git diff --cached --check
```

The normal local development server is `npm run dev` on port 7125. The
production script is `npm run start` on port 7125. Use another explicit port
only when the owner requests a parallel preview.

Report unchanged lint warnings separately from new errors; a warning is not a
passing claim for a zero-warning policy.

## 8. Git and documentation conventions

- Use focused Conventional Commit messages, for example
  `fix(privacy): align browser storage disclosure` or
  `feat(phase8): close local release readiness`.
- Keep `README.md`, `CONTRIBUTING.md`, the release checklist, metadata contract,
  and changelog aligned when commands, architecture, privacy claims, or release
  gates change.
- Verify every path, command, config key, route, and numeric claim in this file
  against the repository before changing it. Remove stale claims instead of
  preserving them for historical reasons.

## 9. Escalate instead of guessing

Pause and ask the owner when the task requires a missing product decision, new
authority, external coordination, public mutation, a destructive operation, or
an interpretation that would materially expand scope. Continue with read-only
inspection and safe local validation when those checks can resolve the
uncertainty without changing external state.
