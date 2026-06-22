# QS-SDD-000 — QuickShed Spec Kit Adoption & Governance Foundation

Status: Draft
Track: Governance / Spec-Driven Development
Date: 2026-06-23
Branch: `pm/qs-sdd-000-spec-kit-foundation`

## Summary

Adopt Spec Kit / Spec-Driven Development for QuickShed as a controlled brownfield workflow. This specification creates the initial governance foundation, naming rules, source-of-truth rules, and execution boundaries for future specs.

This spec does not add product features and does not authorize implementation of the v0.7 Competitive Edition. It prepares the repository so future work can be specified, planned, task-split, implemented, and verified consistently.

## Background

QuickShed is an existing privacy-first, bilingual, static-first toolbox. The project has production release constraints, a public repository, CI gates, and an active v0.6.0 release checklist. Competitive reports suggest a future improved edition, but that work must begin with governance and constitution artifacts before feature specs.

Spec Kit's workflow starts with project principles, then specification, plan, tasks, and implementation. For QuickShed, this means `QS-SDD-000` must precede `QS-SPEC-001`.

## Goals

- Establish `.specify/memory/constitution.md` as the initial QuickShed constitution.
- Establish the official SDD naming and directory conventions.
- Define how PM, Codex, OpenCode, and future agents should interact with the repository.
- Preserve QuickShed's non-negotiables: privacy, bilingual quality, static-first architecture, zero barriers, performance, and release discipline.
- Separate governance adoption from feature implementation.
- Prepare a clean path toward future strategy and feature specs.

## Non-Goals

- Do not add or modify runtime application code.
- Do not add AI tools, PDF tools, image tools, or video tools in this phase.
- Do not change package manager policy.
- Do not change CI behavior.
- Do not create a release tag.
- Do not promote v0.6.0 or v0.7.0.
- Do not introduce a server, API route, database dependency, tracking, login, or monetization.

## Actors

- Project Owner: approves product direction, release decisions, and constitutional exceptions.
- PM / GPT: creates specs, plans, task prompts, review gates, and decision packets.
- Codex / OpenCode Agents: implement only from approved specs, plans, and tasks.
- GitHub: official repository and source of truth.
- CI / Vercel: verification and deployment evidence sources.

## Requirements

### Governance Requirements

- **QS-SDD-000-GOV-001**: The repository MUST contain an initial QuickShed constitution under `.specify/memory/constitution.md`.
- **QS-SDD-000-GOV-002**: The constitution MUST define non-negotiable principles for privacy, bilingual support, static-first architecture, zero barriers, security, performance, release discipline, and agent workflow.
- **QS-SDD-000-GOV-003**: The repository MUST define where future specs live and how they are named.
- **QS-SDD-000-GOV-004**: Future work MUST not proceed directly from strategy to implementation without spec, plan, and tasks.
- **QS-SDD-000-GOV-005**: Chat outputs and competitive reports MUST be treated as inputs, not source of truth, until committed to the official repository.

### Brownfield Safety Requirements

- **QS-SDD-000-SAFE-001**: This adoption phase MUST be documentation-only.
- **QS-SDD-000-SAFE-002**: This phase MUST NOT modify runtime app behavior.
- **QS-SDD-000-SAFE-003**: This phase MUST NOT affect production deployment, public assets, service worker behavior, CSP, routes, locale handling, or package scripts.
- **QS-SDD-000-SAFE-004**: This phase MUST keep v0.6.0 release closure separate from v0.7 planning.

### Agent Workflow Requirements

- **QS-SDD-000-AGENT-001**: Agent execution prompts MUST include scope, non-goals, forbidden actions, evidence requirements, and stop conditions.
- **QS-SDD-000-AGENT-002**: Implementation agents MUST operate on the official GitHub repository or a checked-out copy of that repository.
- **QS-SDD-000-AGENT-003**: Agents MUST not invent repository facts when a GitHub source can be checked.
- **QS-SDD-000-AGENT-004**: Secret values MUST never be printed, copied, summarized, or stored in specs, issues, PRs, or logs.

### Release Governance Requirements

- **QS-SDD-000-REL-001**: No release promotion may happen until the active release checklist is complete.
- **QS-SDD-000-REL-002**: `npm run release:check` remains the release gate unless a later approved spec changes it.
- **QS-SDD-000-REL-003**: v0.7 planning MUST not skip remaining v0.6 closure items.

## Acceptance Criteria

- [ ] `.specify/memory/constitution.md` exists and includes the initial QuickShed constitution.
- [ ] `specs/000-spec-kit-adoption/spec.md` exists and documents QS-SDD-000.
- [ ] `specs/000-spec-kit-adoption/plan.md` exists and confirms this is documentation-only.
- [ ] `specs/000-spec-kit-adoption/tasks.md` exists and defines the next governance tasks.
- [ ] A pull request exists for owner review.
- [ ] The PR contains no runtime code changes.
- [ ] The PR does not alter CI, public assets, package scripts, source components, translations, or deployment settings.

## Future Sequence After QS-SDD-000

1. `QS-CONST-001` — Constitution review and ratification.
2. `QS-STRAT-001` — v0.7 Competitive Edition product strategy.
3. `QS-SPEC-001` — Tool Schema v2 and Privacy Matrix.
4. `QS-SPEC-002` — Competitive tools batch A.
5. `QS-SPEC-003` — Local AI / creator tools batch.

## Risks

- Over-formalizing the workflow could slow small fixes.
- Copying Spec Kit structure without adapting to QuickShed could create unused process artifacts.
- Starting v0.7 feature work before v0.6 release closure could create release drift.

## Risk Controls

- Keep QS-SDD-000 documentation-only.
- Keep source-of-truth rules simple and explicit.
- Require specs only for material product, architecture, security, or release changes.
- Allow small typo-only/doc-only fixes through lightweight PRs when they do not affect product behavior.

## Open Questions

- Should QuickShed run `specify init --integration codex` locally and commit the generated agent prompt files in a later PR?
- Should the project use slash-command prompts, Codex skills mode, or both?
- Should future feature tasks be converted into GitHub Issues through the Spec Kit issue workflow?
- Should QuickShed create a custom Spec Kit preset for privacy-first bilingual static apps?
