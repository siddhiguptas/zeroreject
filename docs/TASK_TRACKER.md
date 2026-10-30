# ZeroReject (PramaanFix) — Live Task Tracker

*Last Updated: 2026-10-30*

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
- [ ] Create synthetic document generation script (`scripts/generate_sample_docs.py`)
- [ ] Generate bilingual Aadhaar Card image (`assets/real_sample_docs/aadhaar_sample.png`)
- [ ] Generate PAN Card image with middle initial (`assets/real_sample_docs/pan_sample.png`)
- [ ] Generate 10th Class Marksheet image with inverted name (`assets/real_sample_docs/marksheet_sample.png`)
- [ ] Generate portrait photograph (`assets/real_sample_docs/portrait_raw.jpg`)
- [ ] Generate handwritten signature (`assets/real_sample_docs/signature_raw.png`)
- [ ] Verify OCR readability of generated assets

---

## Phase 3: Core API & Deterministic Python Engines
- [ ] Initialize Python virtual environment & requirements (`apps/api/requirements.txt`)
- [ ] Implement Settings & Config (`apps/api/core/config.py`)
- [ ] Implement Async SQLAlchemy database layer with dual SQLite/Postgres support (`apps/api/core/database.py`)
- [ ] Implement live Judge Audit Logger (`apps/api/core/audit_logger.py`)
- [ ] Define SQLAlchemy database models (`apps/api/models/entities.py`)
- [ ] Define strict Pydantic v2 schemas (`apps/api/schemas/contracts.py`)
- [ ] Git Commit 2: `feat(db-schemas): implement SQLAlchemy models, Pydantic v2 contracts, and live audit logger`
- [ ] Implement Multimodal Vision OCR extractor (`apps/api/services/ocr_extractor.py`)
- [ ] Implement Deterministic Indic Phonetic Reconciler & India Post LGD API (`apps/api/services/phonetic_reconciler.py`)
- [ ] Git Commit 3: `feat(phonetic-engine): build Indic-to-Latin transliteration, Double Metaphone graph, and live India Post LGD integration`
- [ ] Implement OpenCV Biometric Asset Compiler with binary-search compression (`apps/api/services/opencv_compiler.py`)
- [ ] Git Commit 4: `feat(opencv-compiler): implement perspective deskew, pixel bounding, and binary-search KB compression`
- [ ] Implement ReportLab Bilingual Affidavit Synthesizer (`apps/api/services/affidavit_generator.py`)
- [ ] Implement Statutory Guidelines and Portal Spec DB (`apps/api/services/statutory_rag.py`)
- [ ] Git Commit 5: `feat(affidavit-synth): add ReportLab statutory name-reconciliation annexure PDF generator`
- [ ] Author and run backend unit tests (`pytest apps/api/tests/`)

---

## Phase 4: Standalone Government Target Portal & Self-Healing Playwright Agent
- [ ] Build standalone e-District target portal on port `8090` (`apps/gov-portal-target/app.py`)
- [ ] Add strict server-side validation (regex, pixel, byte limit) & `/api/toggle-chaos` endpoint
- [ ] Git Commit 6: `feat(gov-target): build standalone e-District portal target with strict file/regex validators and 502 chaos injection`
- [ ] Build LangGraph state machine & Playwright async executor (`apps/api/agents/playwright_executor.py`)
- [ ] Implement SSE live telemetry streaming endpoint (`/api/execution/stream/{session_id}`)
- [ ] Implement OTP authorization human-in-the-loop endpoint
- [ ] Git Commit 7: `feat(playwright-agent): implement self-healing LangGraph Playwright executor with checkpoint retry and SSE streaming`
- [ ] Test Playwright self-healing against injected 502 chaos (`apps/api/tests/test_playwright_self_healing.py`)
- [ ] Git Commit 8: `test(backend): add unit and integration test suites for phonetic engine, OpenCV compiler, and Playwright healing`

---

## Phase 5: Sovereign Archival Next.js 15 Web Application
- [ ] Initialize Next.js 15 TypeScript project (`apps/web`)
- [ ] Configure Tailwind CSS with Sovereign Archival design palette & typography
- [ ] Implement API client with SSE support (`apps/web/src/lib/api-client.ts`)
- [ ] Build `TelemetryRibbon.tsx` with live latencies & system health
- [ ] Build `HeroXRay.tsx` with interactive phonetic comparison matrix
- [ ] Build Panel A: Multi-Document Ingestion & "Load Real Citizen Packet" action
- [ ] Build Panel B: Cross-Document Entity Graph & Rejection Risk Matrix
- [ ] Build Panel C: OpenCV Asset Auto-Cure Preview & Bilingual Affidavit Studio
- [ ] Build Panel D: Playwright Live Execution Console with Chaos Toggle & OTP Gate
- [ ] Build `JudgeAuditDrawer.tsx` with raw SQL logs, API latency, and SHA-256 hashes
- [ ] Verify `npm run build` and `tsc --noEmit` pass with zero errors
- [ ] Git Commit 9: `feat(web-ui): build Sovereign Archival UI, Hero X-Ray, 4-panel ZeroReject Studio, and Judge Audit Drawer`

---

## Phase 6: Final Verification & Presentation Polish
- [ ] Create Root `Makefile` for 1-command startup
- [ ] Finalize `README.md` with system diagrams and judge demo script
- [ ] Verify end-to-end user journey (upload -> reconcile -> compile -> execute -> chaos -> heal -> OTP)
- [ ] Git Commit 10: `docs(readme): finalize setup instructions, architecture diagrams, and FORGE '26 judge Q&A guide`
