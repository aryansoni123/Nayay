import json
import os
import re
from flashrank import Ranker, RerankRequest
from langchain_google_genai import ChatGoogleGenerativeAI
import database
from config import API_KEY

# Retrieval reranker for legal chunks.
ranker = Ranker(model_name="ms-marco-TinyBERT-L-2-v2", cache_dir="opt_models")

# Themis reasoning LLM (Gemini 2.0 Flash).
_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=API_KEY,
            temperature=0.2,
        )
    return _llm


# ---------------------------------------------------------------------------
# Retrieval helpers
# ---------------------------------------------------------------------------

def rerank_results(query: str, retrieved_docs: list, top_n: int = 7):
    """Reranks retrieved documents and returns top documents with scores."""
    if not retrieved_docs:
        return [], []

    passages = [
        {"id": i, "text": doc.page_content, "meta": doc.metadata}
        for i, doc in enumerate(retrieved_docs)
    ]
    results = ranker.rerank(RerankRequest(query=query, passages=passages))

    reranked_docs, scores = [], []
    for res in results[:top_n]:
        orig = next((d for d in retrieved_docs if d.page_content == res["text"]), None)
        if orig:
            reranked_docs.append(orig)
            scores.append(float(res["score"]))

    return reranked_docs, scores


def _build_reference_entry(doc, score: float) -> dict:
    metadata = doc.metadata or {}
    return {
        "score": score,
        "source": metadata.get("source", "Unknown"),
        "page": metadata.get("page", metadata.get("page_number")),
        "chunk": metadata.get("chunk"),
        "content": doc.page_content,
        "metadata": metadata,
    }


def _fuse_query_with_evidence(query: str, evidence_context: dict | None, pro_mode: bool) -> str:
    """Builds retrieval query with optional evidence context in pro mode."""
    if not pro_mode or not evidence_context:
        return query

    ev_ctx = evidence_context.get("evidence_context", {})
    evidence_summary = ev_ctx.get("evidence_summary", "")
    entities = ev_ctx.get("entities", {})
    evidence_types = ev_ctx.get("evidence_types", [])

    return (
        f"{query}\n"
        f"Evidence Summary: {evidence_summary}\n"
        f"Evidence Types: {json.dumps(evidence_types, ensure_ascii=False)}\n"
        f"Entities: {json.dumps(entities, ensure_ascii=False)}"
    )


def _compute_document_usage(references: list) -> list:
    """
    Computes the percentage contribution of each source document based on
    the sum of reranker scores attributed to it across all retrieved chunks.

    Returns a list sorted by usage descending:
      [{"source": "...", "usage_pct": 72.4, "chunks_used": 3}, ...]
    """
    if not references:
        return []

    source_scores: dict[str, float] = {}
    source_chunks: dict[str, int] = {}

    for ref in references:
        src = os.path.basename(ref.get("source", "Unknown"))
        score = ref.get("score", 0.0)
        source_scores[src] = source_scores.get(src, 0.0) + score
        source_chunks[src] = source_chunks.get(src, 0) + 1

    total = sum(source_scores.values()) or 1.0
    usage = [
        {
            "source": src,
            "usage_pct": round((s / total) * 100, 1),
            "chunks_used": source_chunks[src],
        }
        for src, s in source_scores.items()
    ]
    usage.sort(key=lambda x: x["usage_pct"], reverse=True)
    return usage


# ---------------------------------------------------------------------------
# Themis reasoning engine
# ---------------------------------------------------------------------------

_THEMIS_PROMPT = """\
You are Themis, an AI legal reasoning assistant for Indian law.

You have been given a user's legal query and the most relevant retrieved law excerpts.
Your task is to reason over these excerpts and produce a structured JSON legal analysis.

USER QUERY:
{query}

EVIDENCE CONTEXT (if any):
{evidence_context}

RETRIEVED LAW EXCERPTS (ranked by relevance):
{law_context}

Respond ONLY with a valid JSON object — no markdown fences, no extra text — with exactly these keys:

{{
  "case_analysis": "...",
  "relevant_law": [
    {{
      "section": "...",
      "description": "...",
      "source": "..."
    }}
  ],
  "evidence_summary": "...",
  "next_legal_steps": ["...", "..."],
  "settlement_suggestions": ["...", "..."],
  "confidence": {{
    "user_strength_pct": 0,
    "opponent_strength_pct": 0,
    "reasoning": "..."
  }}
}}

Rules:
- Base ALL conclusions strictly on the retrieved law excerpts provided.
- Do NOT invent sections or acts not present in the excerpts.
- "case_analysis": 2-4 sentence overview of the legal situation.
- "relevant_law": list every applicable section found in the excerpts.
- "evidence_summary": summarise what the evidence (if any) shows legally.
- "next_legal_steps": concrete actionable steps the user should take.
- "settlement_suggestions": peaceful resolution options before litigation.
- "confidence.user_strength_pct" + "confidence.opponent_strength_pct" must sum to 100.
- Estimate confidence from: evidence strength, law clarity, documentation quality.
"""


def _build_law_context(references: list) -> str:
    parts = []
    for i, ref in enumerate(references, 1):
        src = os.path.basename(ref.get("source", "Unknown"))
        page = ref.get("page", "?")
        score = ref.get("score", 0.0)
        content = ref.get("content", "")
        parts.append(f"[{i}] Source: {src} | Page: {page} | Score: {score:.3f}\n{content}")
    return "\n\n".join(parts)


def _run_themis(query: str, references: list, evidence_context: dict | None) -> dict:
    """Calls Gemini to produce Themis structured reasoning."""
    law_context = _build_law_context(references)
    ev_str = json.dumps(evidence_context, ensure_ascii=False, indent=2) if evidence_context else "None"

    prompt = _THEMIS_PROMPT.format(
        query=query,
        evidence_context=ev_str,
        law_context=law_context,
    )

    try:
        llm = _get_llm()
        response = llm.invoke(prompt)
        raw = response.content.strip()

        # Strip markdown code fences if model adds them despite instructions.
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        reasoning = json.loads(raw)
    except json.JSONDecodeError:
        reasoning = {"error": "PARSE_ERROR", "raw_response": raw}
    except Exception as e:
        reasoning = {"error": str(e)}

    return reasoning


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def chatbot(query: str, evidence_context: dict = None, pro_mode: bool = False) -> dict:
    """
    Legal RAG + Themis reasoning.

    Fast mode  : retrieval only — no LLM call, instant response.
    Pro mode   : retrieval + Themis reasoning (Gemini) + confidence scoring.

    Returns:
      {
        mode, retrieval_query,
        references,           # ranked law chunks
        source_index,         # unique pages cited
        document_usage,       # [{source, usage_pct, chunks_used}] for frontend
        reasoning             # Themis output (pro mode only, else null)
      }
    """
    if database.text_db is None:
        return {
            "error": "DB_EMPTY",
            "mode": "pro" if pro_mode else "fast",
            "retrieval_query": query,
            "references": [],
            "document_usage": [],
            "reasoning": None,
        }

    retrieval_query = _fuse_query_with_evidence(query, evidence_context, pro_mode)

    # Broad candidate fetch from legal vector DB.
    candidates = database.text_db.similarity_search(retrieval_query, k=25)

    # Re-rank and keep strongest legal chunks.
    reranked_docs, scores = rerank_results(retrieval_query, candidates, top_n=7)
    references = [_build_reference_entry(doc, score) for doc, score in zip(reranked_docs, scores)]

    # Per-document usage percentages for frontend display.
    document_usage = _compute_document_usage(references)

    # Unique source list for quick grounding.
    unique_sources = []
    seen: set = set()
    for ref in references:
        key = (ref.get("source"), ref.get("page"))
        if key in seen:
            continue
        seen.add(key)
        unique_sources.append({"source": ref.get("source"), "page": ref.get("page")})

    # Themis reasoning — only in pro mode.
    reasoning = None
    if pro_mode:
        reasoning = _run_themis(query, references, evidence_context)

    return {
        "mode": "pro" if pro_mode else "fast",
        "retrieval_query": retrieval_query,
        "references": references,
        "source_index": unique_sources,
        "document_usage": document_usage,
        "reasoning": reasoning,
    }
