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
            "evidence_types": [case_type] if case_type else [],
        }
    }


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

    with _cwd(_parent_backend_dir()):
        rag_payload = engine.chatbot(
            req.query,
            evidence_context=evidence_context,
            pro_mode=req.pro_mode,
        )

    references = _truncate_references(rag_payload.get("references", []), req.top_k)
    strength = _estimate_strength(references)

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
        top_k=args.top_k,
        pro_mode=not args.fast,
    )


def main() -> None:
    req = parse_args()
    result = generate_themis_response(req)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
