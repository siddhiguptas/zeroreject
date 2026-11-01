#!/usr/bin/env bash
set -e

# ==============================================================================
# ZeroReject Systemd Service Installer for Ubuntu LTS
# Enables automatic startup on server boot and auto-restart on crashes.
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_NAME="$(whoami)"

echo "==> Setting up systemd services for user $USER_NAME at $ROOT_DIR..."

if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# 1. API Service (Port 8001)
$SUDO bash -c "cat <<EOF > /etc/systemd/system/zeroreject-api.service
[Unit]
Description=ZeroReject FastAPI Backend Engine (Port 8001)
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$ROOT_DIR
ExecStart=$ROOT_DIR/.venv/bin/python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8001 --workers 2
Restart=always
RestartSec=3
EnvironmentFile=$ROOT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF"

# 2. Gov Portal Target Service (Port 8090)
$SUDO bash -c "cat <<EOF > /etc/systemd/system/zeroreject-gov.service
[Unit]
Description=ZeroReject Mock Government Target Portal (Port 8090)
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$ROOT_DIR
ExecStart=$ROOT_DIR/.venv/bin/python -m uvicorn apps.gov_portal_target.app:app --host 0.0.0.0 --port 8090 --workers 1
Restart=always
RestartSec=3
EnvironmentFile=$ROOT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF"

# 3. Web Service (Port 3000)
$SUDO bash -c "cat <<EOF > /etc/systemd/system/zeroreject-web.service
[Unit]
Description=ZeroReject Next.js Web Frontend (Port 3000)
After=network.target zeroreject-api.service

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$ROOT_DIR/apps/web
ExecStart=/usr/bin/npm run start -- -p 3000 -H 0.0.0.0
Restart=always
RestartSec=3
EnvironmentFile=$ROOT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF"

$SUDO systemctl daemon-reload
$SUDO systemctl enable zeroreject-api zeroreject-gov zeroreject-web
$SUDO systemctl restart zeroreject-api zeroreject-gov zeroreject-web

echo "==> ZeroReject systemd services installed and enabled on boot!"
echo "    Check status with: sudo systemctl status zeroreject-api zeroreject-web"

