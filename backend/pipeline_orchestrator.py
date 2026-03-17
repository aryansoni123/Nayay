"""Compatibility wrapper for the structured pipeline module."""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.orchestration.pipeline import main, run_pipeline  # noqa: E402,F401


if __name__ == "__main__":
    main()
