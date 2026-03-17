# Nayay Backend Documentation

## 1) Purpose
The backend provides an end-to-end legal assistance pipeline:
- accepts voice or text queries in Hindi/English,
- analyzes optional evidence files,
- retrieves legal context using RAG,
- generates Themis legal guidance,
- computes a formula-based legal meter,
- returns frontend-ready bilingual output.

## 2) High-Level Pipeline
Input -> Evidence Scanner -> Query Merger -> RAG Retrieval -> Themis Reasoning -> Frontend Payload

Detailed flow:
1. Input
- Voice: `voice.py` (Faster-Whisper)
- Text: direct user input

2. Language-aware Query Builder
- Keeps original language (`hi`/`en`)
- Produces `english_text` for backend retrieval/LLM processing

3. Evidence Scanner (optional)
- Image evidence: `gemini_vision_evidence_analyzer.py` (currently Ollama OCR path)
- Other files: `Useless/evidence_analyzer.py`

4. RAG Retrieval
- Parent backend integration from `Praytna 3.0/backend/engine.py`
- Returns ranked references and source index

5. Themis Response Engine
- `backend/reasoning/themis_response_engine.py`
- Produces structured legal response
- Converts final output to Hindi when original language is Hindi

6. Confidence + Legal Meter
- Uses documented formula:
  `score = 0.3*evidence_strength + 0.25*law_match + 0.2*documentation + 0.15*timeline_validity + 0.1*case_similarity`
- Returns `user_strength_pct` and `opponent_strength_pct`

## 3) Professional Project Structure
Current backend has been organized into an application package while preserving old entrypoints.

```text
backend/
  app/
    api/
    core/
    evidence/
    orchestration/
      pipeline.py
    rag/
    reasoning/
    schemas/
    services/
    utils/
    voice/
  docs/
    BACKEND_SYSTEM_DOCUMENTATION.md
  reasoning/
    themis_response_engine.py
  pipeline_orchestrator.py   # compatibility wrapper
```

Notes:
- New logic lives under `backend/app/...`.
- Existing command compatibility is preserved via wrapper scripts.

## 4) Main Modules
### 4.1 `voice.py`
Responsibility:
- One-shot speech capture from microphone.
- Auto language detection (`hi`/`en`).
- Returns:
  - `text` (original language transcript)
  - `english_text` (backend processing text)
  - `language` (original language marker)

### 4.2 `gemini_vision_evidence_analyzer.py`
Responsibility:
- Scans image evidence and returns structured evidence context.
- Saves analyzer output JSON to `outputs/...`.

Output includes:
- `evidence_summary`
- `entities`
- `timeline`
- `evidence_types`
- `relevance_score`
- `evidence_strength`
- `quality_flags`

### 4.3 `backend/reasoning/themis_response_engine.py`
Responsibility:
- Integrates parent RAG retrieval.
- Generates Themis response from retrieved references.
- Applies legal meter formula.
- Returns localized final response based on original language.

### 4.4 `backend/app/orchestration/pipeline.py`
Responsibility:
- End-to-end orchestrator stitching all modules.
- Builds final frontend payload and stage-wise outputs.

## 5) Interfaces and Contracts
### 5.1 Pipeline Input (CLI)
- `--input-mode` (`voice` or `text`)
- `--text` (required when input mode is text)
- `--evidence-file` (optional)
- `--case-type` (optional)
- `--top-k` (retrieval depth)
- `--fast` (optional fast mode)

### 5.2 Themis Request
- `query` (English processing query)
- `lang` (`hi`/`en`, original)
- `case_type` (optional)
- `evidence` (optional summary)
- `evidence_json` (optional analyzer JSON path)
- `top_k`
- `pro_mode`

### 5.3 Frontend Payload
- `display_language`
- `display_text`
- `original_input`
- `original_language`
- `backend_query_english`
- `legal_meter`
- `references`

## 6) Run Commands
### 6.1 Unified Pipeline (text)
```bash
python backend/pipeline_orchestrator.py --input-mode text --text "landlord not returning security deposit" --case-type "rental dispute" --top-k 3
```

### 6.2 Unified Pipeline (voice)
```bash
python backend/pipeline_orchestrator.py --input-mode voice --case-type "rental dispute" --top-k 3
```

### 6.3 Unified Pipeline with evidence file
```bash
python backend/pipeline_orchestrator.py --input-mode text --text "..." --evidence-file "Evidence Data/1.jpeg" --case-type "rental dispute" --top-k 3
```

### 6.4 Themis Engine directly
```bash
python backend/reasoning/themis_response_engine.py --query "landlord not returning security deposit" --lang hi --case-type "rental dispute" --evidence "agreement and payment proof available" --top-k 3
```

## 7) Reliability and Fallbacks
- If Gemini call fails in Themis generation, fallback structured response template is returned.
- If evidence scanner fails, pipeline continues with query-only mode.
- If language translation fails, original English response is returned.

## 8) Recommended Next Refactor (Phase 2)
1. Move `reasoning/themis_response_engine.py` into `app/reasoning/` with compatibility wrapper.
2. Move scanner implementations into `app/evidence/scanners/`.
3. Add FastAPI endpoint to expose a single `/pipeline/run` route.
4. Introduce Pydantic request/response schemas under `app/schemas/`.
5. Add structured logging and tracing IDs per request.
