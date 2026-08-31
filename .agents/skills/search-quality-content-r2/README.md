# Search Quality Content R2

This successor is an agent-native skill. `SKILL.md` is the semantic contract; the host agent performs need interpretation, evidence reasoning, value planning, and response composition.

`scripts/r2_support.py` is intentionally narrow. It provides source identity, result-contract validation, deterministic trust-boundary guards, JSONL serialization, and retained audit persistence. It does not generate candidate prose or select semantic winners.

`tests/test_r2_support.py` covers the supported concise-answer route, risk metadata projection, response-form safety, evidence-reference integrity, privacy, quote/experience boundaries, caller-verification rejection, hypothesis shape, and audit retention.
