# Contributing to ZeroReject (PramaanFix)

Thank you for your interest in contributing to **ZeroReject (PramaanFix)**, an open-source civic technology platform built to eliminate bureaucratic rejection traps across digital governance portals.

---

## 1. Architectural Philosophy & Hard Rules

Before contributing code, please review our core architectural mandates:

1. **"LLMs Reason & Explain; Deterministic Tools Compute"**:
   Never use an LLM to guess phonetic similarity, compute byte dimensions, or check statutory date criteria. All calculations must be computed deterministically with an audit object:
   ```json
   { "value": 0.942, "threshold": 0.85, "passed": true, "formula_used": "...", "source_statute": "...", "timestamp_utc": "..." }
   ```
2. **Zero Dummy Data Policy**:
   No static fake objects, hardcoded sample responses, or `dummy.json` files. Everything must compute dynamically from live inputs or indexed SQLite/PostgreSQL records.
3. **100% Free AI & Local-First Stack**:
   The default installation must run completely keyless on CPU (local Tesseract/EasyOCR, BM25 RAG, ReportLab, Playwright). Optional external API keys (Groq, OpenRouter) are strictly progressive enhancements.

---

## 2. Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (Next.js 15)
- Tesseract OCR (`brew install tesseract` / `apt install tesseract-ocr`)
- Chromium for Playwright (`playwright install chromium`)

### Quickstart
```bash
# Clone the repository
git clone https://github.com/zeroreject/zeroreject.git
cd zeroreject

# Run one-command setup (creates .venv, installs dependencies, builds sample assets)
make setup

# Run test suite
make test

# Start full local development cluster
make dev
```

The services will boot across three local ports:
- **FastAPI Core API**: `http://localhost:8000`
- **Next.js 15 Web Studio**: `http://localhost:3000`
- **Standalone e-District Target Portal**: `http://localhost:8090`

---

## 3. Branching & Git Workflow

- **Branch Naming**:
  - `feat/feature-name`
  - `fix/bug-description`
  - `perf/optimization`
  - `docs/documentation-update`
  - `chore/tooling-or-deps`

- **Conventional Commits**:
  All commit messages must follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:
  - `feat(compiler): add CLAHE perspective deskewing for voter id cards`
  - `fix(reconciler): prevent index error on single-token mononyms`
  - `test(playwright): add recovery assertion for 504 gateway timeout`
  - `docs(readme): add mathematical formulation for composite phonetic scoring`

---

## 4. Linting & Code Quality Standards

Both backend and frontend must pass all verification checks with **0 errors and 0 warnings**:

```bash
# Run backend linting & format checks
ruff check .
ruff format --check .

# Run pytest automated test suite
pytest apps/api/tests/ -v

# Run Next.js production build & typecheck
cd apps/web && npm run build
```

---

## 5. Pull Request Verification Checklist

Before submitting a PR, ensure:
- [ ] Automated tests cover new logic (`apps/api/tests/`).
- [ ] No PII (Aadhaar/PAN numbers) is logged without redaction.
- [ ] All synchronous CPU-bound operations in FastAPI are wrapped in `await asyncio.to_thread(...)`.
- [ ] Magic-byte checks and upload bounds are preserved.
- [ ] `README.md` and documentation are updated if API endpoints or schemas change.
- [ ] No internal task trackers, audit scratch notes, or temporary files are committed to Git.

