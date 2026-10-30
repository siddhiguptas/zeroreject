.PHONY: install test lint dev dev-api dev-gov dev-web seed clean

VENV ?= .venv
PYTHON ?= $(VENV)/bin/python3
PIP ?= $(VENV)/bin/pip
PYTEST ?= $(VENV)/bin/pytest
PLAYWRIGHT ?= $(VENV)/bin/playwright

install:
	@echo "==> Creating Python virtual environment..."
	@python3 -m venv $(VENV)
	@echo "==> Installing Python dependencies..."
	@$(PIP) install --upgrade pip
	@$(PIP) install -r apps/api/requirements.txt
	@echo "==> Installing Playwright Chromium browser..."
	@$(PLAYWRIGHT) install chromium
	@echo "==> Installing Web UI dependencies..."
	@cd apps/web && npm install
	@echo "==> Generating real rasterized sample citizen documents..."
	@$(PYTHON) scripts/generate_sample_docs.py
	@echo "==> Installation complete!"

seed:
	@echo "==> Generating real raster sample citizen documents..."
	@$(PYTHON) scripts/generate_sample_docs.py

test:
	@echo "==> Running backend test suite with Pytest..."
	@PYTHONPATH=. $(PYTEST) apps/api/tests/ -v

lint:
	@echo "==> Checking Python code formatting..."
	@$(PYTHON) -m py_compile apps/api/main.py
	@echo "==> Checking Next.js TypeScript types..."
	@cd apps/web && npm run build

dev-api:
	@echo "==> Starting ZeroReject FastAPI Backend on port 8000..."
	@$(PYTHON) -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload

dev-gov:
	@echo "==> Starting Standalone Government Target Portal on port 8090..."
	@$(PYTHON) -m uvicorn apps.gov_portal_target.app:app --host 0.0.0.0 --port 8090 --reload

dev-web:
	@echo "==> Starting Next.js 15 Web Application on port 3000..."
	@cd apps/web && npm run dev

dev:
	@echo "==> Launching full ZeroReject Stack (API :8000, Gov Target :8090, Web :3000)..."
	@make -j 3 dev-api dev-gov dev-web

clean:
	@echo "==> Cleaning cache directories..."
	@rm -rf .pytest_cache .ruff_cache apps/web/.next storage/uploads/* storage/compiled/* storage/affidavits/*
