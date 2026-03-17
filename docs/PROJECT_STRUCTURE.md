# Project Structure (Professional Layout)

## Current Organized Layout

```text
Nayay/
  backend/
    app/
      api/
      core/
      evidence/
        basic_analyzer.py
        vision_analyzer.py
      orchestration/
        pipeline.py
      rag/
      reasoning/
      schemas/
      services/
        translate_response.py
      utils/
      voice/
        stt.py
    docs/
      BACKEND_SYSTEM_DOCUMENTATION.md
    reasoning/
      themis_response_engine.py
    pipeline_orchestrator.py        # compatibility wrapper
    api.py
    engine.py
    database.py
    config.py
    watcher.py
    processors.py
  frontend/
    src/
    public/
    package.json
  data/
    raw_evidence/
    outputs/
  docs/
    PROJECT_STRUCTURE.md
  voice.py                           # compatibility wrapper
  translate_response.py              # compatibility wrapper
  gemini_vision_evidence_analyzer.py # compatibility wrapper
  legal_ai_system_design_summary.md
  req.txt
```

## Design Principles
- Keep implementation under `backend/app/*` by domain.
- Keep backward compatibility wrappers at old paths during transition.
- Store runtime artifacts in `data/outputs/*`.
- Store evidence inputs in `data/raw_evidence/*`.
- Keep backend docs under `backend/docs/*` and project docs under `docs/*`.

## Migration Notes
- New code should be added in `backend/app/*`.
- Existing scripts calling old entry points will continue to work.
- Once frontend/backend references are updated, wrappers can be removed.
