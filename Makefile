.PHONY: setup install dev test lint assets audit clean dev-api dev-gov dev-web seed

VENV ?= .venv
PYTHON ?= $(VENV)/bin/python3
PIP ?= $(VENV)/bin/pip
PYTEST ?= $(VENV)/bin/pytest
PLAYWRIGHT ?= $(VENV)/bin/playwright
RUFF ?= $(VENV)/bin/ruff

setup: install assets
	@echo "==> ZeroReject (PramaanFix) environment is fully configured!"

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

assets:
	@echo "==> Generating Sovereign Archival brand assets, icons, and OG previews..."
	@$(PYTHON) scripts/generate_brand_assets.py
	@echo "==> Generating real raster sample citizen documents..."
	@$(PYTHON) scripts/generate_sample_docs.py

seed: assets

test:
	@echo "==> Running backend automated test suite with Pytest..."
	@PYTHONPATH=. $(PYTEST) apps/api/tests/ -v

lint:
	@echo "==> Running Ruff linter on Python services..."
	@$(RUFF) check .
	@echo "==> Verifying Next.js TypeScript strict types & production build..."
	@cd apps/web && npm run build

audit:
	@echo "==> Executing full Senior Engineering audit sweep (lint + test + build)..."
	@$(RUFF) check .
	@PYTHONPATH=. $(PYTEST) apps/api/tests/ -q
	@cd apps/web && npm run build
	@echo "==> Audit complete! Zero errors and zero warnings across all layers."

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
	@echo "==> Cleaning cache and temporary storage directories..."
	@rm -rf .pytest_cache .ruff_cache apps/web/.next storage/uploads/* storage/compiled/* storage/affidavits/*
