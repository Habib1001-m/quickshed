# Public Archive Incident Record

Date: 2026-06-21
Release target: v0.6.0

## Summary

Release archives were previously present under `public/` and served by the production Vercel deployment. The archives were removed from the repository and a CI guard now blocks future archives, `.env` files, large release artifacts, and internal workspace directories under `public/`.

## Verification

The following production URLs were verified as returning `404` on 2026-06-21:

- `/quickshed-complete.zip`
- `/quickshed-complete.tar.gz`
- `/quickshed-v1.0.0.zip`
- `/quickshed-v1.0.0.tar.gz`

## Controls Added

- `scripts/check-public-assets.mjs`
- `npm run guard:public-assets`
- GitHub Actions public asset guard before lint/typecheck/build/tests
- `tests/smoke.spec.ts` archive 404 regression coverage

## Secret Rotation and History Review Decision

No secret values were copied into this record. Because archived `.env` filenames were observed during the readiness audit, any value that may have existed in those packaged `.env` files must be treated as exposed unless the owner can prove it was a placeholder.

Decision required for v0.6.0:

- Rotate any Vercel, analytics, API, database, or service tokens that may have been present in the archived workspace.
- Keep GitHub secret scanning and push protection enabled.
- Do not tag or promote v0.6.0 until the owner records either "rotation complete" or "no real secrets were present" in the release checklist.
