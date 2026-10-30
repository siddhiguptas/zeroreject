# ZeroReject (PramaanFix) — Live Task Tracker

*Last Updated: 2026-10-31*

Status Legend:
- `[ ]` Not Started
- `[/]` In Progress
- `[x]` Completed & Verified

---

## Phase 1: Repository Foundation & Monorepo Architecture
- [x] Initialize Git repository
- [x] Monorepo directory structure
- [x] Configure `.gitignore` and `.env.example`
- [x] Write `docker-compose.yml` (PostgreSQL 16 + pgvector)
- [x] Create GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [x] Author system architecture specification (`docs/ARCHITECTURE.md`)
- [x] Author implementation plan (`docs/PLAN.md`)
- [x] Author task tracker (`docs/TASK_TRACKER.md`)
- [x] Author architectural tradeoffs guide (`docs/TRADEOFFS_AND_QA.md`)
- [x] Git Commit 1: `chore(repo): initialize monorepo structure, architecture docs, and task tracker`

---

## Phase 2: Real Document Generation Assets
- [x] Create synthetic document generation script (`scripts/generate_sample_docs.py`)
- [x] Generate bilingual Aadhaar Card image (`assets/real_sample_docs/aadhaar_sample.png`)
- [x] Generate PAN Card image with middle initial (`assets/real_sample_docs/pan_sample.png`)
- [x] Generate 10th Class Marksheet image with inverted name (`assets/real_sample_docs/marksheet_sample.png`)
- [x] Generate portrait photograph (`assets/real_sample_docs/portrait_raw.jpg`)
- [x] Generate handwritten signature (`assets/real_sample_docs/signature_raw.png`)
- [x] Verify OCR readability of generated assets

---

## Phase 3: Core API & Deterministic Python Engines
- [x] Initialize Python virtual environment & requirements (`apps/api/requirements.txt`)
- [x] Implement Settings & Config (`apps/api/core/config.py`)
- [x] Implement Async SQLAlchemy database layer with dual SQLite/Postgres support (`apps/api/core/database.py`)
- [x] Implement live Judge Audit Logger (`apps/api/core/audit_logger.py`)
- [x] Define SQLAlchemy database models (`apps/api/models/entities.py`)
- [x] Define strict Pydantic v2 schemas (`apps/api/schemas/contracts.py`)
- [x] Git Commit 2: `feat(db-schemas): implement SQLAlchemy models, Pydantic v2 contracts, and live audit logger`
- [x] Implement Multimodal Vision OCR extractor (`apps/api/services/ocr_extractor.py`)
- [x] Implement Deterministic Indic Phonetic Reconciler & India Post LGD API (`apps/api/services/phonetic_reconciler.py`)
- [x] Git Commit 3: `feat(phonetic-engine): build Indic-to-Latin transliteration, Double Metaphone graph, and live India Post LGD integration`
- [x] Implement OpenCV Biometric Asset Compiler with binary-search compression (`apps/api/services/opencv_compiler.py`)
- [x] Git Commit 4: `feat(opencv-compiler): implement perspective deskew, pixel bounding, and binary-search KB compression`
- [x] Implement ReportLab Bilingual Affidavit Synthesizer (`apps/api/services/affidavit_generator.py`)
- [x] Implement Statutory Guidelines and Portal Spec DB (`apps/api/services/statutory_rag.py`)
- [x] Git Commit 5: `feat(affidavit-synth): add ReportLab statutory name-reconciliation annexure PDF generator`
- [x] Author and run backend unit tests (`pytest apps/api/tests/`)

---

## Phase 4: Standalone Government Target Portal & Self-Healing Playwright Agent
- [x] Build standalone e-District target portal on port `8090` (`apps/gov-portal-target/app.py`)
- [x] Add strict server-side validation (regex, pixel, byte limit) & `/api/chaos/toggle` endpoint
- [x] Git Commit 6: `feat(gov-target): build standalone e-District portal target with strict file/regex validators and 502 chaos injection`
- [x] Build LangGraph state machine & Playwright async executor (`apps/api/agents/playwright_executor.py`)
- [x] Implement SSE live telemetry streaming endpoint (`/api/execution/stream/{session_id}`)
- [x] Implement OTP authorization human-in-the-loop endpoint
- [x] Git Commit 7: `feat(playwright-agent): implement self-healing LangGraph Playwright executor with checkpoint retry and SSE streaming`
- [x] Test Playwright self-healing against injected 502 chaos (`apps/api/tests/test_playwright_self_healing.py`)
- [x] Git Commit 8: `test(backend): add unit and integration test suites for phonetic engine, OpenCV compiler, and Playwright healing`

---

## Phase 5: Sovereign Archival Next.js 15 Web Application
- [x] Initialize Next.js 15 TypeScript project (`apps/web`)
- [x] Configure Tailwind CSS with Sovereign Archival design palette & typography
- [x] Implement API client with SSE support (`apps/web/src/lib/api-client.ts`)
- [x] Build `TelemetryRibbon.tsx` with live latencies & system health
- [x] Build `HeroXRay.tsx` with interactive phonetic comparison matrix
- [x] Build Panel A: Multi-Document Ingestion & "Load Real Citizen Packet" action
- [x] Build Panel B: Cross-Document Entity Graph & Rejection Risk Matrix
- [x] Build Panel C: OpenCV Asset Auto-Cure Preview & Bilingual Affidavit Studio
- [x] Build Panel D: Playwright Live Execution Console with Chaos Toggle & OTP Gate
- [x] Build `JudgeAuditDrawer.tsx` with raw SQL logs, API latency, and SHA-256 hashes
- [x] Verify `npm run build` and `tsc --noEmit` pass with zero errors
- [x] Git Commit 9: `feat(web-ui): build Sovereign Archival UI, Hero X-Ray, 4-panel ZeroReject Studio, and Judge Audit Drawer`

---

## Phase 6: Final Verification & Presentation Polish
- [x] Create Root `Makefile` for 1-command startup
- [x] Finalize `README.md` with system diagrams and judge demo script
- [x] Verify end-to-end user journey (upload -> reconcile -> compile -> execute -> chaos -> heal -> OTP)
- [x] Git Commit 10: `docs(readme): finalize setup instructions, architecture diagrams, and FORGE '26 judge Q&A guide`

---

## Phase 7: Architecture Override — 100% Free Zero-Credit AI & OCR Stack
- [x] Stage 1-3 Free Optical & Civic Entity Parser with Verhoeff D5 algorithm (`apps/api/services/ocr_extractor.py`)
- [x] Free local BM25 + Sub-Word TF-IDF Hybrid Statutory RAG (`apps/api/services/statutory_rag.py`)
- [x] 4-Tier Free AI Router with Zero-Key Deterministic Fallback (`apps/api/services/free_llm_router.py`)
- [x] 100% Free Multilingual Voice Copilot with Edge-TTS (`apps/api/services/voice_explainer.py` & `/api/voice/explain`)
- [x] Free AI Stack badges & runtime key configuration modal in UI (`TelemetryRibbon.tsx` & `JudgeAuditDrawer.tsx`)
- [x] 15/15 Pytest unit and integration tests passing with 0 paid API keys in environment
- [x] Git Commit 11: `feat(free-ai-stack): replace paid Gemini API with keyless local OCR, hybrid RAG, and multi-provider free LLM router`
