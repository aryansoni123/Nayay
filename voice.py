"""
Minimal voice-to-text for Hindi and English.

Purpose:
- Capture one speech utterance from microphone.
- Transcribe it with Faster-Whisper.
- Return text and detected language only.

No translation, no pipeline modes, no extra workflow logic.
"""

from dataclasses import dataclass
import re

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

SAMPLE_RATE = 16000
CHANNELS = 1
MAX_RECORD_SECONDS = 20
SILENCE_SECONDS_TO_STOP = 0.6   # seconds of silence before ending capture
SILENCE_THRESHOLD = 0.01
SUPPORTED_LANGUAGES = {"hi", "en"}


@dataclass
class STTResult:
    text: str          # transcript in the original spoken language
    language: str      # original language code: "hi" or "en"
    english_text: str  # English text for backend processing (same as text when language=="en")


class VoiceSTT:
    def __init__(
        self,
        model_size: str = "medium",
        device: str = "cuda",
        compute_type: str = "float16",
    ) -> None:
        try:
            self.model = WhisperModel(model_size, device=device, compute_type=compute_type)
        except Exception:
            self.model = WhisperModel(model_size, device="cpu", compute_type="int8")

    @staticmethod
    def _is_devanagari(ch: str) -> bool:
        code = ord(ch)
        return 0x0900 <= code <= 0x097F

    @classmethod
    def _detect_hindi_from_text(cls, text: str) -> bool:
        """
        Detect Hindi from transcript text with:
        1) Devanagari script ratio
        2) Common Romanized Hindi words
        """
        if not text:
            return False

        letters = [ch for ch in text if ch.isalpha()]
        if not letters:
            return False

        devanagari_count = sum(1 for ch in letters if cls._is_devanagari(ch))
        ratio = devanagari_count / len(letters)
        if ratio >= 0.25:
            return True

        romanized_hindi_markers = {
            "hai", "nahi", "kyu", "kya", "mera", "meri", "mere", "tum", "aap",
            "ka", "ki", "ke", "se", "mein", "main", "bhai", "behen", "ghar",
            "paisa", "paise", "namaste", "haan", "nhi", "kr", "kar", "rha", "raha",
        }
        words = re.findall(r"[a-zA-Z]+", text.lower())
        marker_hits = sum(1 for w in words if w in romanized_hindi_markers)

        return marker_hits >= 2

    def _resolve_language(self, text: str, whisper_lang: str, whisper_prob: float) -> str:
        """
        Resolve final language label using audio-first detection.

        - If Whisper confidence is strong, trust Whisper.
        - If confidence is weak, use Hindi text heuristics as fallback.
        """
        if whisper_lang in SUPPORTED_LANGUAGES and whisper_prob >= 0.55:
            return whisper_lang

        if self._detect_hindi_from_text(text):
            return "hi"

        if whisper_lang in SUPPORTED_LANGUAGES:
            return whisper_lang

        return "en"

    def record_once(self) -> np.ndarray:
        """Record one utterance from microphone and stop after trailing silence."""
        block_seconds = 0.25
        block_size = int(SAMPLE_RATE * block_seconds)
        max_blocks = int(MAX_RECORD_SECONDS / block_seconds)
        silence_blocks_to_stop = int(SILENCE_SECONDS_TO_STOP / block_seconds)

        frames = []
        speaking_started = False
        silence_run = 0

        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
            blocksize=block_size,
        ) as stream:
            for _ in range(max_blocks):
                chunk, _overflowed = stream.read(block_size)
                mono = chunk[:, 0].copy()
                frames.append(mono)

                rms = float(np.sqrt(np.mean(mono ** 2)))
                if rms > SILENCE_THRESHOLD:
                    speaking_started = True
                    silence_run = 0
                elif speaking_started:
                    silence_run += 1
                    if silence_run >= silence_blocks_to_stop:
                        break

        if not frames:
            return np.array([], dtype=np.float32)

        audio = np.concatenate(frames).astype(np.float32)
        return audio

    def transcribe_once(self) -> STTResult:
        """Capture one utterance and return text plus detected language (hi/en)."""
        audio = self.record_once()
        if audio.size == 0:
            return STTResult(text="", language="en", english_text="")

        # Auto-detect spoken language directly from audio.
        segments, info = self.model.transcribe(audio, beam_size=5, vad_filter=True)

        text = " ".join(seg.text.strip() for seg in segments).strip()
        whisper_lang = info.language if info.language in SUPPORTED_LANGUAGES else "en"
        whisper_prob = float(getattr(info, "language_probability", 0.0))
        detected = self._resolve_language(text, whisper_lang, whisper_prob)

        if detected == "hi":
            # Use Whisper's built-in translate task to get English for backend
            # processing without any external API call.
            en_segments, _ = self.model.transcribe(audio, beam_size=5, task="translate", language="hi")
            english_text = " ".join(seg.text.strip() for seg in en_segments).strip()
        else:
            english_text = text

        return STTResult(text=text, language=detected, english_text=english_text)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Voice input to text (Hindi/English)")
    parser.add_argument(
        "--model",
        default="medium",
        choices=["tiny", "base", "small", "medium", "large-v2", "large-v3"],
        help="Whisper model size",
    )
    parser.add_argument("--device", default="cuda", choices=["cuda", "cpu"], help="Inference device")
    parser.add_argument(
        "--compute-type",
        default="float16",
        choices=["float16", "float32", "int8"],
        help="Inference compute type",
    )

    args = parser.parse_args()

    stt = VoiceSTT(
        model_size=args.model,
        device=args.device,
        compute_type=args.compute_type,
    )

    print("Speak now...")
    result = stt.transcribe_once()
    print({
        "text": result.text,
        "english_text": result.english_text,
        "language": result.language,
    })


if __name__ == "__main__":
    main()
