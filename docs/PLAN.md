# ZeroReject (PramaanFix) — Phased Implementation Plan

**Track 1: Civic Pulse, Digital Governance & Public Information (FORGE '26)**

---

## Milestone 1: Monorepo Foundation & Documentation (Step 1)
- [x] Monorepo directory structure
- [x] Environment configuration (`.env.example`, `.env`)
- [x] Docker Compose with PostgreSQL + pgvector
- [x] GitHub Actions CI workflow
- [x] Technical Architecture (`docs/ARCHITECTURE.md`)
- [x] Implementation Plan (`docs/PLAN.md`)
- [x] Granular Task Tracker (`docs/TASK_TRACKER.md`)
- [x] Git Init & Initial Commit: `chore(repo): initialize monorepo structure, architecture docs, and task tracker`

---

## Milestone 2: Synthetic Real Citizen Document Generation (Step 2)
- [ ] Python PIL + ReportLab script to generate real, high-resolution sample citizen ID documents:
  - Aadhaar Card (Bilingual: Devanagari `"रमेश कुमार शर्मा"` + English `"Ramesh Kumar Sharma"`, PIN 206124, address, photo, UID)
  - PAN Card (English with middle-initial variation `"RAMESH K SHARMA"`, Father `"DINA NATH SHARMA"`, PAN number)
  - 10th Class Marksheet (Surname inverted `"Sharma Ramesh Kumar"`, DOB match, Roll number)
  - Citizen portrait photograph (`original_portrait.jpg`, uncropped/high-res)
  - Handwritten signature (`original_signature.png`, uncropped with white background)
- [ ] Save all rasterized assets to `assets/real_sample_docs/` for 1-click live testing.

---

## Milestone 3: Backend Core, Schemas & Deterministic Engines (Step 3)
- [ ] `apps/api/core/config.py`: Pydantic Settings with env parsing and port configuration.
- [ ] `apps/api/core/database.py`: Async SQLAlchemy 2.0 dual-engine (PostgreSQL asyncpg / SQLite aiosqlite in WAL mode).
- [ ] `apps/api/core/audit_logger.py`: In-memory and DB ring buffer tracking all SQL queries, API calls, latency, and SHA-256 hashes.
- [ ] `apps/api/models/entities.py`: SQLAlchemy ORM models (`AuditSession`, `ExtractedDocument`, `ReconciliationResult`, `CompiledAsset`, `ExecutionCheckpoint`).
- [ ] `apps/api/schemas/contracts.py`: Strict Pydantic v2 schemas for all requests, responses, and audit records.
- [ ] `apps/api/services/ocr_extractor.py`: Multimodal document extractor using Gemini 2.5 Flash Vision API (`google-genai`) with deterministic local Tesseract + OpenCV fallback.
- [ ] `apps/api/services/phonetic_reconciler.py`: Indic transliteration, Double Metaphone, Jaro-Winkler, Token Sort, and live India Post PIN API integration (`https://api.postalpincode.in/pincode/{pin}`) with caching.
- [ ] `apps/api/services/opencv_compiler.py`: Perspective deskewing, contour cropping, exact pixel sizing (`140x60`, `200x230`), and binary-search JPEG compression hitting strict KB ranges.
- [ ] `apps/api/services/affidavit_generator.py`: ReportLab bilingual (English + Hindi) "One-and-the-Same Person" Statutory Affidavit generator citing official government circulars.
- [ ] `apps/api/services/statutory_rag.py`: Portal specification rules and documentary proof criteria database.
- [ ] Unit tests in `apps/api/tests/`:
  - `test_phonetic_reconciler.py`
  - `test_opencv_compiler.py`
  - `test_affidavit_generator.py`
- [ ] Git Commits #2 through #5.

---

## Milestone 4: Standalone Government Portal Target & Playwright Agent (Step 4)
- [ ] `apps/gov-portal-target/app.py`: Standalone FastAPI + Jinja2/HTMX legacy portal running on port `8090`:
  - Multi-step application workflow (Step 1: Personal Details, Step 2: Address & PIN, Step 3: Document & Asset Uploads, Step 4: OTP Verification & Final Receipt).
  - Strict server-side validation: exact regex on names, exact byte checks (`signature <= 20KB`, `140x60px`), session cookies, and CSRF tokens.
  - Interactive `/api/toggle-chaos` endpoint: injects `502 Bad Gateway` and DOM selector shifts on Step 3.
- [ ] `apps/api/agents/playwright_executor.py`: LangGraph + Playwright async automation:
  - Accessibility tree form field mapper.
  - Step checkpoint persistence and self-healing error handler (catches 502, reloads checkpoint, retries).
  - SSE real-time streaming endpoint `/api/execution/stream/{session_id}`.
  - Human-in-the-Loop OTP authorization gate.
- [ ] `apps/api/tests/test_playwright_self_healing.py`: Automated test proving Playwright agent survives 502 chaos injection and reaches OTP screen.
- [ ] Git Commits #6 through #8.

---

## Milestone 5: Sovereign Archival Next.js 15 Web Application (Step 5)
- [ ] Next.js 15 App Router setup with Tailwind CSS and Google Fonts (`Newsreader`, `Plus Jakarta Sans`, `JetBrains Mono`).
- [ ] Color system implementation: Warm Alabaster (`#F6F4EE`), Obsidian (`#111625`), Vermilion (`#C93B2B`), Ochre (`#B86B11`), Emerald (`#0E6F53`), Ashoka Navy (`#162A45`).
- [ ] Components:
  - `TelemetryRibbon.tsx`: Live backend, DB, PIN API latency, Playwright agent status, and Judge Audit button.
  - `HeroXRay.tsx`: Editorial hero section with live cross-document phonetic reconciliation interactive card.
  - `StudioWorkspace.tsx`: 4 synchronized workflow panels:
    - Panel A: Multi-document Ingestion & 1-Click "Load Real Citizen Packet" test button.
    - Panel B: Cross-Document Entity Graph & Rejection Risk Matrix with live postal verification.
    - Panel C: OpenCV Auto-Cure Asset Preview & Bilingual Statutory Affidavit Synthesizer.
    - Panel D: Playwright Live Bureaucracy Console with live screenshots, SSE logs, Chaos Toggle, and OTP gate.
  - `JudgeAuditDrawer.tsx`: Slide-over drawer with raw SQL queries, API telemetry, SHA-256 hashes, and architectural tradeoff explanations.
- [ ] Verify zero TypeScript errors (`tsc --noEmit`) and successful production build (`npm run build`).
- [ ] Git Commit #9.

---

## Milestone 6: Makefile, Final Validation & Hackathon Presentation Guide (Step 6)
- [ ] Root `Makefile` with targets: `install`, `dev`, `test`, `lint`, `seed`, `demo`.
- [ ] `docs/TRADEOFFS_AND_QA.md`: Comprehensive judge Q&A guide and engineering tradeoff defense.
- [ ] Root `README.md`: Architecture diagrams, 1-command startup, API reference, demo walkthrough.
- [ ] Git Commit #10.
