from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from r2_support import (
    audit_quality,
    required_evidence_categories,
    validate_result,
    write_audit_artifact,
)


def case(**overrides):
    value = {
        "case_id": "T-C01-D1@en-Latn-US",
        "locale_id": "en-Latn-US",
        "taxonomy_cell": "C01",
        "difficulty": "D1",
        "content_job": "FACT",
        "article_eligibility": "ARTICLE_SUITABLE",
        "query": "What is the return window?",
        "risk_tags": ["PRIMARY_SOURCE_IMPORTANT", "FRESHNESS_SENSITIVE"],
        "evidence": [{
            "source_id": "S-1",
            "title": "Approved source",
            "content": "The public policy allows returns within 30 days.",
            "source_kind": "PUBLIC_OR_SYNTHETIC_SAFE",
            "evidence_cutoff_utc": "2026-08-29T00:00:00Z",
        }],
    }
    value.update(overrides)
    return value


def result(**overrides):
    value = {
        "request_id": "T-C01-D1@en-Latn-US",
        "response_mode": "CONCISE_ANSWER",
        "evidence_readiness": {"status": "READY", "gaps": []},
        "value_plan": {
            "operations": ["CONCISE_EXTRACTION"],
            "evidence_refs": ["S-1"],
            "summary": "Answer the direct factual question concisely from the supplied source.",
        },
        "candidate_text": "The public policy allows returns within 30 days. [S-1]",
        "claims": [{
            "claim_id": "claim-1",
            "text": "The public policy allows returns within 30 days.",
            "materiality": "MEDIUM",
            "evidence_refs": ["S-1"],
            "hypothesis": False,
        }],
        "integrity": {"status": "PASS", "hard_failures": []},
        "decision": "READY_FOR_AUDIT",
    }
    value.update(overrides)
    return value


def test_risk_tags_are_projected_as_readiness_requirements_without_granting_value():
    categories = required_evidence_categories(case())
    assert categories == ["current_or_dated_evidence", "primary_source"]


def test_result_validation_accepts_concise_answer_and_rejects_article_for_navigation():
    assert validate_result(case(), result()) == []
    nav_case = case(content_job="NAV", article_eligibility="NAVIGATIONAL")
    errors = validate_result(nav_case, result(response_mode="ARTICLE"))
    assert "NON_ARTICLE_INTENT_AS_ARTICLE" in errors


def test_result_validation_rejects_unknown_refs_and_bad_integrity_shape():
    errors = validate_result(case(), result(
        value_plan={"operations": ["CONCISE_EXTRACTION"], "evidence_refs": ["MISSING"], "summary": "x"},
        integrity={"status": "BROKEN", "hard_failures": "not-a-list"},
    ))
    assert "VALUE_REF_UNKNOWN" in errors
    assert "BAD_INTEGRITY" in errors


def test_audit_quality_is_retained_as_a_structured_artifact(tmp_path: Path):
    audit = audit_quality(case(), result(), observations=["Direct answer satisfies the narrow factual need."])
    assert audit["case_id"] == case()["case_id"]
    assert audit["status"] in {"PASS", "REVIEW"}
    path = tmp_path / "audit.json"
    write_audit_artifact(path, audit)
    written = json.loads(path.read_text(encoding="utf-8"))
    assert written == audit


def test_audit_rejects_private_or_chain_of_thought_fields():
    audit = audit_quality(case(), result(), observations=["bounded observation"])
    audit["private_reasoning"] = "must not persist"
    audit["chain_of_thought"] = "must not persist"
    path = Path("/tmp/should-not-be-written.json")
    try:
        write_audit_artifact(path, audit)
    except ValueError as exc:
        assert "forbidden" in str(exc).lower()
    else:
        raise AssertionError("forbidden audit fields were accepted")
    if path.exists():
        path.unlink()
