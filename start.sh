#!/bin/bash
# Kunsttage auf der Ludwigshöhe — Start-Skript
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$SCRIPT_DIR/backend"
FRONTEND="$SCRIPT_DIR/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Kunsttage auf der Ludwigshöhe 2026      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Python prüfen
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}✗ Python 3 nicht gefunden. Bitte installieren: https://python.org${NC}"
  exit 1
fi
PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$(echo $PY_VERSION | cut -d. -f1)
PY_MINOR=$(echo $PY_VERSION | cut -d. -f2)
if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 11 ]; }; then
  echo -e "${RED}✗ Python 3.11+ erforderlich (gefunden: $PY_VERSION)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Python $PY_VERSION${NC}"

# Node prüfen
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js nicht gefunden. Bitte installieren: https://nodejs.org${NC}"
  exit 1
fi
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ erforderlich (gefunden: v$NODE_VERSION)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js v$NODE_VERSION${NC}"

# .env prüfen
if [ ! -f "$BACKEND/.env" ]; then
  if [ -f "$BACKEND/.env.example" ]; then
    echo -e "${YELLOW}⚠ .env fehlt — kopiere .env.example${NC}"
    cp "$BACKEND/.env.example" "$BACKEND/.env"
    echo -e "${YELLOW}  Bitte Passwörter in backend/.env eintragen, dann erneut starten.${NC}"
    exit 1
  else
    echo -e "${RED}✗ backend/.env fehlt${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}✓ .env vorhanden${NC}"

# Python venv einrichten
echo ""
echo -e "${BLUE}▶ Backend einrichten…${NC}"
cd "$BACKEND"
if [ ! -d ".venv" ]; then
  echo "  Erstelle virtuelle Umgebung…"
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python-Abhängigkeiten installiert${NC}"

# Frontend einrichten
echo ""
echo -e "${BLUE}▶ Frontend einrichten…${NC}"
cd "$FRONTEND"
if [ ! -d "node_modules" ]; then
  echo "  Installiere npm-Pakete (einmalig, braucht Internet)…"
  npm install --silent
fi
echo -e "${GREEN}✓ Node-Abhängigkeiten installiert${NC}"

# Starten
echo ""
echo -e "${BLUE}▶ Server starten…${NC}"
echo ""

# Backend im Hintergrund
cd "$BACKEND"
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend gestartet (PID $BACKEND_PID)${NC}"

# Kurz warten bis Backend bereit
sleep 2

# Frontend im Hintergrund
cd "$FRONTEND"
npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend gestartet (PID $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  System läuft!                           ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  App:    http://localhost:3000           ║${NC}"
echo -e "${GREEN}║  Admin:  http://localhost:3000/admin     ║${NC}"
echo -e "${GREEN}║  API:    http://localhost:8000/docs      ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  Zum Beenden: Ctrl+C                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Auf Ctrl+C warten und beide Prozesse beenden
trap "echo ''; echo 'Beende Server…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
