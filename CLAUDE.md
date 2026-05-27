# Lions Kunsttage 2026

Jahreliche Benefizveranstaltung der Lions Villa Ludwigshöhe — digitales Kunstkatalog- und Verwaltungssystem.

## Stack
- **Backend**: FastAPI + SQLModel + SQLite (`/backend`)
- **Frontend**: Next.js (`/frontend`)
- **Python**: 3.11+

## Backend starten
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # E-Mail-Daten eintragen
uvicorn main:app --reload
```
API läuft auf http://localhost:8000 — Docs unter http://localhost:8000/docs

## Kernlogik
- Preisformel: `AUFRUNDEN(Einlieferungspreis × 1,80 ; 10)` → `services/price_service.py`
- Bildkomprimierung: max. 1500px / 500KB → `services/image_service.py`
- CSV/Excel-Import für Galerie-Künstler (~900) → `services/import_service.py`
- E-Mail-Link-Login für Künstler (48h Token) → `routers/artists.py`

## Rollen
| Rolle | Zugang |
|-------|--------|
| Admin | Alle Endpoints unter `/admin/` |
| Künstler | Login per Token-Link, nur eigene Daten |
| Besucher | Nur freigegebene Bilder, Reservierung |
| Käufer (vor Ort) | Kasse via `/kaeufe/` |

## Datenmodell
Siehe `backend/models.py` — Kernentitäten: `Kuenstler`, `Bild`, `Reservierung`, `Kauf`
