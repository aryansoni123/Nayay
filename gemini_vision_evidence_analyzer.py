from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
from ollama import chat
from typing import Dict, List, Optional


try:
    from google import genai
    from google.genai import types
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "google-genai is not installed. Run: pip install google-genai"
    ) from exc

GEMINI_API = "AIzaSyCRIjGYNUfzHb-we0wonAeePSlRRyQ9Om4"
DEFAULT_MODEL = "gemini-flash-latest"


def _read_image_as_part(image_path: Path) -> types.Part:
    ext = image_path.suffix.lower()
    mime_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".heic": "image/heic",
        ".heif": "image/heif",
        ".bmp": "image/bmp",
    }
    mime_type = mime_map.get(ext, "image/jpeg")
    return types.Part.from_bytes(data=image_path.read_bytes(), mime_type=mime_type)


def _clean_json_text(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text).strip()
        text = re.sub(r"```$", "", text).strip()
    return text


def _safe_parse_json(raw: str) -> Dict:
    cleaned = _clean_json_text(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "raw_text": raw,
            "parse_error": "Model output was not valid JSON",
        }


def _normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name or "").strip()


def _entity_label(entities: Dict[str, List[str]], image_path: Path) -> str:
    names = entities.get("names", []) if isinstance(entities, dict) else []
    chosen = _normalize_name(names[0]) if names else image_path.stem
    label = re.sub(r"[^A-Za-z0-9_-]+", "_", chosen).strip("_")
    return label or "unknown_entity"


def _evidence_id(image_path: Path) -> str:
    raw = f"{image_path.name}:{image_path.stat().st_mtime}:{image_path.stat().st_size}"
    return "ev-" + hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]


def build_prompt() -> str:
    return (
        "You are an evidence extraction engine for legal assistant workflows. "
        "Read the uploaded payment/document screenshot and return ONLY valid JSON. "
        "Do not include markdown, comments, or extra keys.\\n\\n"
        "Return schema:\\n"
        "{\\n"
        "  \"evidence_summary\": string,\\n"
        "  \"entities\": {\\n"
        "    \"names\": string[],\\n"
        "    \"dates\": string[],\\n"
        "    \"money\": string[],\\n"
        "    \"transaction_ids\": string[],\\n"
        "    \"emails\": string[],\\n"
        "    \"phones\": string[],\\n"
        "    \"upi_handles\": string[]\\n"
        "  },\\n"
        "  \"timeline\": [{\"date\": string, \"event\": string}],\\n"
        "  \"evidence_types\": string[],\\n"
        "  \"relevance_score\": number,\\n"
        "  \"evidence_strength\": number,\\n"
        "  \"quality_flags\": string[],\\n"
        "  \"source_language\": string,\\n"
        "  \"backend_text_en\": string\\n"
        "}\\n\\n"
        "Rules:\\n"
        "1) Prefer exact values visible in image, do not invent.\\n"
        "2) If a field is missing, return empty string/array.\\n"
        "3) evidence_types should use labels like payment_proof, receipt_invoice, communication, legal_notice, contract_agreement, unknown.\\n"
        "4) relevance_score and evidence_strength must be between 0 and 1.\\n"
        "5) backend_text_en should be OCR-like reconstructed text in English."
    )


def analyze_image_with_gemini(image_path: Path, model_name: str, api_key: str) -> Dict:
    # client = genai.Client(api_key=GEMINI_API)

    
    response = chat(
        model='deepseek-ocr',
        messages=[{'role': 'user', 'content': build_prompt()}],
    )
# print(response.message.content)

    # response = client.models.generate_content(
    #     model=model_name,
    #     contents=[types.Part.from_text(text=build_prompt()), _read_image_as_part(image_path)],
    #     config=types.GenerateContentConfig(
    #         temperature=0.0,
    #         response_mime_type="application/json",
    #     ),
    # )

    parsed = _safe_parse_json(response.text or "")

    evidence_id = _evidence_id(image_path)
    entities = parsed.get("entities", {}) if isinstance(parsed, dict) else {}
    entity_label = _entity_label(entities, image_path)

    output = {
        "evidence_id": evidence_id,
        "status": "processed" if "parse_error" not in parsed else "model_output_error",
        "metadata": {
            "file_name": image_path.name,
            "file_path": str(image_path),
            "file_extension": image_path.suffix.lower(),
            "file_size_bytes": image_path.stat().st_size,
            "processed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "model": model_name,
            "entity_label": entity_label,
        },
        "evidence_context": {
            "evidence_summary": parsed.get("evidence_summary", ""),
            "entities": entities,
            "timeline": parsed.get("timeline", []),
            "evidence_types": parsed.get("evidence_types", ["unknown"]),
            "relevance_score": parsed.get("relevance_score", 0.0),
            "evidence_strength": parsed.get("evidence_strength", 0.0),
            "quality_flags": parsed.get("quality_flags", []),
        },
        "source_language": parsed.get("source_language", "unknown"),
        "backend_text_en": parsed.get("backend_text_en", ""),
        "raw_model_output": response.text,
    }
    if "parse_error" in parsed:
        output["model_parse_error"] = parsed["parse_error"]

    return output


def save_output(output: Dict, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    label = output.get("metadata", {}).get("entity_label", "unknown_entity")
    evidence_id = output.get("evidence_id", "ev-unknown")
    out_path = output_dir / f"{label}_{evidence_id}.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Gemini Vision Evidence Analyzer (new script)")
    parser.add_argument("--input", default = "Evidence Data/1.jpeg", help="Path to image evidence file")
    parser.add_argument("--output-dir", default="outputs/gemini_vision", help="Output folder for structured JSON")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Gemini model name")
    parser.add_argument("--api-key", default=GEMINI_API, help="Gemini API key (or use GEMINI_API_KEY env var)")
    args = parser.parse_args()

    image_path = Path(args.input)
    if not image_path.exists() or not image_path.is_file():
        raise SystemExit(f"Input file not found: {image_path}")

    api_key = args.api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise SystemExit("Missing API key. Set GEMINI_API_KEY or pass --api-key")

    output = analyze_image_with_gemini(image_path, args.model, api_key)
    out_path = save_output(output, Path(args.output_dir))
    print(json.dumps({"output_file": str(out_path), "status": output.get("status")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
