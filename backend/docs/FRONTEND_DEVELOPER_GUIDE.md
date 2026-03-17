# Frontend Integration Guide for Nayay Backend

## 1. Purpose
This guide explains how the backend works from a frontend developer perspective.
Use this to design screens, API contracts, state handling, and user flows.

## 2. What the Backend Produces
The backend pipeline returns a structured JSON object with these major sections:
- pipeline: execution metadata and stage list
- query: input text and detected language details
- evidence: evidence scan usage and summary output
- themis: retrieval, confidence, and generated legal reasoning
- frontend: frontend-ready fields for direct UI rendering

Primary frontend contract is the frontend object.

## 3. Pipeline in UI Terms
Input Sources:
- Voice input (Hindi/English)
- Text input (Hindi/English)
- Optional evidence file upload

Backend Stages:
1. Input processing
2. Evidence scanning (if file provided)
3. Query merge (original language + English processing text)
4. RAG retrieval + Themis response generation
5. Frontend payload assembly

Output:
- Display text in user language
- Legal meter and confidence breakdown
- Retrieval references for transparency

## 4. Key Files (for understanding behavior)
- backend/pipeline_orchestrator.py (entry wrapper)
- backend/app/orchestration/pipeline.py (main pipeline logic)
- backend/reasoning/themis_response_engine.py (Themis + legal meter + retrieval glue)
- voice.py (compat wrapper)
- backend/app/voice/stt.py (voice transcription and language detection)
- gemini_vision_evidence_analyzer.py (compat wrapper)
- backend/app/evidence/vision_analyzer.py (image evidence scanner)
- backend/app/evidence/basic_analyzer.py (non-image evidence scanner)

## 5. Frontend-Ready Payload Contract
Use these fields from response.frontend:

- display_language: "hi" | "en"
- display_text: final response text in display language
- original_input: original user query text
- original_language: original user language
- backend_query_english: normalized English query used for retrieval
- legal_meter: object with formula, components, and percentages
- references: list of source/page references

Example shape:

```json
{
  "frontend": {
    "display_language": "hi",
    "display_text": "...",
    "original_input": "...",
    "original_language": "hi",
    "backend_query_english": "...",
    "legal_meter": {
      "formula": {
        "expression": "0.3*evidence_strength + 0.25*law_match + 0.2*documentation + 0.15*timeline_validity + 0.1*case_similarity",
        "weights": {
          "evidence_strength": 0.3,
          "law_match": 0.25,
          "documentation": 0.2,
          "timeline_validity": 0.15,
          "case_similarity": 0.1
        }
      },
      "components": {
        "evidence_strength": 0.0,
        "law_match": 0.269,
        "documentation": 0.0,
        "timeline_validity": 0.25,
        "case_similarity": 0.7
      },
      "score": 0.175,
      "user_strength_pct": 17.5,
      "opponent_strength_pct": 82.5
    },
    "references": [
      {"source": "...pdf", "page": 4}
    ]
  }
}
```

## 6. Recommended Frontend Screens
### A. Query Intake Screen
Inputs:
- mode selector: voice | text
- text input box
- optional evidence upload
- optional case type selector

Actions:
- Submit query
- Record voice (if voice mode)

### B. Processing Screen
Show step progress:
- Processing input
- Scanning evidence
- Retrieving legal references
- Generating legal response

### C. Results Screen
Sections:
1. Final Answer (display_text)
2. Legal Meter
3. Evidence Summary
4. Retrieved References
5. Debug/Advanced panel (optional)

## 7. Legal Meter UI Guidance
From frontend.legal_meter:
- user_strength_pct: main progress bar value
- opponent_strength_pct: contrasting value
- components: radar chart or stacked indicators

Suggested visual:
- Main meter: large percentage ring for user strength
- Secondary meter: opponent strength
- Component chips:
  - evidence_strength
  - law_match
  - documentation
  - timeline_validity
  - case_similarity

## 8. References UI Guidance
Use frontend.references to render citation cards:
- Source file label
- Page number
- Click/expand to show related chunk from themis.retrieval.references if needed

## 9. Error and Empty States
### No evidence file
- evidence.used = false
- Hide evidence panel or show "No evidence provided"

### Weak retrieval
- legal_meter score low
- Show CTA: "Add more documents or details"

### Backend generation fallback
- Themis may use template fallback if LLM is unavailable
- Still show output normally; optionally tag as "fallback response"

## 10. Language Behavior (important)
- User can input Hindi or English.
- Backend normalizes processing query to English for retrieval.
- Final response is returned in original user language when possible.

Frontend should always trust:
- display_language
- display_text

## 11. Suggested Frontend State Model
Minimal state shape:

```ts
type PipelineState = {
  loading: boolean;
  stage: "idle" | "input" | "evidence" | "retrieval" | "reasoning" | "done" | "error";
  error?: string;
  data?: BackendPipelineResponse;
};
```

## 12. API/Execution Notes
Current backend is callable via python orchestration entrypoint.
Recommended next backend step is exposing a single HTTP endpoint (for example /pipeline/run).
Until then, use your existing backend transport layer and map its returned JSON to this guide.

## 13. Frontend Implementation Checklist
- Build input mode toggle (text/voice)
- Add evidence upload input
- Add loading stage timeline
- Render frontend.display_text prominently
- Render legal meter and components
- Render references with page/source
- Handle empty evidence and low-confidence UX
- Preserve conversation history client-side

## 14. Quick Mapping Table
- Main answer text: frontend.display_text
- Answer language badge: frontend.display_language
- Meter primary: frontend.legal_meter.user_strength_pct
- Meter secondary: frontend.legal_meter.opponent_strength_pct
- Meter factors: frontend.legal_meter.components
- Citation list: frontend.references
- Original user query: frontend.original_input
- Debug English query: frontend.backend_query_english
