# QuickShed Constitution

Version: 0.1.0
Status: Draft for QS-SDD-000 review
Date: 2026-06-23
Owner: QuickShed Project Owner
PM Track: QS-SDD-000 — Spec Kit Adoption & Governance Foundation

## 1. Purpose

This constitution defines the governing principles for all QuickShed specifications, plans, tasks, implementation work, and agent execution. It exists so QuickShed can adopt Spec Kit / Spec-Driven Development as a controlled brownfield workflow without breaking the existing privacy-first product.

QuickShed is not a greenfield project. It is an existing public Next.js application with production users, release governance, security incident history, CI gates, bilingual requirements, and a privacy-first promise. All future specs must preserve those constraints.

## 2. Source-of-Truth Order

When project information conflicts, agents and contributors MUST resolve truth in this order:

1. The official GitHub repository: `https://github.com/Habib1001-m/quickshed`.
2. The current `main` branch and merged pull requests.
3. Versioned files under `.specify/`, `specs/`, `docs/`, `.github/`, `content/`, `messages/`, and `src/`.
4. Local release gates and CI results.
5. External reports, chat transcripts, and agent memory.

External research reports are useful inputs, but they are not authoritative unless converted into repository artifacts.

## 3. Non-Negotiable Principles

### I. Privacy-First Local Execution

Every tool MUST run locally in the user's browser unless it is explicitly marked as API-based. User files, text, calculations, and generated outputs MUST NOT leave the device without an explicit tool-level privacy label and user-visible disclosure.

Required labels for future tool metadata:

- `local`: fully browser-local processing.
- `file-only`: browser-local processing of selected files.
- `storage`: uses local browser storage only.
- `api`: sends data to a third-party or external API and requires explicit user disclosure.

Hidden server proxies, invisible analytics, and implicit uploads are prohibited.

### II. Bilingual Excellence

Every user-facing string MUST exist in both English and Arabic. Arabic flows MUST support RTL layout, Arabic copy, and culturally appropriate UI spacing. New specs MUST include i18n acceptance criteria unless the work is strictly internal and non-user-facing.

### III. Static-First Architecture

QuickShed remains a static-first application. All public pages SHOULD be statically generated. Dynamic SSR, API routes, server actions, databases, and runtime backends are prohibited unless a spec explicitly justifies them and the constitution is amended or an exception is approved.

### IV. Zero Barriers

QuickShed MUST remain free to use with no login, no subscription wall, no ads, and no tracking. Optional future monetization ideas must not weaken the core public privacy promise.

### V. Security by Construction

Specs and plans MUST prevent security issues before implementation. Requirements MUST cover:

- no unsafe rendering of user-controlled HTML;
- CSP-compatible runtime behavior;
- no public archives or environment files under `public/`;
- safe random generation through Web Crypto where randomness matters;
- no secret values copied into docs, specs, tests, issues, or PR comments;
- dependency risk gates consistent with the release audit policy.

### VI. Performance and UX Discipline

Future work MUST preserve fast initial loading, lazy-loaded tools, mobile responsiveness, accessible UI, and smooth bilingual navigation. Heavy dependencies, WASM, AI SDKs, or media processors require a plan-level performance budget and rollback path.

### VII. Tool Quality Contract

Every new or materially changed tool MUST define:

- tool id and slug;
- category;
- React component mapping;
- privacy label;
- offline behavior;
- inputs and outputs;
- English and Arabic strings;
- risk level;
- minimum test coverage;
- acceptance criteria.

Specs that add tools without this metadata are incomplete.

### VIII. Release Discipline

No release tag, launch announcement, promotion campaign, or production claim may be approved unless the active release checklist is complete and `npm run release:check` passes on the release workspace or CI. Post-deploy smoke verification is required before public promotion.

### IX. PM-First Agent Workflow

Implementation agents MUST NOT start coding from broad strategy. Work must pass through:

1. Strategy or governance artifact when needed.
2. Spec: what and why.
3. Clarification when requirements are underspecified.
4. Plan: technical approach and affected files.
5. Tasks: atomic execution list.
6. Implementation: Codex/OpenCode work.
7. Verification: tests, build, CI, and PM review.

Agent prompts must include constraints, stop conditions, expected evidence, and forbidden actions.

### X. Brownfield Safety

QuickShed is an existing application. Specs MUST avoid broad rewrites, unbounded refactors, dependency churn, or architectural migrations unless there is a clear release benefit, test plan, rollback path, and owner approval.

## 4. Spec Naming and Repository Layout

Spec directories SHOULD use:

```text
specs/NNN-short-kebab-name/
  spec.md
  plan.md
  tasks.md
  research.md        # optional
  data-model.md      # optional
  contracts/         # optional
```

Governance and strategy tracks MAY use prefixed IDs in document titles:

- `QS-SDD-000` for Spec Kit adoption and governance.
- `QS-CONST-*` for constitutional amendments.
- `QS-STRAT-*` for strategy artifacts.
- `QS-SPEC-*` for feature/product specs.
- `QS-PLAN-*` for implementation plans.
- `QS-TASKS-*` for task batches.

The directory number remains numeric for compatibility with Spec Kit conventions.

## 5. Quality Gates

A change is not ready unless the relevant subset of these gates passes or is explicitly marked not applicable:

- `npm run guard:public-assets`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run audit:release`
- `npm run test:e2e`
- Arabic RTL review
- English LTR review
- light and dark theme review
- privacy label review
- release checklist review

The full release gate is:

```bash
npm run release:check
```

## 6. Amendment Process

This constitution may be changed only through a pull request that:

1. explains the reason for the amendment;
2. lists affected principles;
3. updates dependent specs or plans;
4. confirms no release promise is weakened accidentally;
5. receives owner approval before merge.

## 7. Current Adoption Status

This is the initial constitution draft for QS-SDD-000. It establishes the foundation for later Spec Kit artifacts and does not itself authorize feature implementation.
