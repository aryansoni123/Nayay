"""Compatibility wrapper for structured translation service module."""

from backend.app.services.translate_response import main, translate_response

__all__ = ["translate_response", "main"]


if __name__ == "__main__":
    main()
