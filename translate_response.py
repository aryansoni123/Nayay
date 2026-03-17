"""
Response translation for Nayay AI Legal Assistant.

Purpose:
- Accept the LLM-generated response text and the original user input language.
- If the user spoke/typed in Hindi, translate the response to Hindi.
- If the user spoke/typed in English, return the response unchanged.

Usage (as a module):
    from translate_response import translate_response
    hindi_reply = translate_response(response_text, input_language="hi")

Usage (CLI):
    echo "Your landlord must return the deposit within 30 days." | python translate_response.py --lang hi
    python translate_response.py --lang hi --text "Your landlord must return the deposit."
"""

import sys
from typing import Optional


def _google_en_to_hi(text: str) -> Optional[str]:
    """Translate English → Hindi using Google (via deep_translator)."""
    try:
        from deep_translator import GoogleTranslator
        result = GoogleTranslator(source="en", target="hi").translate(text)
        return result.strip() if result else None
    except Exception as exc:
        print(f"[translate_response] Google translation failed: {exc}", file=sys.stderr)
        return None


def _indic_en_to_hi(text: str) -> Optional[str]:
    """Translate English → Hindi using IndicTrans2 (higher quality; optional)."""
    try:
        from IndicTransToolkit import IndicProcessor
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        import torch

        ckpt = "ai4bharat/indictrans2-en-indic-dist-200M"
        processor = IndicProcessor(inference=True)
        tokenizer = AutoTokenizer.from_pretrained(ckpt, trust_remote_code=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(ckpt, trust_remote_code=True)

        batch = processor.preprocess_batch([text], src_lang="eng_Latn", tgt_lang="hin_Deva")
        inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            outputs = model.generate(**inputs, num_beams=4, max_length=512)
        decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        result = processor.postprocess_batch(decoded, lang="hin_Deva")
        return result[0].strip() if result else None
    except Exception:
        return None


def translate_response(response_text: str, input_language: str) -> str:
    """
    Translate the LLM response to Hindi if the user's original input was in Hindi.

    Args:
        response_text:  The English response from the LLM (Themis).
        input_language: Language code of the original user input ("hi" or "en").

    Returns:
        Hindi-translated response if input_language == "hi", else original text.
    """
    if not response_text or input_language != "hi":
        return response_text

    # Try Google first (fast), fall back to IndicTrans2 if unavailable
    translated = _google_en_to_hi(response_text)
    if not translated:
        translated = _indic_en_to_hi(response_text)

    return translated if translated else response_text


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(
        description="Translate LLM response to Hindi if user input was in Hindi"
    )
    parser.add_argument(
        "--lang",
        required=True,
        choices=["hi", "en"],
        help="Original input language detected from voice/text input",
    )
    parser.add_argument(
        "--text",
        default=None,
        help="Response text to translate (reads from stdin if omitted)",
    )
    args = parser.parse_args()

    if args.text:
        response_text = args.text
    else:
        response_text = sys.stdin.read().strip()

    if not response_text:
        print("[translate_response] No input text provided.", file=sys.stderr)
        sys.exit(1)

    output = translate_response(response_text, args.lang)
    print(output)


if __name__ == "__main__":
    main()
