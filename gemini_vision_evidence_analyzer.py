"""Compatibility wrapper for structured vision evidence analyzer."""

from backend.app.evidence.vision_analyzer import (  # noqa: F401
    DEFAULT_MODEL,
    analyze_image_with_gemini,
    main,
    save_output,
)

__all__ = ["DEFAULT_MODEL", "analyze_image_with_gemini", "save_output", "main"]


if __name__ == "__main__":
    main()
