"""Unified backend pipeline orchestration service."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, Optional


ROOT = Path(__file__).resolve().parents[3]


def _dynamic_import(module_path: Path, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, str(module_path))
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to import module from {module_path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod


def _ensure_dirs() -> Path:
    out_dir = ROOT / "data" / "outputs" / "pipeline"
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir


def _detect_hindi_text(text: str) -> bool:
    if not text:
        return False

    letters = [ch for ch in text if ch.isalpha()]
    if not letters:
        return False

    dev_count = sum(1 for ch in letters if 0x0900 <= ord(ch) <= 0x097F)
    if (dev_count / len(letters)) >= 0.2:
        return True

    markers = {
        "hai", "nahi", "kyu", "kya", "mera", "meri", "mere", "tum", "aap",
        "ka", "ki", "ke", "se", "mein", "main", "ghar", "haan", "nhi", "raha",
    }
    words = re.findall(r"[a-zA-Z]+", text.lower())
    hits = sum(1 for w in words if w in markers)
    return hits >= 2


def _translate_hi_to_en(text: str) -> str:
    if not text:
        return text
    try:
        from deep_translator import GoogleTranslator

        out = GoogleTranslator(source="hi", target="en").translate(text)
        if out:
            return out.strip()
    except Exception:
        pass
    return text


def _process_input(input_mode: str, text: Optional[str]) -> Dict[str, str]:
    if input_mode == "voice":
        voice_mod = _dynamic_import(ROOT / "backend" / "app" / "voice" / "stt.py", "voice_module")
        stt = voice_mod.VoiceSTT()
        result = stt.transcribe_once()
        return {
            "original_text": result.text,
            "language": result.language,
            "english_text": result.english_text,
        }

    if not text:
        raise ValueError("--text is required when --input-mode text")

    is_hi = _detect_hindi_text(text)
    lang = "hi" if is_hi else "en"
    english_text = _translate_hi_to_en(text) if is_hi else text
    return {
        "original_text": text,
        "language": lang,
        "english_text": english_text,
    }


def _scan_evidence(evidence_file: Optional[str], output_dir: Path) -> Dict[str, Any]:
    if not evidence_file:
        return {"used": False, "summary": None, "json_path": None, "raw": None}

    evidence_path = Path(evidence_file)
    if not evidence_path.exists() or not evidence_path.is_file():
        raise FileNotFoundError(f"Evidence file not found: {evidence_path}")

    ext = evidence_path.suffix.lower()
    image_exts = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".heic", ".heif"}

    if ext in image_exts:
        ev_mod = _dynamic_import(
            ROOT / "backend" / "app" / "evidence" / "vision_analyzer.py",
            "gv_evidence",
        )
        model = getattr(ev_mod, "DEFAULT_MODEL", "gemini-flash-latest")
        output = ev_mod.analyze_image_with_gemini(evidence_path, model, "")
        out_path = ev_mod.save_output(output, output_dir)
    else:
        ev_mod = _dynamic_import(
            ROOT / "backend" / "app" / "evidence" / "basic_analyzer.py",
            "evidence_basic",
        )
        analyzer = ev_mod.EvidenceAnalyzer(ev_mod.AnalyzerConfig(output_dir=str(output_dir)))
        output = analyzer.analyze_file(str(evidence_path))
        out_path = output_dir / f"{output.get('evidence_id', 'ev-unknown')}.json"
        out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = (output.get("evidence_context") or {}).get("evidence_summary")
    return {"used": True, "summary": summary, "json_path": str(out_path), "raw": output}


def run_pipeline(
    input_mode: str,
    text: Optional[str],
    evidence_file: Optional[str],
    case_type: Optional[str],
    top_k: int,
    fast_mode: bool,
) -> Dict[str, Any]:
    output_dir = _ensure_dirs()
    query_bundle = _process_input(input_mode=input_mode, text=text)
    evidence_bundle = _scan_evidence(evidence_file=evidence_file, output_dir=output_dir)

    themis_mod = _dynamic_import(ROOT / "backend" / "reasoning" / "themis_response_engine.py", "themis_engine")
    req = themis_mod.ThemisRequest(
        query=query_bundle["english_text"],
        lang=query_bundle["language"],
        case_type=case_type,
        evidence=evidence_bundle["summary"],
        evidence_json=evidence_bundle["json_path"],
        top_k=top_k,
        pro_mode=not fast_mode,
    )
    themis_out = themis_mod.generate_themis_response(req)

    frontend_payload = {
        "display_language": themis_out["response"]["final_language"],
        "display_text": themis_out["response"]["final"],
        "original_input": query_bundle["original_text"],
        "original_language": query_bundle["language"],
        "backend_query_english": query_bundle["english_text"],
        "legal_meter": themis_out["confidence"].get("legal_meter"),
        "references": themis_out["retrieval"].get("source_index", []),
    }

    return {
        "pipeline": {
            "input_mode": input_mode,
            "stages": ["input", "evidence_scanner", "query_merger", "rag_themis", "frontend_payload"],
        },
        "query": query_bundle,
        "evidence": {
            "used": evidence_bundle["used"],
            "summary": evidence_bundle["summary"],
            "json_path": evidence_bundle["json_path"],
        },
        "themis": themis_out,
        "frontend": frontend_payload,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Nayay unified pipeline orchestrator")
    parser.add_argument("--input-mode", choices=["voice", "text"], default="text")
    parser.add_argument("--text", default=None, help="User text input when input-mode=text")
    parser.add_argument("--evidence-file", default=None, help="Optional evidence file path")
    parser.add_argument("--case-type", default=None, help="Optional case category")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--fast", action="store_true", help="Fast mode (skip pro retrieval fusion)")
    args = parser.parse_args()

    result = run_pipeline(
        input_mode=args.input_mode,
        text=args.text,
        evidence_file=args.evidence_file,
        case_type=args.case_type,
        top_k=args.top_k,
        fast_mode=args.fast,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
