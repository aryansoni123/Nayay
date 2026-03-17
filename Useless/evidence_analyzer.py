from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import argparse
import hashlib
import json
from pathlib import Path
import re
from typing import Dict, List, Optional, Tuple


@dataclass
class AnalyzerConfig:
    output_dir: str = "outputs"
    default_language: str = "en"


class EvidenceAnalyzer:
    """Basic phase-1 analyzer that converts evidence files into structured JSON."""

    EVIDENCE_TYPE_KEYWORDS: Dict[str, List[str]] = {
        "contract_agreement": ["agreement", "contract", "terms", "clause"],
        "payment_proof": ["upi", "transaction", "paid", "payment", "bank", "imps", "neft", "rtgs"],
        "receipt_invoice": ["invoice", "receipt", "bill", "gst", "tax"],
        "communication": ["chat", "email", "whatsapp", "message", "call", "sms"],
        "salary_employment_document": ["salary", "employer", "employee", "offer letter", "payslip"],
        "legal_notice": ["notice", "legal", "advocate", "section", "act"],
        "property_document": ["rent", "lease", "property", "tenant", "landlord", "deed"],
        "identity_document": ["aadhaar", "pan", "passport", "voter", "driving licence"],
    }

    EVIDENCE_STRENGTH_WEIGHTS: Dict[str, float] = {
        "contract_agreement": 0.9,
        "payment_proof": 0.8,
        "receipt_invoice": 0.6,
        "communication": 0.5,
        "salary_employment_document": 0.7,
        "legal_notice": 0.75,
        "property_document": 0.85,
        "identity_document": 0.65,
        "unknown": 0.2,
    }

    def __init__(self, config: Optional[AnalyzerConfig] = None) -> None:
        self.config = config or AnalyzerConfig()
        Path(self.config.output_dir).mkdir(parents=True, exist_ok=True)

    def analyze_file(self, file_path: str, query_context: Optional[str] = None) -> Dict:
        file_obj = Path(file_path)
        evidence_id = self._evidence_id(file_obj)

        if not file_obj.exists() or not file_obj.is_file():
            result = self._unprocessable_result(
                evidence_id=evidence_id,
                file_path=file_obj,
                reason="File does not exist or is not a regular file.",
            )
            self._write_output(result)
            return result

        text, extraction_meta = self._extract_text(file_obj)
        normalized_text = self._normalize_text(text)

        if not normalized_text:
            result = self._unprocessable_result(
                evidence_id=evidence_id,
                file_path=file_obj,
                reason=extraction_meta.get("error", "No text extracted from file."),
                extraction_meta=extraction_meta,
            )
            self._write_output(result)
            return result

        source_language = self._detect_language(normalized_text)
        backend_text_en = normalized_text

        evidence_types, relevance_score = self._classify_evidence(backend_text_en, file_obj.suffix.lower())
        entities = self._extract_entities(backend_text_en)
        timeline = self._extract_timeline(backend_text_en)
        summary = self._summarize(backend_text_en)
        quality_flags = self._quality_flags(backend_text_en, extraction_meta)
        evidence_strength = self._score_evidence_strength(evidence_types, quality_flags)

        entity_label = self._entity_label(entities, file_obj)
        result = {
            "evidence_id": evidence_id,
            "status": "processed",
            "metadata": {
                "file_name": file_obj.name,
                "file_path": str(file_obj),
                "file_extension": file_obj.suffix.lower(),
                "file_size_bytes": file_obj.stat().st_size,
                "processed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "source_language": source_language,
                "backend_language": self.config.default_language,
                "query_context": query_context,
                "entity_label": entity_label,
            },
            "evidence_context": {
                "evidence_summary": summary,
                "entities": entities,
                "timeline": timeline,
                "evidence_types": evidence_types,
                "relevance_score": relevance_score,
                "evidence_strength": evidence_strength,
                "quality_flags": quality_flags,
            },
            "extraction_details": extraction_meta,
            "backend_text_en": backend_text_en,
            "unprocessable_reason": None,
        }
        self._write_output(result)
        return result

    def _extract_text(self, file_obj: Path) -> Tuple[str, Dict]:
        ext = file_obj.suffix.lower()
        meta = {"extractor": "", "error": None}

        try:
            if ext in {".txt", ".md"}:
                meta["extractor"] = "plain_text"
                return file_obj.read_text(encoding="utf-8", errors="ignore"), meta

            if ext == ".json":
                meta["extractor"] = "json_flatten"
                raw = json.loads(file_obj.read_text(encoding="utf-8", errors="ignore"))
                return json.dumps(raw, ensure_ascii=False), meta

            if ext == ".csv":
                meta["extractor"] = "csv_reader"
                import csv

                lines: List[str] = []
                with file_obj.open("r", encoding="utf-8", errors="ignore") as f:
                    reader = csv.reader(f)
                    for row in reader:
                        lines.append(" | ".join(cell.strip() for cell in row if cell is not None))
                return "\n".join(lines), meta

            if ext == ".pdf":
                meta["extractor"] = "pypdf"
                try:
                    from pypdf import PdfReader  # type: ignore
                except Exception:
                    meta["error"] = "pypdf is not installed."
                    return "", meta

                pages: List[str] = []
                reader = PdfReader(str(file_obj))
                for page in reader.pages:
                    pages.append(page.extract_text() or "")
                return "\n".join(pages), meta

            if ext == ".docx":
                meta["extractor"] = "python_docx"
                try:
                    import docx  # type: ignore
                except Exception:
                    meta["error"] = "python-docx is not installed."
                    return "", meta

                doc = docx.Document(str(file_obj))
                return "\n".join(p.text for p in doc.paragraphs), meta

            if ext in {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}:
                meta["extractor"] = "pytesseract_ocr"
                try:
                    from PIL import Image  # type: ignore
                    import pytesseract  # type: ignore
                except Exception:
                    meta["error"] = "OCR dependencies missing (Pillow/pytesseract)."
                    return "", meta

                image = Image.open(str(file_obj))
                text = pytesseract.image_to_string(image)
                return text, meta

            if ext in {".mp3", ".wav", ".m4a"}:
                meta["extractor"] = "whisper"
                try:
                    import whisper  # type: ignore
                except Exception:
                    meta["error"] = "openai-whisper is not installed."
                    return "", meta

                model = whisper.load_model("base")
                result = model.transcribe(str(file_obj))
                return result.get("text", ""), meta

            meta["extractor"] = "unsupported"
            meta["error"] = f"Unsupported file type: {ext}"
            return "", meta
        except Exception as exc:
            meta["error"] = str(exc)
            return "", meta

    def _classify_evidence(self, text: str, extension: str) -> Tuple[List[str], float]:
        lower_text = text.lower()
        matches: List[str] = []

        for e_type, keys in self.EVIDENCE_TYPE_KEYWORDS.items():
            if any(k in lower_text for k in keys):
                matches.append(e_type)

        if extension in {".jpg", ".jpeg", ".png"} and "receipt_invoice" not in matches:
            if any(k in lower_text for k in ["receipt", "amount", "inr", "upi"]):
                matches.append("receipt_invoice")

        if not matches:
            matches = ["unknown"]

        # Basic confidence proxy from keyword hit density.
        key_hits = sum(1 for keys in self.EVIDENCE_TYPE_KEYWORDS.values() for k in keys if k in lower_text)
        relevance = min(1.0, 0.15 + 0.08 * key_hits)
        return sorted(set(matches)), round(relevance, 3)

    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        dates = re.findall(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\b", text)
        amounts = re.findall(r"(?:INR|Rs\.?|₹)\s?\d[\d,]*(?:\.\d+)?", text, flags=re.IGNORECASE)
        transaction_ids = re.findall(r"\b(?:UTR|Txn|Transaction|Ref|Reference)[:\s-]*([A-Za-z0-9-]{6,})\b", text, flags=re.IGNORECASE)
        emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        phones = re.findall(r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b", text)
        upi_handles = re.findall(r"\b[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}\b", text)

        generic_terms = {
            "PAYMENT", "SUCCESSFUL", "RECEIPT", "DETAILS", "DONE", "SPLIT", "EXPENSE",
            "VIEW", "MARCH", "PM", "AM", "UPI", "BANK", "WHATSAPP", "IMAGE", "CONTACT",
            "SUPPORT", "POWERED", "RECEIVED", "TRANSACTION", "TRANSFER", "HISTORY", "SHARE",
            "BALANCE", "CHECK", "CREDITED", "BANKING", "NAME", "PHONEPE", "MONEY", "SEND",
            "UTR", "PA", "LIA", "LAI"
        }
        raw_candidates = re.findall(r"\b[A-Z][A-Z]{2,}(?:\s+[A-Z][A-Z]{2,})*\b", text)
        raw_candidates += re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b", text)

        names: List[str] = []
        for candidate in raw_candidates:
            cleaned = re.sub(r"\s+", " ", candidate).strip()
            if any(char.isdigit() for char in cleaned):
                continue
            parts = cleaned.split()
            if not parts:
                continue
            if any(part.upper() in generic_terms for part in parts):
                if not all(part.upper() not in generic_terms for part in parts):
                    continue
            if len(parts) > 4 or len(cleaned) < 3:
                continue
            names.append(cleaned)

        prioritized_names = sorted(
            set(names),
            key=lambda value: (
                -sum(1 for part in value.split() if part[:1].isalpha()),
                any(part.isupper() for part in value.split()),
                -len(value),
                value,
            ),
        )

        return {
            "names": prioritized_names,
            "dates": sorted(set(dates)),
            "money": sorted(set(amounts)),
            "transaction_ids": sorted(set(transaction_ids)),
            "emails": sorted(set(emails)),
            "phones": sorted(set(phones)),
            "upi_handles": sorted(set(upi_handles)),
        }

    def _extract_timeline(self, text: str) -> List[Dict[str, str]]:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        timeline: List[Dict[str, str]] = []
        date_pattern = re.compile(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\b")

        for sentence in sentences:
            match = date_pattern.search(sentence)
            if match:
                timeline.append(
                    {
                        "date": match.group(0),
                        "event": sentence.strip()[:300],
                    }
                )
        return timeline

    def _score_evidence_strength(self, evidence_types: List[str], quality_flags: List[str]) -> float:
        base_scores = [self.EVIDENCE_STRENGTH_WEIGHTS.get(e_type, 0.2) for e_type in evidence_types]
        base = max(base_scores) if base_scores else 0.2

        penalty = 0.0
        if "too_short" in quality_flags:
            penalty += 0.15
        if "low_context" in quality_flags:
            penalty += 0.1
        if "extractor_warning" in quality_flags:
            penalty += 0.1

        return round(max(0.0, min(1.0, base - penalty)), 3)

    @staticmethod
    def _summarize(text: str, max_sentences: int = 3) -> str:
        """TextRank extractive summary via sumy. Falls back to TF-IDF sentence
        scoring if sumy is not installed."""
        if not text.strip():
            return ""

        # --- TextRank via sumy (NLTK-free: pre-split sentences fed directly) ---
        try:
            from sumy.models.dom import Sentence as _SumySentence, Paragraph as _Paragraph, ObjectDocumentModel as _ODM  # type: ignore
            from sumy.summarizers.text_rank import TextRankSummarizer  # type: ignore

            raw_sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 10]
            if len(raw_sentences) > max_sentences:
                sumy_sents = [_SumySentence(s, None) for s in raw_sentences]
                document = _ODM([_Paragraph(sumy_sents)])
                summarizer = TextRankSummarizer()
                picked = summarizer(document, max_sentences)
                result = " ".join(str(s) for s in picked)
                if result.strip():
                    return result
        except Exception:
            pass  # sumy not installed or API mismatch — fall through

        # --- TF-IDF fallback (zero extra dependencies) ---
        import math as _math
        from collections import Counter as _Counter

        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
        if len(sentences) <= max_sentences:
            return " ".join(sentences)

        # Build term frequency table across all sentences
        def _tokens(s: str) -> List[str]:
            return re.findall(r"[a-zA-Z\u0900-\u097F]{3,}", s.lower())

        doc_tokens = _tokens(text)
        tf = _Counter(doc_tokens)
        total = len(doc_tokens) or 1

        # IDF: log(N / df) for each term
        n = len(sentences)
        df: Dict[str, int] = {}
        for sent in sentences:
            for tok in set(_tokens(sent)):
                df[tok] = df.get(tok, 0) + 1
        idf = {t: _math.log((n + 1) / (df.get(t, 0) + 1)) for t in tf}

        # Score each sentence
        def _score(sent: str) -> float:
            toks = _tokens(sent)
            if not toks:
                return 0.0
            return sum(tf[t] / total * idf.get(t, 0) for t in toks) / len(toks)

        scored = sorted(enumerate(sentences), key=lambda x: _score(x[1]), reverse=True)
        top_indices = sorted(i for i, _ in scored[:max_sentences])
        return " ".join(sentences[i] for i in top_indices)

    @staticmethod
    def _normalize_text(text: str) -> str:
        return re.sub(r"\s+", " ", text or "").strip()

    @staticmethod
    def _detect_language(text: str) -> str:
        devanagari = len(re.findall(r"[\u0900-\u097F]", text))
        latin = len(re.findall(r"[A-Za-z]", text))
        if devanagari == 0 and latin == 0:
            return "unknown"
        if devanagari > 0 and latin > 0:
            return "mixed"
        if devanagari > latin:
            return "hi"
        return "en"

    @staticmethod
    def _evidence_id(file_obj: Path) -> str:
        raw = f"{file_obj.name}:{file_obj.stat().st_mtime if file_obj.exists() else datetime.now(timezone.utc).timestamp()}"
        return "ev-" + hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]

    @staticmethod
    def _quality_flags(text: str, extraction_meta: Dict) -> List[str]:
        flags: List[str] = []
        if len(text) < 40:
            flags.append("too_short")
        if len(text.split()) < 8:
            flags.append("low_context")
        if extraction_meta.get("error"):
            flags.append("extractor_warning")
        return flags

    @staticmethod
    def _entity_label(entities: Dict[str, List[str]], file_obj: Path) -> str:
        names = entities.get("names", [])
        preferred_name = None
        for name in names:
            words = name.split()
            if 1 <= len(words) <= 4 and all(word[:1].isalpha() for word in words):
                preferred_name = name
                break

        base_name = preferred_name or file_obj.stem
        sanitized = re.sub(r"[^A-Za-z0-9_-]+", "_", base_name).strip("_")
        return sanitized or "unknown_entity"

    def _unprocessable_result(
        self,
        evidence_id: str,
        file_path: Path,
        reason: str,
        extraction_meta: Optional[Dict] = None,
    ) -> Dict:
        return {
            "evidence_id": evidence_id,
            "status": "unprocessable",
            "metadata": {
                "file_name": file_path.name,
                "file_path": str(file_path),
                "file_extension": file_path.suffix.lower(),
                "processed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
            "evidence_context": {
                "evidence_summary": "",
                "entities": {},
                "timeline": [],
                "evidence_types": ["unknown"],
                "relevance_score": 0.0,
                "evidence_strength": 0.0,
                "quality_flags": ["empty_content"],
            },
            "extraction_details": extraction_meta or {},
            "backend_text_en": "",
            "unprocessable_reason": reason,
        }

    def _write_output(self, result: Dict) -> str:
        entity_label = result.get("metadata", {}).get("entity_label", "unknown_entity")
        out_path = Path(self.config.output_dir) / f"{entity_label}_{result['evidence_id']}.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        return str(out_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Basic evidence analyzer for multi-type files.")
    parser.add_argument("input", help="Path to evidence file")
    parser.add_argument("--query-context", default=None, help="Optional user query for relevance context")
    parser.add_argument("--output-dir", default="outputs", help="Directory to store structured JSON output")
    args = parser.parse_args()

    analyzer = EvidenceAnalyzer(AnalyzerConfig(output_dir=args.output_dir))
    result = analyzer.analyze_file(args.input, query_context=args.query_context)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
