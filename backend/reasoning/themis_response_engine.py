"""
Themis Response Generation Engine

Purpose:
- Consume legal retrieval context from parent RAG backend.
- Generate a structured legal guidance response (Themis stage).
- Convert output back to original user language (Hindi) when needed.

Flow:
    Query (English processing text) -> Parent RAG retrieval -> Themis reasoning
    -> If original input language is Hindi, translate final response to Hindi.

Notes:
- RAG retrieval is loaded from parent project: ../backend/engine.py
- Output is guidance, not legal advice.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
from contextlib import contextmanager


# Allow importing project-level modules like translate_response.py
NAYAY_ROOT = Path(__file__).resolve().parents[2]
if str(NAYAY_ROOT) not in sys.path:
    sys.path.insert(0, str(NAYAY_ROOT))

from translate_response import translate_response  # noqa: E402


@dataclass
class ThemisRequest:
    query: str
    lang: str  # original input language: "hi" or "en"
    case_type: Optional[str] = None
    evidence: Optional[str] = None
    evidence_json: Optional[str] = None
    top_k: int = 5
    pro_mode: bool = True


def _parent_backend_dir() -> Path:
    # .../Nayay/backend/reasoning/themis_response_engine.py -> .../Praytna 3.0/backend
    return Path(__file__).resolve().parents[3] / "backend"


@contextmanager
def _cwd(path: Path):
    prev = Path.cwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(prev)


def _load_parent_rag_modules():
    """
    Dynamically import parent RAG modules from Praytna 3.0/backend.

    Returns:
        (engine_module, database_module)
    """
    parent_backend = _parent_backend_dir()
    if not parent_backend.exists():
        raise FileNotFoundError(f"Parent backend not found: {parent_backend}")

    if str(parent_backend) not in sys.path:
        sys.path.insert(0, str(parent_backend))

    import importlib

    with _cwd(parent_backend):
        database = importlib.import_module("database")
        engine = importlib.import_module("engine")
    return engine, database


def _init_parent_rag_db(database_module) -> None:
    """Initialize parent vector DB from parent backend data directory."""
    # parent backend already knows its default data dir from its own database.py
    if getattr(database_module, "text_db", None) is None:
        with _cwd(_parent_backend_dir()):
            database_module.init_dbs()


def _build_evidence_context(evidence: Optional[str], case_type: Optional[str]) -> Optional[dict]:
    if not evidence and not case_type:
        return None

    # Keep schema compatible with parent engine._fuse_query_with_evidence
    return {
        "evidence_context": {
            "evidence_summary": evidence or "",
            "entities": {},
            "timeline": [],
            "evidence_types": [case_type] if case_type else [],
            "relevance_score": 0.0,
            "evidence_strength": 0.0,
            "quality_flags": [],
        }
    }


def _load_evidence_json(path: Optional[str]) -> Optional[dict]:
    if not path:
        return None
    file_path = Path(path)
    if not file_path.exists() or not file_path.is_file():
        return None
    try:
        payload = json.loads(file_path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            return payload
    except Exception:
        return None
    return None


def _merge_evidence_context(
    base_context: Optional[dict],
    analyzer_payload: Optional[dict],
) -> Optional[dict]:
    if not analyzer_payload:
        return base_context

    extracted = analyzer_payload.get("evidence_context", {}) if isinstance(analyzer_payload, dict) else {}
    if not extracted:
        return base_context

    if not base_context:
        return {"evidence_context": extracted}

    merged = dict(base_context.get("evidence_context", {}))
    for key, value in extracted.items():
        if value not in (None, "", [], {}):
            merged[key] = value
    return {"evidence_context": merged}


def _truncate_references(references: List[dict], top_k: int) -> List[dict]:
    if not references:
        return []
    return references[: max(1, top_k)]


def _estimate_strength(references: List[dict]) -> float:
    """
    Lightweight strength score from retrieval confidence.
    Returns 0-100.
    """
    if not references:
        return 0.0
    scores = [float(r.get("score", 0.0)) for r in references if isinstance(r.get("score", 0.0), (int, float))]
    if not scores:
        return 35.0

    # FlashRank scores are usually in [0,1], but clamp safely.
    avg = sum(scores) / len(scores)
    avg = max(0.0, min(1.0, avg))
    # Blend with a small floor so low-signal cases still produce usable guidance.
    return round((avg * 85.0) + 10.0, 1)


def _squash_score(raw: float, gain: float = 2500.0) -> float:
    """Convert tiny reranker scores to 0..1 with a smooth logistic curve."""
    raw = max(0.0, float(raw))
    return 1.0 - math.exp(-raw * gain)


def _compute_legal_meter(
    references: List[dict],
    query: str,
    case_type: Optional[str],
    evidence_context: Optional[dict],
) -> Dict[str, Any]:
    """
    Implements documented formula:

    score = 0.3 * evidence_strength
          + 0.25 * law_match
          + 0.2 * documentation
          + 0.15 * timeline_validity
          + 0.1 * case_similarity

    All sub-scores are normalized to 0..1.
    Final user_strength/opponent_strength are percentages summing to 100.
    """
    ev = (evidence_context or {}).get("evidence_context", {}) if evidence_context else {}

    # 1) evidence_strength from analyzer, fallback by reference availability.
    evidence_strength = ev.get("evidence_strength")
    if isinstance(evidence_strength, (int, float)):
        evidence_strength = max(0.0, min(1.0, float(evidence_strength)))
    else:
        evidence_strength = 0.25 if references else 0.1

    # 2) law_match from retrieval relevance (squashed reranker signal + coverage).
    scores = [float(r.get("score", 0.0)) for r in references if isinstance(r.get("score", 0.0), (int, float))]
    if scores:
        avg_score = sum(scores) / len(scores)
        score_signal = _squash_score(avg_score)
        coverage_signal = min(1.0, len(references) / 5.0)
        law_match = max(0.0, min(1.0, 0.7 * score_signal + 0.3 * coverage_signal))
    else:
        law_match = 0.0

    # 3) documentation quality from entities and quality flags.
    entities = ev.get("entities", {}) if isinstance(ev.get("entities"), dict) else {}
    quality_flags = ev.get("quality_flags", []) if isinstance(ev.get("quality_flags"), list) else []
    entity_count = 0
    for value in entities.values():
        if isinstance(value, list):
            entity_count += len(value)

    doc_base = min(1.0, entity_count / 12.0)
    penalty = 0.0
    if "too_short" in quality_flags:
        penalty += 0.2
    if "low_context" in quality_flags:
        penalty += 0.2
    if "extractor_warning" in quality_flags:
        penalty += 0.15
    documentation = max(0.0, min(1.0, doc_base - penalty))

    # 4) timeline_validity from timeline extraction quality.
    timeline = ev.get("timeline", []) if isinstance(ev.get("timeline"), list) else []
    if timeline:
        valid_dates = 0
        for item in timeline:
            if isinstance(item, dict) and item.get("date") and item.get("event"):
                valid_dates += 1
        ratio = valid_dates / len(timeline)
        timeline_validity = max(0.0, min(1.0, 0.5 * ratio + 0.5 * min(1.0, len(timeline) / 4.0)))
    else:
        timeline_validity = 0.25

    # 5) case_similarity from case type overlap in query/evidence types.
    case_similarity = 0.4
    evidence_types = ev.get("evidence_types", []) if isinstance(ev.get("evidence_types"), list) else []
    if case_type:
        ct = case_type.lower().strip()
        q = query.lower()
        if ct in q:
            case_similarity += 0.3
        if any(ct in str(t).lower() for t in evidence_types):
            case_similarity += 0.3
    case_similarity = max(0.0, min(1.0, case_similarity))

    meter_score = (
        0.3 * evidence_strength
        + 0.25 * law_match
        + 0.2 * documentation
        + 0.15 * timeline_validity
        + 0.1 * case_similarity
    )

    user_strength = round(max(0.0, min(100.0, meter_score * 100.0)), 1)
    opponent_strength = round(100.0 - user_strength, 1)

    return {
        "formula": {
            "expression": "0.3*evidence_strength + 0.25*law_match + 0.2*documentation + 0.15*timeline_validity + 0.1*case_similarity",
            "weights": {
                "evidence_strength": 0.30,
                "law_match": 0.25,
                "documentation": 0.20,
                "timeline_validity": 0.15,
                "case_similarity": 0.10,
            },
        },
        "components": {
            "evidence_strength": round(evidence_strength, 3),
            "law_match": round(law_match, 3),
            "documentation": round(documentation, 3),
            "timeline_validity": round(timeline_validity, 3),
            "case_similarity": round(case_similarity, 3),
        },
        "score": round(meter_score, 3),
        "user_strength_pct": user_strength,
        "opponent_strength_pct": opponent_strength,
    }


def _build_context_block(references: List[dict]) -> str:
    if not references:
        return "No legal chunks were retrieved."

    lines = []
    for i, ref in enumerate(references, start=1):
        source = ref.get("source", "Unknown")
        page = ref.get("page", "?")
        score = ref.get("score", 0)
        content = (ref.get("content", "") or "").strip()
        lines.append(
            f"[{i}] Source: {source}, Page: {page}, Score: {score}\n"
            f"Content: {content}"
        )
    return "\n\n".join(lines)


def _llm_generate_response(
    query: str,
    case_type: Optional[str],
    evidence: Optional[str],
    references: List[dict],
    strength: float,
) -> str:
    """
    Generate Themis response in English.
    Uses Gemini when API key is available, otherwise falls back to rule-based output.
    """
    context_block = _build_context_block(references)

    prompt = f"""
You are Themis, an AI legal decision-support assistant for India.

Constraints:
- Use only the provided retrieval context.
- Do NOT fabricate sections/laws if not present in context.
- Keep language simple and practical.
- This is informational guidance, not legal advice.

User Query: {query}
Case Type: {case_type or 'Unknown'}
Evidence Summary: {evidence or 'Not provided'}
Estimated Strength Score: {strength}%

Retrieved Legal Context:
{context_block}

Return a structured response with these sections exactly:
1. Case Analysis
2. Relevant Law
3. Evidence Summary
4. Recommended Next Steps
5. Peaceful Resolution Options
6. Disclaimer
""".strip()

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            model = os.getenv("THEMIS_MODEL", "gemini-2.0-flash")
            resp = client.models.generate_content(model=model, contents=prompt)
            text = getattr(resp, "text", None)
            if text and text.strip():
                return text.strip()
        except Exception:
            pass

    # Fallback template response when LLM is unavailable.
    if references:
        ref_sources = ", ".join(
            f"{r.get('source', 'Unknown')} p.{r.get('page', '?')}" for r in references[:3]
        )
        law_line = f"Based on retrieved materials: {ref_sources}."
    else:
        law_line = "No matching legal documents were retrieved from the current index."

    return (
        "1. Case Analysis\n"
        f"- Query: {query}\n"
        f"- Case type: {case_type or 'Unknown'}\n"
        f"- Estimated legal strength: {strength}%\n\n"
        "2. Relevant Law\n"
        f"- {law_line}\n\n"
        "3. Evidence Summary\n"
        f"- {evidence or 'No evidence summary was provided.'}\n\n"
        "4. Recommended Next Steps\n"
        "- Organize all documents chronologically.\n"
        "- Preserve payment records, communication, and identity documents.\n"
        "- Send a written notice before escalation.\n"
        "- Approach district legal aid if no response.\n\n"
        "5. Peaceful Resolution Options\n"
        "- Attempt written mediation with a deadline.\n"
        "- Offer settlement terms in writing and keep acknowledgement.\n\n"
        "6. Disclaimer\n"
        "- This is informational support and not a substitute for a licensed lawyer."
    )


def generate_themis_response(req: ThemisRequest) -> Dict[str, Any]:
    engine, database = _load_parent_rag_modules()
    _init_parent_rag_db(database)

    evidence_context = _build_evidence_context(req.evidence, req.case_type)
    analyzer_payload = _load_evidence_json(req.evidence_json)
    evidence_context = _merge_evidence_context(evidence_context, analyzer_payload)

    with _cwd(_parent_backend_dir()):
        rag_payload = engine.chatbot(
            req.query,
            evidence_context=evidence_context,
            pro_mode=req.pro_mode,
        )

    references = _truncate_references(rag_payload.get("references", []), req.top_k)
    strength = _estimate_strength(references)
    legal_meter = _compute_legal_meter(
        references=references,
        query=req.query,
        case_type=req.case_type,
        evidence_context=evidence_context,
    )

    themis_english = _llm_generate_response(
        query=req.query,
        case_type=req.case_type,
        evidence=req.evidence,
        references=references,
        strength=strength,
    )

    final_response = translate_response(themis_english, req.lang)

    return {
        "input": {
            "query": req.query,
            "language": req.lang,
            "case_type": req.case_type,
            "evidence": req.evidence,
            "evidence_json": req.evidence_json,
            "pro_mode": req.pro_mode,
        },
        "retrieval": {
            "mode": rag_payload.get("mode"),
            "retrieval_query": rag_payload.get("retrieval_query", req.query),
            "references": references,
            "source_index": rag_payload.get("source_index", []),
        },
        "confidence": {
            "estimated_strength": strength,
            "legal_meter": legal_meter,
        },
        "response": {
            "english": themis_english,
            "final": final_response,
            "final_language": "hi" if req.lang == "hi" else "en",
        },
    }


def parse_args() -> ThemisRequest:
    parser = argparse.ArgumentParser(description="Themis response generation engine")
    parser.add_argument("--query", required=True, help="User query text for legal reasoning")
    parser.add_argument("--lang", default="en", choices=["hi", "en"], help="Original user language")
    parser.add_argument("--case-type", default=None, help="Optional case category")
    parser.add_argument("--evidence", default=None, help="Optional evidence summary text")
    parser.add_argument(
        "--evidence-json",
        default=None,
        help="Optional path to analyzer JSON output containing evidence_context",
    )
    parser.add_argument("--top-k", type=int, default=5, help="Max retrieved references to use")
    parser.add_argument(
        "--fast",
        action="store_true",
        help="Run in fast mode (no evidence fusion in retrieval)",
    )

    args = parser.parse_args()
    return ThemisRequest(
        query=args.query,
        lang=args.lang,
        case_type=args.case_type,
        evidence=args.evidence,
        evidence_json=args.evidence_json,
        top_k=args.top_k,
        pro_mode=not args.fast,
    )


def main() -> None:
    req = parse_args()
    result = generate_themis_response(req)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
