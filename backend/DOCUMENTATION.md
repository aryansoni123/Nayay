# Praytna Legal RAG Backend: Technical Deep-Dive

This document explains the current architecture and behavior of the legal Retrieval-Augmented Generation (RAG) backend.

## 1. Scope and Domain

The backend is configured for legal-document workflows focused on IPC and related laws.

- Source of truth: Indexed legal PDF files.
- Disallowed inputs: CSV files, URLs/links, and other non-PDF formats.
- Retrieval policy: Answers are grounded in indexed document context.

## 2. Ingestion Pipeline (PDF-Only)

### A. PDF Processing (`processors.py`)
- Uses `PyMuPDFLoader` for extraction.
- Applies `RecursiveCharacterTextSplitter` with chunking optimized for retrieval.
- Cleans extracted text before embedding.

### B. Ingestion Control (`database.py`)
- Enforces a strict extension allowlist: `.pdf` only.
- Unsupported files are skipped and never indexed.
- Maintains incremental indexing through SHA-256 file hashing.

### C. Runtime Watching (`watcher.py`)
- Uses `watchdog` to monitor data directory changes.
- New or modified files are sent to ingestion.
- Extension filtering in `database.py` prevents accidental non-PDF indexing.

## 3. Retrieval and Generation (`engine.py`)

### A. Retrieval Stack
- Vector search over FAISS using sentence-transformer embeddings.
- FlashRank reranking to prioritize relevance.

### B. Prompt Policy
- Assistant role is legal research support for IPC and related statutes.
- Uses only indexed context and conversation memory.
- Explicitly avoids external web sources.
- If context is missing, responds with a clear "not found in indexed legal PDFs" message and requests PDF upload.
- Adds informational-only legal disclaimer in responses.

## 4. API Behavior (`api.py`)

### A. Upload Endpoint (`POST /upload`)
- Accepts one or multiple files.
- Validates extension and allows `.pdf` only.
- Rejects non-PDF files with a structured error response.

### B. Status Endpoint (`GET /status`)
- Reports inventory and indexing state.
- Marks non-PDF disk files as `unsupported`.

### C. Chat Endpoint (`POST /chat`)
- Runs legal RAG pipeline and returns answer + retrieval sources.

## 5. Operational Notes

- Keep legal reference material in PDF format only.
- For best answers, upload clean statute PDFs and amendment updates.
- Non-PDF files are intentionally ignored or rejected.
