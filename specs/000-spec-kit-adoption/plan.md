# QS-SDD-000 Plan — Spec Kit Adoption & Governance Foundation

Status: Draft
Date: 2026-06-23
Type: Documentation-only governance plan

## Technical Context

QuickShed is an existing Next.js 16 / React 19 / TypeScript application with static-first routing, bilingual EN/AR support, client-side tool execution, npm release gates, GitHub Actions, and Vercel deployment.

This plan intentionally avoids runtime changes. It introduces governance artifacts that make future Spec Kit workflows safe for a brownfield repository.

## Change Scope

### Files Added

- `.specify/memory/constitution.md`
- `specs/000-spec-kit-adoption/spec.md`
- `specs/000-spec-kit-adoption/plan.md`
- `specs/000-spec-kit-adoption/tasks.md`

### Files Not Changed

This phase MUST NOT change:

- `src/**`
- `content/**`
- `messages/**`
- `public/**`
- `package.json`
- `package-lock.json`
- `.github/workflows/**`
- `next.config.ts`
- `src/proxy.ts`
- `public/sw.js`

## Design Decision

QuickShed will adopt Spec Kit in two layers:

1. **Repository governance layer**: committed markdown artifacts under `.specify/` and `specs/`.
2. **Agent execution layer**: Codex/OpenCode prompts and tasks generated only after an approved spec and plan.

This avoids prematurely committing generated CLI templates before the owner decides whether to use slash commands, Codex skills mode, or a custom QuickShed preset.

## Workflow Model

Future material work should follow this path:

```text
Strategy / governance input
  -> constitution check
  -> spec.md
  -> clarify when needed
  -> plan.md
  -> tasks.md
  -> implementation branch
  -> CI + release gates
  -> PM review
  -> owner decision
```

## Validation Plan

Because this phase is documentation-only, validation is limited to repository review:

- Confirm the PR contains only markdown governance/spec files.
- Confirm no runtime files changed.
- Confirm the future task list does not authorize implementation prematurely.
- Confirm language and principles match QuickShed's existing project rules.

Full `npm run release:check` is not required for this documentation-only PR, but it remains required for release work and feature implementation PRs.

## Rollback Plan

If the owner rejects the foundation, close the PR without merging. No runtime rollback is needed because no product code is changed.

If a partial revision is required, amend the markdown artifacts on the same branch and re-review.

## Follow-Up Plan

After this PR is approved and merged:

1. Ratify or revise the constitution through `QS-CONST-001`.
2. Create `QS-STRAT-001` for the v0.7 Competitive Edition strategy.
3. Create `QS-SPEC-001` for Tool Schema v2 and Privacy Matrix.
4. Decide whether to run official `specify init` locally and commit generated Spec Kit support files in a separate PR.

## Stop Conditions

Stop and request owner approval if any future step proposes:

- runtime code changes;
- package or lockfile changes;
- CI workflow changes;
- deployment changes;
- public release or tag changes;
- introduction of API/server/cloud behavior;
- changes that weaken privacy, bilingual support, static generation, or no-login/no-ads/no-tracking policy.
