"""Compatibility wrapper for structured voice module."""

from backend.app.voice.stt import STTResult, VoiceSTT, main

__all__ = ["STTResult", "VoiceSTT", "main"]


if __name__ == "__main__":
    main()
