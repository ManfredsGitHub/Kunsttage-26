#!/bin/bash
# Deployment-Script — Kunsttage auf der Ludwigshöhe 2026
# Auf dem Server ausführen: bash deploy/deploy.sh

set -e

APP_DIR="/var/kunsttage/app"
FRONTEND_DIR="$APP_DIR/frontend"

echo "=== 1. Code aktualisieren ==="
cd "$APP_DIR"
git pull

echo "=== 2. Nginx-Konfiguration aktualisieren ==="
sudo cp deploy/nginx-kunsttage.conf /etc/nginx/sites-available/kunsttage
sudo nginx -t
sudo systemctl reload nginx

echo "=== 3. Backend-Abhängigkeiten aktualisieren ==="
cd "$APP_DIR/backend"
source .venv/bin/activate
pip install -r requirements.txt --quiet

echo "=== 4. Frontend bauen ==="
cd "$FRONTEND_DIR"

# Sicherstellen dass .env.production existiert
if [ ! -f ".env.production" ]; then
    echo "FEHLER: $FRONTEND_DIR/.env.production fehlt!"
    echo "Erstelle die Datei mit:"
    echo "  NEXT_PUBLIC_API_URL=https://kunsttage-ludwigshoehe.de/api"
    echo "  NEXT_PUBLIC_SITE_URL=https://kunsttage-ludwigshoehe.de"
    exit 1
fi

npm run build

echo "=== 5. Services neustarten ==="
sudo systemctl restart kunsttage-backend
sudo systemctl restart kunsttage-frontend

echo ""
echo "=== Deployment abgeschlossen ==="
echo "Backend:  $(sudo systemctl is-active kunsttage-backend)"
echo "Frontend: $(sudo systemctl is-active kunsttage-frontend)"
echo "Nginx:    $(sudo systemctl is-active nginx)"
