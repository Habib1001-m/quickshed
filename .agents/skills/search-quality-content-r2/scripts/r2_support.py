from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

RESPONSE_MODES = {
    "ARTICLE",
    "CONCISE_ANSWER",
    "NAVIGATE",
    "LOCAL_ACTION",
    "CLARIFY_OR_REVIEW",
    "DO_NOT_WRITE",
}
READINESS_STATUSES = {"READY", "RESEARCH_REQUIRED", "INSUFFICIENT_EVIDENCE"}
DECISIONS = {"READY_FOR_AUDIT", "RESEARCH_REQUIRED", "DO_NOT_WRITE", "HUMAN_REVIEW_REQUIRED"}
VALUE_OPERATIONS = {
    "SYNTHESIS_RELATIONSHIPS",
    "DECISION_CRITERIA",
    "TRADEOFF_ANALYSIS",
    "PROCEDURAL_SEQUENCE",
    "DIAGNOSTIC_BRANCHING",
    "CONSTRAINT_BASED_RECOMMENDATION",
    "FRESHNESS_DELTA",
    "LOCALE_CONTEXTUALIZATION",
    "SUPPORTED_CALCULATION",
    "CONCISE_EXTRACTION",
}
RISK_REQUIREMENTS = (
    ("FRESHNESS_SENSITIVE", "current_or_dated_evidence"),
    ("PRIMARY_SOURCE_IMPORTANT", "primary_source"),
    ("LOCAL_CONTEXT_REQUIRED", "locale_or_local_current_evidence"),
    ("HIGH_EVIDENCE_BURDEN", "explicit_or_multiple_support"),
    ("EXPERIENCE_REQUIRED", "approved_experience"),
    ("HIGH_TRUST", "high_trust_source"),
    ("YMYL_OR_HIGH_TRUST", "high_trust_source"),
)
EMAIL = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
SECRET = re.compile(r"(?:sk-[A-Za-z0-9_-]{12,}|AKIA[0-9A-Z]{16}|api[_ -]?key\s*[:=])", re.IGNORECASE)
FIRST_PERSON = re.compile(r"\b(?:i|we|my|our|me|i've|we've)\b|(?:جربت|جربنا|خبرتي|خبرتنا|اختبرت|اختبرنا)", re.IGNORECASE)
QUOTE = re.compile(r'(?:"([^"]+)"|“([^”]+)”|«([^»]+)»|„([^”]+)”)')
FORBIDDEN_AUDIT_KEYS = {"chain_of_thought", "private_reasoning", "hidden_reasoning", "internal_reasoning"}


def _evidence(case: dict[str, Any]) -> list[dict[str, Any]]:
    return [entry for entry in case.get("evidence", []) if isinstance(entry, dict)]


def source_ids(case: dict[str, Any]) -> list[str]:
    """Return stable source identities for deterministic joins."""
    return sorted({str(entry["source_id"]) for entry in _evidence(case) if entry.get("source_id")})


def required_evidence_categories(case: dict[str, Any]) -> list[str]:
    """Project declared risk metadata into requirements for host reasoning."""
    tags = {str(tag) for tag in case.get("risk_tags", [])}
    categories: list[str] = []
    for tag, category in RISK_REQUIREMENTS:
        if tag in tags and category not in categories:
            categories.append(category)
    return categories


def validate_readiness(readiness: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(readiness, dict):
        return ["BAD_EVIDENCE_READINESS"]
    if readiness.get("status") not in READINESS_STATUSES:
        errors.append("BAD_EVIDENCE_READINESS")
    if not isinstance(readiness.get("gaps"), list) or not all(isinstance(gap, str) for gap in readiness["gaps"]):
        errors.append("BAD_EVIDENCE_GAPS")
    return errors


def validate_result(case: dict[str, Any], result: dict[str, Any]) -> list[str]:
    """Validate the host-produced result without generating semantic content."""
    errors: list[str] = []
    if not isinstance(result, dict):
        return ["RESULT_NOT_OBJECT"]
    if result.get("request_id") != case.get("case_id"):
        errors.append("REQUEST_ID_MISMATCH")
    if result.get("response_mode") not in RESPONSE_MODES:
        errors.append("BAD_RESPONSE_MODE")
    errors.extend(validate_readiness(result.get("evidence_readiness")))
    plan = result.get("value_plan")
    if not isinstance(plan, dict) or not isinstance(plan.get("operations"), list) or not isinstance(plan.get("evidence_refs"), list) or not isinstance(plan.get("summary"), str) or len(plan.get("summary", "")) > 500:
        errors.append("BAD_VALUE_PLAN")
    else:
        if any(operation not in VALUE_OPERATIONS for operation in plan["operations"]):
            errors.append("BAD_VALUE_OPERATION")
        if any(str(ref) not in set(source_ids(case)) for ref in plan["evidence_refs"]):
            errors.append("VALUE_REF_UNKNOWN")
    if result.get("decision") not in DECISIONS:
        errors.append("BAD_DECISION")
    text = result.get("candidate_text")
    if text is not None and not isinstance(text, str):
        errors.append("BAD_CANDIDATE_TEXT")
    claims = result.get("claims")
    if not isinstance(claims, list):
        errors.append("CLAIMS_NOT_LIST")
    else:
        source_set = set(source_ids(case))
        seen: set[str] = set()
        for claim in claims:
            if not isinstance(claim, dict):
                errors.append("BAD_CLAIM")
                continue
            claim_id = claim.get("claim_id")
            if not isinstance(claim_id, str) or not claim_id or claim_id in seen:
                errors.append("BAD_CLAIM_ID")
            seen.add(str(claim_id))
            if not isinstance(claim.get("text"), str) or not claim["text"].strip():
                errors.append("BAD_CLAIM_TEXT")
            if claim.get("materiality") not in {"LOW", "MEDIUM", "HIGH"}:
                errors.append("BAD_MATERIALITY")
            refs = claim.get("evidence_refs")
            if not isinstance(refs, list) or any(str(ref) not in source_set for ref in refs):
                errors.append("CLAIM_REF_UNKNOWN")
            if not isinstance(claim.get("hypothesis"), bool):
                errors.append("BAD_HYPOTHESIS_FLAG")
            if "verification" in claim:
                errors.append("CALLER_VERIFICATION_FIELD_PRESENT")
    integrity = result.get("integrity")
    if not isinstance(integrity, dict) or integrity.get("status") not in {"PASS", "FAIL", "HUMAN_REVIEW_REQUIRED"} or not isinstance(integrity.get("hard_failures"), list) or not all(isinstance(item, str) for item in integrity["hard_failures"]):
        errors.append("BAD_INTEGRITY")
    if result.get("decision") == "READY_FOR_AUDIT" and (not isinstance(text, str) or not text.strip()):
        errors.append("AUDIT_WITHOUT_CANDIDATE")
    job = str(case.get("content_job", ""))
    mode = result.get("response_mode")
    eligibility = str(case.get("article_eligibility", ""))
    if job == "DISAMBIG" and mode not in {"CLARIFY_OR_REVIEW", "DO_NOT_WRITE"}:
        errors.append("DISAMBIG_WRONG_FORM")
    if (job == "NAV" or eligibility == "NAVIGATIONAL") and mode == "ARTICLE":
        errors.append("NON_ARTICLE_INTENT_AS_ARTICLE")
    if (job == "LOCAL" or eligibility == "LOCAL_ACTION") and mode == "ARTICLE":
        errors.append("NON_ARTICLE_INTENT_AS_ARTICLE")
    if mode == "CONCISE_ANSWER" and (not isinstance(text, str) or not text.strip()):
        errors.append("EMPTY_CONCISE_ANSWER")
    return sorted(set(errors))


def _word_set(value: str) -> set[str]:
    return {word.casefold() for word in re.findall(r"[\w]+", str(value), flags=re.UNICODE) if len(word) > 1}


def deterministic_hard_guard(case: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    """Apply only deterministic trust-boundary checks to host-produced output."""
    failures: list[str] = []
    raw_text = result.get("candidate_text")
    text = raw_text if isinstance(raw_text, str) else ""
    if EMAIL.search(text) or SECRET.search(text):
        failures.append("PRIVACY_LEAK")
    source_map = {str(entry.get("source_id")): entry for entry in _evidence(case)}
    for claim in result.get("claims", []) if isinstance(result.get("claims"), list) else []:
        if not isinstance(claim, dict):
            failures.append("CLAIM_EVIDENCE_UNBOUND")
            continue
        refs = [str(ref) for ref in claim.get("evidence_refs", []) if ref]
        if not refs or any(ref not in source_map for ref in refs):
            failures.append("CLAIM_EVIDENCE_UNBOUND")
        if "verification" in claim:
            failures.append("CALLER_VERIFICATION_NOT_EVIDENCE")
        if not isinstance(claim.get("hypothesis"), bool):
            failures.append("HYPOTHESIS_LABEL_MISSING")
    approved_quotes = [
        _word_set(str(entry.get("approved_quote")))
        for entry in _evidence(case)
        if entry.get("approved_quote")
    ]
    for quoted in (part for match in QUOTE.findall(text) for part in match if part):
        if _word_set(quoted) not in approved_quotes:
            failures.append("QUOTE_UNBOUND")
    if FIRST_PERSON.search(text) and not any(entry.get("experience_approved") is True for entry in _evidence(case)):
        failures.append("EXPERIENCE_UNBOUND")
    if (str(case.get("content_job")) == "NAV" or str(case.get("article_eligibility")) == "NAVIGATIONAL") and result.get("response_mode") == "ARTICLE":
        failures.append("NON_ARTICLE_INTENT_AS_ARTICLE")
    if (str(case.get("content_job")) == "LOCAL" or str(case.get("article_eligibility")) == "LOCAL_ACTION") and result.get("response_mode") == "ARTICLE":
        failures.append("NON_ARTICLE_INTENT_AS_ARTICLE")
    unique = list(dict.fromkeys(failures))
    return {"status": "FAIL" if unique else "PASS", "hard_failures": unique}


def audit_quality(case: dict[str, Any], result: dict[str, Any], observations: list[str]) -> dict[str, Any]:
    """Build the retained audit record from host observations and support checks."""
    if not isinstance(observations, list) or not all(isinstance(item, str) and item.strip() for item in observations):
        raise ValueError("audit observations must be non-empty strings")
    readiness = result.get("evidence_readiness", {})
    issues = list(result.get("integrity", {}).get("hard_failures", []))
    if readiness.get("status") != "READY":
        issues.extend(str(gap) for gap in readiness.get("gaps", []))
    issues = list(dict.fromkeys(issues))
    return {
        "case_id": str(case.get("case_id", "")),
        "status": "REVIEW" if issues else "PASS",
        "response_mode": result.get("response_mode"),
        "evidence_readiness": readiness,
        "required_evidence_categories": required_evidence_categories(case),
        "value_operations": list(result.get("value_plan", {}).get("operations", [])),
        "observations": observations,
        "issues": issues,
        "decision": result.get("decision"),
        "revision_status": "REVISE_BEFORE_AUDIT" if issues else "NO_REVISION_REQUIRED",
    }


def _contains_forbidden_audit_key(value: Any) -> bool:
    if isinstance(value, dict):
        return any(key in FORBIDDEN_AUDIT_KEYS or _contains_forbidden_audit_key(child) for key, child in value.items())
    if isinstance(value, list):
        return any(_contains_forbidden_audit_key(child) for child in value)
    return False


def write_audit_artifact(path: Path, audit: dict[str, Any]) -> None:
    if _contains_forbidden_audit_key(audit):
        raise ValueError("forbidden private reasoning field in audit")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(audit, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records), encoding="utf-8")
