---
name: search-quality-content-r2
description: Use when an agent must turn approved closed evidence into a useful, safe response.
version: R2-agent-native-conformance-repair
---

# Search Quality Content R2 — Agent-Native Workflow

This skill is the primary semantic execution contract. The host agent—not a deterministic helper—must interpret the need, assess evidence, construct the value plan, and compose the candidate response. Support code only validates and records the host-produced artifacts.

## Closed-evidence boundary

Use only the query, locale context, risk tags, and evidence supplied in the request. Do not browse, retrieve, consult benchmark history, inspect gold labels, infer hidden expected outcomes, or import private context. Do not publish or mutate production content.

A source identity proves where an item came from; it does not prove that the item supports a claim or creates useful value.

## Host-agent execution contract

For every request, perform these stages in order and retain their outputs:

### 1. Interpret the need and choose the response form

Reason over the query, root intent, secondary intents, content job, locale, article eligibility, and risk context. Select exactly one response form before drafting:

- `ARTICLE` — a substantive article is suitable and the evidence can support a useful transformation;
- `CONCISE_ANSWER` — the user needs a direct fact or short explanation, and an article would add padding rather than value;
- `NAVIGATE` — the user needs a destination, official page, or direct route;
- `LOCAL_ACTION` — the user needs a local action or business outcome;
- `CLARIFY_OR_REVIEW` — material ambiguity must be resolved before a substantive answer;
- `DO_NOT_WRITE` — no safe, defensible response can be produced from the supplied context.

Do not let a preclassified article label override the actual query. `NAV`, `LOCAL`, and unresolved `DISAMBIG` needs must not be manufactured into articles.

### 2. Plan evidence readiness

Inspect the supplied evidence for identity, content, scope, date, locale, and suitability for the selected response form. Return `READY`, `RESEARCH_REQUIRED`, or `INSUFFICIENT_EVIDENCE` with explicit gaps.

Apply the relevant risk requirements rather than treating all evidence as interchangeable:

- `FRESHNESS_SENSITIVE`: require a dated/current source and time-bound current claims;
- `PRIMARY_SOURCE_IMPORTANT`: require an appropriate primary or explicitly authoritative source when the task calls for one;
- `LOCAL_CONTEXT_REQUIRED`: require the target market/location and current local destination or jurisdiction details;
- `HIGH_EVIDENCE_BURDEN`: require explicit support for consequential claims, not a suggestive fragment;
- `EXPERIENCE_REQUIRED`: require approved experience evidence for first-person or experiential assertions;
- `HIGH_TRUST` or `YMYL_OR_HIGH_TRUST`: apply the stricter source, uncertainty, and claim-scope standard.

Never fill a readiness gap with a guessed fact, URL, location, date, quote, experience, or market assumption. A research-required result is not a pass-through to unsupported drafting.

### 3. Construct the value plan

Build a concise typed `value_plan` from the user's need and the supported evidence. Choose only operations that describe a real transformation, such as:

- `SYNTHESIS_RELATIONSHIPS`
- `DECISION_CRITERIA`
- `TRADEOFF_ANALYSIS`
- `PROCEDURAL_SEQUENCE`
- `DIAGNOSTIC_BRANCHING`
- `CONSTRAINT_BASED_RECOMMENDATION`
- `FRESHNESS_DELTA`
- `LOCALE_CONTEXTUALIZATION`
- `SUPPORTED_CALCULATION`
- `CONCISE_EXTRACTION`

The plan must state which evidence identities it uses and what the reader gains. Provenance metadata is trust information only. A `SOURCE_BACKED` item may support synthesis, diagnosis, comparison, or decision support without being relabeled as original analysis. A provenance label alone is never information gain.

If the evidence cannot support a defensible operation for an article-suitable need, choose a bounded research/no-write result rather than padding the answer.

### 4. Compose the selected response

The host agent writes the actual candidate text in the request locale and register. Use the selected form and the value plan:

- direct fact or explanation for `CONCISE_ANSWER`;
- a relationship, decision rule, procedure, diagnostic branch, comparison, conditional recommendation, freshness delta, or bounded perspective for an article;
- a direct destination for `NAVIGATE` only when supplied;
- a local-action response that names only supplied current facts;
- a clarification that separates materially different interpretations;
- no candidate text for `DO_NOT_WRITE` when no safe response exists.

Do not use fixed job-to-prose templates, canned introductions, artificial first-person voice, or repetitive filler. Preserve uncertainty and the evidence's actual scope. Do not emit private chain-of-thought; `value_plan.summary` and audit observations are concise external artifacts only.

### 5. Verify integrity before audit

Create structured claims with stable claim IDs, materiality, exact evidence references, and a boolean `hypothesis` flag. A hypothesis must remain visibly labeled and cannot be stated as an established fact.

Before returning a candidate, check:

- every material claim is bound to the supplied source identity and meaning;
- `verification=PASS` or any caller assertion is never treated as evidence;
- quotes are exact and approved, or are rejected;
- first-person experience is materially bound to approved experience evidence;
- locale, market, currency, jurisdiction, and units match the request;
- freshness claims are scoped to the evidence date;
- no email address, credential, token, customer identity, or private context is present;
- `NAVIGATE`, `LOCAL_ACTION`, and `CLARIFY_OR_REVIEW` are not converted to `ARTICLE`.

Run `deterministic_hard_guard()` from `scripts/r2_support.py` after semantic reasoning. Its result is a safety check, not a substitute for the host agent's claim/evidence understanding.

### 6. Retain an operational quality audit

Call `audit_quality()` from `scripts/r2_support.py` with concise observations about the route, evidence sufficiency, value operation, integrity result, and any remaining review issue. Write one audit JSON artifact per case. Do not calculate an audit and discard it.

If the audit identifies a correctable issue, revise at the host-agent layer, rerun the support checks, and retain the final audit. If the issue needs new evidence or human judgment, record `RESEARCH_REQUIRED` or `HUMAN_REVIEW_REQUIRED`; do not silently downgrade the issue.

## Structured result

Return one result per request with exactly the fields required by `schemas/r2_result.schema.json`:

- `request_id`
- `response_mode`
- `evidence_readiness` (`status`, `gaps`)
- `value_plan` (`operations`, `evidence_refs`, `summary`)
- `candidate_text` (string or null)
- `claims`
- `integrity` (`status`, `hard_failures`)
- `decision`

The retained audit is a separate artifact and may contain route/readiness/value observations, but never private reasoning.

Use `scripts/r2_support.py` for source identity, result validation, deterministic hard guards, JSONL serialization, and audit persistence. It must not compose candidate prose or decide the semantic winner of a case.

## Development execution boundary

For a visible W-DEV run, process every case through this workflow once, retain the structured result and audit, then run the frozen V04 semantic audit in the separately supplied harness. Do not access W-HOLD, gold labels, live search, or external retrieval. Do not create per-case exceptions or tune the workflow against hidden data.
