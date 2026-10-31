# Changelog

All notable changes to **ZeroReject (PramaanFix)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-31

### Added
- **Core Architecture & Mission**:
  - Initial flagship release of ZeroReject (PramaanFix) for **FORGE '26 GenAI Hackathon (Track 1: Civic Pulse & Digital Governance)**.
  - Enforced strict Zero Dummy Data Policy across all backend modules and frontend views.
- **Indic Phonetic Reconciliation Engine (`apps/api/services/phonetic_reconciler.py`)**:
  - Deterministic Indic to Latin transliteration matrix for Devanagari Hindi vowels, consonants, and matras.
  - Weighted composite similarity formula: 40% Double Metaphone + 35% Jaro-Winkler + 25% Token-Sort Levenshtein distance.
  - Mononym (single-word name) resilience and initial abbreviation expansion (`Ramesh K. Sharma` ↔ `Ramesh Kumar Sharma`).
  - Real-time India Post PIN code & LGD integration (`https://api.postalpincode.in/pincode/{pin}`) with local cache fallback.
- **Adaptive Biometric & Asset Compiler (`apps/api/services/opencv_compiler.py`)**:
  - OpenCV CLAHE image enhancement, bilateral denoising, and Haar cascade face extraction.
  - Morphological stroke contour extraction for citizen signatures.
  - Binary-search quantization loop guaranteeing strict file size compliance (`10KB <= signature <= 19.5KB`).
- **Statutory Legal Affidavit Synthesizer (`apps/api/services/affidavit_generator.py`)**:
  - Automated ReportLab generation of bilingual 'One-and-the-Same Person' Self-Declaration Affidavits.
  - Grounded legal citations: Passport Seva Annexure 'E' Rule 4(b), EPFO Joint Declaration Circular Para 3.2, and NSP guidelines.
  - Embedded official Sovereign Seal vector emblem header.
- **Self-Healing Playwright Execution Agent (`apps/api/agents/playwright_executor.py`)**:
  - Autonomous multi-step portal navigation with LangGraph-style checkpoint persistence.
  - Chaos injection resilience: catches HTTP `502 Bad Gateway` and DOM selector shifts, executing rollback and exponential backoff retry.
  - Streaming Server-Sent Events (SSE) telemetry and live viewport screenshots.
  - Human-in-the-Loop OTP Authorization Gate at final submission.
- **100% Free, Zero-Credit AI & Copilot Stack**:
  - CPU-based optical text extraction via Pytesseract / OpenCV binarization with multi-angle rotation retry (90°/180°/270°).
  - Sub-millisecond BM25Okapi hybrid statutory RAG indexed in SQLite WAL.
  - 4-Tier Free LLM Router supporting Groq Free, OpenRouter `:free` models, local Ollama, and deterministic legal compiler fallback.
  - Multilingual voice explainer copilot using `edge-tts` (`hi-IN-SwaraNeural` and `en-IN-NeerjaNeural`).
- **Sovereign Archival Web Studio (`apps/web`)**:
  - Next.js 15 App Router with Sovereign Archival design palette (`#F6F4EE`, `#162A45`, `#C93B2B`).
  - Real-time Telemetry Ribbon, Hero Cross-Document X-Ray, 4-Panel Studio Workspace, and Slide-Over Judge Audit Drawer.
  - Independent React Error Boundaries for each studio panel.
  - Full technical SEO metadata, OpenGraph cards, PWA manifest, dynamic sitemap, and Schema.org JSON-LD rich snippets.
