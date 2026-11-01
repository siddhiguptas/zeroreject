#!/usr/bin/env bash
set -e

# ==============================================================================
# ZeroReject (PramaanFix) — Autonomous Production Deployer
# Optimized for Ubuntu LTS Server (Azure / AWS / GCP / Bare Metal)
# Footprint: < 1.5 GB total disk | Memory-safe (< 250 MB idle RAM)
# Preserves existing containers on Port 8000, 5432, and 8025
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${CYAN}${BOLD}"
echo "======================================================================"
echo "    ZeroReject (PramaanFix) — One-Command Production Deployment       "
echo "======================================================================"
echo -e "${NC}"

# 1. Detect OS & Permissions
IS_LINUX=false
IS_UBUNTU=false
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    IS_LINUX=true
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "ubuntu" ]] || [[ "$ID_LIKE" == *"ubuntu"* ]] || [[ "$ID" == "debian" ]]; then
            IS_UBUNTU=true
        fi
    fi
fi

# Helper for sudo
run_sudo() {
    if [ "$EUID" -eq 0 ]; then
        "$@"
    elif command -v sudo >/dev/null 2>&1; then
        sudo "$@"
    else
        echo -e "${RED}[ERROR] Sudo is required to run: $*${NC}"
        exit 1
    fi
}

# 2. Memory & Swap Safeguard (Prevent OOM killer on standard 1-2GB RAM Azure VMs)
if [ "$IS_LINUX" = true ]; then
    TOTAL_MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
    TOTAL_SWAP_MB=$(free -m | awk '/^Swap:/{print $2}')
    
    echo -e "${CYAN}==> Checking system memory: ${TOTAL_MEM_MB}MB RAM, ${TOTAL_SWAP_MB}MB Swap...${NC}"
    if [ "$TOTAL_SWAP_MB" -lt 1024 ] && [ "$TOTAL_MEM_MB" -lt 4096 ]; then
        if [ ! -f /swapfile ]; then
            echo -e "${YELLOW}==> Low RAM detected (${TOTAL_MEM_MB}MB). Creating 2GB swapfile to prevent Next.js build OOM...${NC}"
            run_sudo fallocate -l 2G /swapfile || run_sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
            run_sudo chmod 600 /swapfile
            run_sudo mkswap /swapfile
            run_sudo swapon /swapfile
            echo -e "${GREEN}==> 2GB Swap activated successfully.${NC}"
        else
            run_sudo swapon /swapfile 2>/dev/null || true
        fi
    fi
fi

# 3. Install OS Prerequisite Packages (Ubuntu / Debian)
if [ "$IS_UBUNTU" = true ]; then
    echo -e "${CYAN}==> Ensuring OS dependencies (Tesseract OCR, Poppler, OpenCV libs)...${NC}"
    run_sudo apt-get update -qq
    run_sudo apt-get install -y -qq \
        python3-venv \
        python3-pip \
        tesseract-ocr \
        tesseract-ocr-hin \
        poppler-utils \
        libgl1 \
        libglib2.0-0 \
        curl \
        make >/dev/null 2>&1 || true

    # Open OS firewall ports if UFW is active
    if command -v ufw >/dev/null 2>&1; then
        echo -e "${CYAN}==> Configuring host firewall (UFW) for ports 3000, 8001, 8090...${NC}"
        run_sudo ufw allow 3000/tcp comment "ZeroReject Web UI" >/dev/null 2>&1 || true
        run_sudo ufw allow 8001/tcp comment "ZeroReject FastAPI Backend" >/dev/null 2>&1 || true
        run_sudo ufw allow 8090/tcp comment "ZeroReject Gov Target Portal" >/dev/null 2>&1 || true
    fi

    # Check Node.js version (require >= 18)
    NODE_VERSION=0
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    fi

    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}==> Node.js >= 18 not found (current: $(node -v 2>/dev/null || echo 'none')). Installing Node.js 20 LTS...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | run_sudo -E bash -
        run_sudo apt-get install -y -qq nodejs
    fi
fi

# 4. Auto-detect Azure Public IP / External Host
echo -e "${CYAN}==> Resolving host IP for web client binding...${NC}"
PUBLIC_IP=""
if [ "$IS_LINUX" = true ]; then
    # Try Azure Instance Metadata Service first
    PUBLIC_IP=$(curl -s -m 2 -H Metadata:true "http://169.254.169.254/metadata/instance/network/interface/0/ipv4/ipAddress/0/publicIpAddress?api-version=2021-02-01&format=text" 2>/dev/null || true)
fi

if [ -z "$PUBLIC_IP" ] || [[ "$PUBLIC_IP" == *"html"* ]] || [[ "$PUBLIC_IP" == *"{"* ]]; then
    PUBLIC_IP=$(curl -s -m 3 https://api.ipify.org 2>/dev/null || curl -s -m 3 https://ifconfig.me 2>/dev/null || echo "127.0.0.1")
fi

echo -e "${GREEN}==> Detected Public / Host IP: ${BOLD}${PUBLIC_IP}${NC}"

# 5. Prepare Configuration (.env)
echo -e "${CYAN}==> Configuring production environment (.env)...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Update or insert ports & host URLs without conflicting with 8000
sed -i.bak "s|^API_PORT=.*|API_PORT=8001|" .env 2>/dev/null || sed -i "" "s|^API_PORT=.*|API_PORT=8001|" .env
sed -i.bak "s|^GOV_PORTAL_PORT=.*|GOV_PORTAL_PORT=8090|" .env 2>/dev/null || sed -i "" "s|^GOV_PORTAL_PORT=.*|GOV_PORTAL_PORT=8090|" .env
sed -i.bak "s|^GOV_PORTAL_BASE_URL=.*|GOV_PORTAL_BASE_URL=http://localhost:8090|" .env 2>/dev/null || sed -i "" "s|^GOV_PORTAL_BASE_URL=.*|GOV_PORTAL_BASE_URL=http://localhost:8090|" .env
sed -i.bak "s|^PLAYWRIGHT_HEADLESS=.*|PLAYWRIGHT_HEADLESS=true|" .env 2>/dev/null || sed -i "" "s|^PLAYWRIGHT_HEADLESS=.*|PLAYWRIGHT_HEADLESS=true|" .env
sed -i.bak "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=|" .env 2>/dev/null || sed -i "" "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=|" .env
sed -i.bak "s|^NEXT_PUBLIC_GOV_PORTAL_URL=.*|NEXT_PUBLIC_GOV_PORTAL_URL=http://${PUBLIC_IP}:8090|" .env 2>/dev/null || sed -i "" "s|^NEXT_PUBLIC_GOV_PORTAL_URL=.*|NEXT_PUBLIC_GOV_PORTAL_URL=http://${PUBLIC_IP}:8090|" .env
rm -f .env.bak

# 6. Python Virtual Environment & Dependencies
echo -e "${CYAN}==> Setting up Python virtual environment (.venv)...${NC}"
if [ ! -d .venv ]; then
    python3 -m venv .venv
fi

.venv/bin/pip install --upgrade pip -q
echo -e "${CYAN}==> Installing backend Python dependencies...${NC}"
.venv/bin/pip install -r apps/api/requirements.txt -q

echo -e "${CYAN}==> Installing Playwright Chromium browser...${NC}"
.venv/bin/playwright install chromium
if [ "$IS_LINUX" = true ] && [ "$IS_UBUNTU" = true ]; then
    echo -e "${CYAN}==> Installing Playwright Linux OS dependencies...${NC}"
    run_sudo .venv/bin/playwright install-deps chromium >/dev/null 2>&1 || true
fi

# 7. Generate Seed Documents and Assets
echo -e "${CYAN}==> Generating Sovereign Assets & Sample Documents...${NC}"
.venv/bin/python scripts/generate_brand_assets.py
.venv/bin/python scripts/generate_sample_docs.py

# 8. Build Next.js Web Frontend
echo -e "${CYAN}==> Installing Web UI dependencies and building Next.js production bundle...${NC}"
mkdir -p storage/logs storage/run storage/uploads storage/compiled storage/affidavits
cd apps/web
export NEXT_PUBLIC_API_URL=""
export NEXT_PUBLIC_GOV_PORTAL_URL="http://${PUBLIC_IP}:8090"
export NODE_OPTIONS="--max-old-space-size=2048"
npm install --silent
npm run build
cd "$ROOT_DIR"

# 9. Stop any existing ZeroReject services
echo -e "${CYAN}==> Stopping any previously running ZeroReject instances...${NC}"
if [ -f storage/run/api.pid ]; then
    kill -9 $(cat storage/run/api.pid) 2>/dev/null || true
    rm -f storage/run/api.pid
fi
if [ -f storage/run/gov.pid ]; then
    kill -9 $(cat storage/run/gov.pid) 2>/dev/null || true
    rm -f storage/run/gov.pid
fi
if [ -f storage/run/web.pid ]; then
    kill -9 $(cat storage/run/web.pid) 2>/dev/null || true
    rm -f storage/run/web.pid
fi

# Free up ports 8001, 8090, 3000 if lingering
for p in 8001 8090 3000; do
    if command -v fuser >/dev/null 2>&1; then
        run_sudo fuser -k ${p}/tcp 2>/dev/null || true
    elif command -v lsof >/dev/null 2>&1; then
        PIDS=$(lsof -ti tcp:${p} 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            kill -9 $PIDS 2>/dev/null || true
        fi
    fi
done

# 10. Launch Background Services
echo -e "${CYAN}==> Starting ZeroReject Services in production mode...${NC}"

# Service 1: API (Port 8001)
nohup .venv/bin/python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8001 --workers 2 > storage/logs/api.log 2>&1 &
echo $! > storage/run/api.pid

# Service 2: Gov Portal Target (Port 8090)
nohup .venv/bin/python -m uvicorn apps.gov_portal_target.app:app --host 0.0.0.0 --port 8090 --workers 1 > storage/logs/gov.log 2>&1 &
echo $! > storage/run/gov.pid

# Service 3: Next.js Frontend (Port 3000)
cd apps/web
nohup npm run start -- -p 3000 -H 0.0.0.0 > ../../storage/logs/web.log 2>&1 &
echo $! > ../../storage/run/web.pid
cd "$ROOT_DIR"

# 11. Healthcheck Verification
echo -e "${CYAN}==> Verifying service health (waiting up to 15s)...${NC}"
READY=false
for i in {1..15}; do
    API_OK=$(curl -s -m 2 http://127.0.0.1:8001/api/audit/telemetry 2>/dev/null || true)
    GOV_OK=$(curl -s -m 2 http://127.0.0.1:8090/ 2>/dev/null || true)
    WEB_OK=$(curl -s -m 2 http://127.0.0.1:3000/ 2>/dev/null || true)
    
    if [ -n "$API_OK" ] && [ -n "$GOV_OK" ] && [ -n "$WEB_OK" ]; then
        READY=true
        break
    fi
    sleep 1
done

if [ "$READY" = true ]; then
    echo -e "${GREEN}${BOLD}"
    echo "======================================================================"
    echo "            ZEROREJECT DEPLOYED SUCCESSFULLY!                         "
    echo "======================================================================"
    echo -e "${NC}"
    echo -e "  ${BOLD}Web UI:${NC}        ${GREEN}http://${PUBLIC_IP}:3000${NC}"
    echo -e "  ${BOLD}API Docs:${NC}      ${GREEN}http://${PUBLIC_IP}:8001/docs${NC}"
    echo -e "  ${BOLD}Gov Portal:${NC}    ${GREEN}http://${PUBLIC_IP}:8090/?portal=e_district_income${NC}"
    echo ""
    echo -e "  ${YELLOW}Notice:${NC} Port 8000 (sewasetu-handout-app) was untouched and is intact."
    echo ""
    echo -e "${BOLD}Azure Inbound Network Security Group (NSG) Rules Required:${NC}"
    echo -e "  - ${CYAN}Port 3000 (TCP)${NC} -> Next.js Web Frontend (Public)"
    echo -e "  - ${CYAN}Port 8001 (TCP)${NC} -> ZeroReject FastAPI Backend & SSE (Public)"
    echo -e "  - ${CYAN}Port 8090 (TCP)${NC} -> Mock e-District Portal (Public)"
    echo ""
    echo -e "${BOLD}Management Commands:${NC}"
    echo -e "  - Status:  ${CYAN}make status${NC}"
    echo -e "  - Logs:    ${CYAN}make logs${NC}"
    echo -e "  - Stop:    ${CYAN}make stop${NC}"
    echo -e "  - Restart: ${CYAN}make restart${NC}"
    echo "======================================================================"
else
    echo -e "${YELLOW}==> Services launched. Checking status...${NC}"
    ps aux | grep -E "uvicorn|next-server" | grep -v grep || true
    echo -e "${YELLOW}Tip: Check storage/logs/api.log, storage/logs/gov.log, storage/logs/web.log for output.${NC}"
fi

