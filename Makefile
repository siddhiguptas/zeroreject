.PHONY: deploy setup install dev test lint assets audit clean dev-api dev-gov dev-web seed status stop restart logs systemd-install docker-deploy docker-stop

VENV ?= .venv
PYTHON ?= $(VENV)/bin/python3
PIP ?= $(VENV)/bin/pip
PYTEST ?= $(VENV)/bin/pytest
PLAYWRIGHT ?= $(VENV)/bin/playwright
RUFF ?= $(VENV)/bin/ruff

# ==============================================================================
# One-Command Production Deployment (Ubuntu LTS / Azure VM / Cloud)
# Does not conflict with Port 8000, 5432, or 8025
# ==============================================================================
deploy:
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh

systemd-install:
	@chmod +x scripts/setup_systemd.sh
	@./scripts/setup_systemd.sh

# ==============================================================================
# Service Operations & Process Management
# ==============================================================================
status:
	@echo "==> ZeroReject Service Status Check:"
	@echo "--- Active Ports ---"
	@for p in 8001 8090 3000; do \
		if command -v lsof >/dev/null 2>&1; then \
			PID=$$(lsof -ti tcp:$$p 2>/dev/null || true); \
			if [ -n "$$PID" ]; then \
				echo "  Port $$p: RUNNING (PID $$PID)"; \
			else \
				echo "  Port $$p: STOPPED"; \
			fi; \
		else \
			echo "  Port $$p: Check with 'ss -tulpn | grep $$p'"; \
		fi; \
	done
	@echo "--- Health Endpoints ---"
	@curl -s -o /dev/null -w "  API (:8001/api/audit/telemetry) -> HTTP %{http_code}\n" http://127.0.0.1:8001/api/audit/telemetry 2>/dev/null || echo "  API (:8001) -> Inactive"
	@curl -s -o /dev/null -w "  Gov Portal (:8090)               -> HTTP %{http_code}\n" http://127.0.0.1:8090/ 2>/dev/null || echo "  Gov Portal (:8090) -> Inactive"
	@curl -s -o /dev/null -w "  Web UI (:3000)                   -> HTTP %{http_code}\n" http://127.0.0.1:3000/ 2>/dev/null || echo "  Web UI (:3000) -> Inactive"

stop:
	@echo "==> Stopping ZeroReject services..."
	@if [ -f storage/run/api.pid ]; then kill -9 $$(cat storage/run/api.pid) 2>/dev/null || true; rm -f storage/run/api.pid; fi
	@if [ -f storage/run/gov.pid ]; then kill -9 $$(cat storage/run/gov.pid) 2>/dev/null || true; rm -f storage/run/gov.pid; fi
	@if [ -f storage/run/web.pid ]; then kill -9 $$(cat storage/run/web.pid) 2>/dev/null || true; rm -f storage/run/web.pid; fi
	@for p in 8001 8090 3000; do \
		if command -v lsof >/dev/null 2>&1; then \
			PIDS=$$(lsof -ti tcp:$$p 2>/dev/null || true); \
			if [ -n "$$PIDS" ]; then kill -9 $$PIDS 2>/dev/null || true; fi; \
		fi; \
	done
	@echo "==> All ZeroReject services stopped."

restart: stop
	@echo "==> Starting ZeroReject Services in background..."
	@mkdir -p storage/logs storage/run
	@nohup $(PYTHON) -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8001 --workers 2 > storage/logs/api.log 2>&1 & echo $$! > storage/run/api.pid
	@nohup $(PYTHON) -m uvicorn apps.gov_portal_target.app:app --host 0.0.0.0 --port 8090 --workers 1 > storage/logs/gov.log 2>&1 & echo $$! > storage/run/gov.pid
	@cd apps/web && nohup npm run start -- -p 3000 -H 0.0.0.0 > ../../storage/logs/web.log 2>&1 & echo $$! > ../../storage/run/web.pid
	@sleep 2
	@make status

logs:
	@echo "==> Streaming live unified logs (Ctrl+C to exit)..."
	@tail -n 30 -f storage/logs/api.log storage/logs/gov.log storage/logs/web.log 2>/dev/null || tail -n 30 -f storage/logs/*.log

# ==============================================================================
# Docker Operations (Optional)
# ==============================================================================
docker-deploy:
	@echo "==> Building and launching ZeroReject via Docker Compose..."
	@docker compose up -d --build

docker-stop:
	@echo "==> Stopping ZeroReject Docker containers..."
	@docker compose down

# ==============================================================================
# Local Development & Setup
# ==============================================================================
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
	@cd apps/web && rm -rf .next && npm run build

audit:
	@echo "==> Executing full Senior Engineering audit sweep (lint + test + build)..."
	@$(RUFF) check .
	@PYTHONPATH=. $(PYTEST) apps/api/tests/ -q
	@cd apps/web && rm -rf .next && npm run build
	@echo "==> Audit complete! Zero errors and zero warnings across all layers."

dev-api:
	@echo "==> Starting ZeroReject FastAPI Backend on port 8001..."
	@$(PYTHON) -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8001 --reload

dev-gov:
	@echo "==> Starting Standalone Government Target Portal on port 8090..."
	@$(PYTHON) -m uvicorn apps.gov_portal_target.app:app --host 0.0.0.0 --port 8090 --reload

dev-web:
	@echo "==> Starting Next.js 15 Web Application on port 3000..."
	@cd apps/web && npm run dev

dev:
	@echo "==> Launching full ZeroReject Stack (API :8001, Gov Target :8090, Web :3000)..."
	@make -j 3 dev-api dev-gov dev-web

clean:
	@echo "==> Cleaning cache and temporary storage directories..."
	@rm -rf .pytest_cache .ruff_cache apps/web/.next storage/uploads/* storage/compiled/* storage/affidavits/*
