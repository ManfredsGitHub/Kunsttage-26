# Kunsttage auf der Ludwigshöhe 2026 — Projekt-Snapshot

**Stand:** 2026-06-18  
**Branch:** main  
**Commit:** ae23ce9 feat: Header sans-serif, einheitliche Schriftgröße, bessere Alt-Texte

---

## Inhaltsverzeichnis

- [Projektstruktur](#projektstruktur)
- [Konfiguration](#konfiguration)
  - [.gitignore](#gitignore)
  - [CLAUDE.md](#claudemd)
- [Backend](#backend)
  - [requirements.txt](#backendreq)
  - [.env.example](#backendenv)
  - [models.py](#backendmodels)
  - [database.py](#backenddatabase)
  - [main.py](#backendmain)
  - [Routers](#backend-routers)
  - [Services](#backend-services)
- [Frontend](#frontend)
  - [Konfiguration](#frontend-config)
  - [App — Öffentliche Seiten](#frontend-public)
  - [App — Admin-Bereich](#frontend-admin)
  - [App — Künstler-Bereich](#frontend-kuenstler)
  - [Komponenten](#frontend-components)
  - [Lib](#frontend-lib)

---

## Projektstruktur

```
Claude Lions Kunsttage 26/
├── .gitignore
├── CLAUDE.md
├── backend/
│   ├── .env.example
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── admin.py
│   │   ├── archive.py
│   │   ├── artists.py
│   │   ├── artworks.py
│   │   ├── auth.py
│   │   ├── einstellungen.py
│   │   ├── export.py
│   │   ├── merkliste.py
│   │   ├── reservations.py
│   │   └── sales.py
│   └── services/
│       ├── auth_service.py
│       ├── email_service.py
│       ├── image_service.py
│       ├── import_service.py
│       ├── price_service.py
│       └── vita_pdf_service.py
└── frontend/
    ├── middleware.ts
    ├── next.config.js
    ├── package.json
    ├── playwright.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── Providers.tsx
    │   ├── robots.ts
    │   ├── sitemap.ts
    │   ├── admin/  (bilder, import, kasse, kaufuebersicht, kaeufer,
    │   │            kuenstler, nachrichten, merklisten, archiv, export,
    │   │            login, datenschutz, impressum)
    │   ├── bilder/[id]/  (page.tsx, BildDetailClient.tsx)
    │   ├── datenschutz/
    │   ├── impressum/
    │   ├── kuenstler/  (portal, login, aufsteller, [id])
    │   ├── merkliste/  (page.tsx, abmelden/)
    │   └── veranstaltung/
    ├── components/
    │   ├── AnmeldeModal.tsx
    │   ├── BildCard.tsx
    │   ├── FilterBar.tsx
    │   ├── Header.tsx
    │   ├── KeyboardShortcuts.tsx
    │   ├── MerklisteNavLink.tsx
    │   └── MerklistenButton.tsx
    └── lib/
        ├── api.ts
        ├── auth.ts
        ├── MerklisteContext.tsx
        ├── types.ts
        └── utils.ts
```

---

## Konfiguration



### .gitignore

```text
# Python
backend/.venv/
backend/__pycache__/
backend/**/__pycache__/
backend/**/*.pyc
backend/.env
backend/.env.*

# Datenbank & Uploads (nicht im Repo)
backend/kunsttage.db
backend/uploads/

# Node
frontend/node_modules/
frontend/.next/
frontend/.env.local

# macOS
.DS_Store

# Temporär
*.log
/tmp/
```

### CLAUDE.md

```markdown
# Kunsttage auf der Ludwigshöhe 2026

Jährliche Benefizveranstaltung des Lions Club Villa Ludwigshöhe — digitales Kunstkatalog- und Verwaltungssystem.

## Stack
- **Backend**: FastAPI + SQLModel + SQLite (`/backend`)
- **Frontend**: Next.js (`/frontend`)
- **Python**: 3.11+

## Server starten

**Backend** (Terminal 1):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # SMTP-Zugangsdaten eintragen
uvicorn main:app --reload
```
API: http://localhost:8000 · Docs: http://localhost:8000/docs

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:3000

**Testdaten anlegen** (einmalig, nach Backend-Start):
```bash
cd backend && source .venv/bin/activate
python seed.py
```
Legt 3 Künstler und 10 freigegebene Bilder an (idempotent).

## Ports & URLs
| Dienst | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API-Docs (Swagger) | http://localhost:8000/docs |
| Admin-Dashboard | http://localhost:3000/admin |
| Bilder-Uploads | http://localhost:8000/uploads/ |

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

---

## Fertige Features (Stand 2026-06)

- **Bildverwaltung** mit Status-Filter (Verfügbar / Reserviert / Verkauft) · `admin/bilder`
- **CSV-Import** inkl. optionaler Felder: hoehe_cm, breite_cm, tiefe_cm, gewicht_kg, anmerkung_bild · `admin/import`
- **Vor-Ort-Kasse** mit Käufererfassung · `admin/kasse`
- **Kaufübersicht** mit Bezahlt-Toggle und Quittungsdruck · `admin/kaufuebersicht`
- **Käuferverwaltung** gruppiert nach E-Mail, aufklappbare Kaufhistorie · `admin/kaeufer`
- **Archivierung**: Nummernkreis → CSV + Bilder verschieben, aus DB löschen · `admin/archiv`
- **Rück-Import**: Archiv-CSV + Bilder zurück in die DB laden
- **Bildaufsteller** (druckfertige Schilder) · `admin/bilder/aufsteller`
- **Merkliste** für Besucher
- **Künstler-Portal** (Login per Token-Link)
- **Kommunikation / Newsletter**

## Wichtige Konventionen

### Bild-Nr. Format
- **Intern (DB)**: 7-stellig ohne Punkte, z. B. `2540001`
- **Anzeige**: `JJ.KKK.NN`, z. B. `25.400.01`
- Umwandlung: `formatBildNr()` aus `frontend/lib/utils.ts`
- Suche funktioniert mit beiden Formaten (raw in DB, formatiert in Anzeige)

### Snapshot-Felder im Kauf-Modell
Beim Archivieren werden Bilddaten in `snap_*`-Felder des Kauf-Eintrags kopiert,
damit Quittungen und Kaufübersicht auch nach der Archivierung vollständig bleiben:
```
snap_bild_nr, snap_bildtitel, snap_kuenstler, snap_bildtechnik,
snap_verkaufspreis, snap_hoehe_rahmen_cm, snap_breite_rahmen_cm, snap_genre
```
Zugriffsmuster: `(bild.bild_nr if bild else None) or kauf.snap_bild_nr`

### Archiv-Struktur
```
backend/archiv/{Jahr}/{Galerist- oder Künstlername}/
    *.jpg                  # Bilddateien
    archiv_{bild_nr}.csv   # Metadaten (importkompatibel + Käufer-Spalten)
```
Archiv-Unterverzeichnis: Galerist-Name wenn `abrechnungsempf=Galerist`, sonst Künstler-Name.

### SQLite-Migrationen
Neue Spalten werden in `database.py` per `PRAGMA table_info` + `ALTER TABLE ADD COLUMN` ergänzt (kein Alembic).

### Keyboard Shortcuts (global, nur wenn kein Input fokussiert)
- `Ctrl+A` → `/admin`
- `Ctrl+B` → `/admin/bilder`
- `Ctrl+K` → `/admin/kasse`
- `Ctrl+U` → `/admin/kaufuebersicht`
- Implementiert in `frontend/components/KeyboardShortcuts.tsx`, eingebunden in `app/layout.tsx`
```

---

## Backend


### backend/requirements.txt

```text
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlmodel==0.0.21
pillow==10.4.0
python-multipart==0.0.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
fastapi-mail==1.4.1
pandas==2.2.2
openpyxl==3.1.5
python-dotenv==1.0.1
aiofiles==24.1.0
anthropic>=0.40.0

```

### backend/.env.example

```bash
# Authentifizierung
JWT_SECRET=<zufaelliger-langer-string>
ADMIN_PASSWORT=<sicheres-admin-passwort>
ORGA_PASSWORT=<passwort-fuer-orga-team>

DATABASE_URL=sqlite:///./kunsttake.db
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Entwicklung/Test: Mailtrap Sandbox (sandbox.smtp.mailtrap.io)
# Produktion: eigener SMTP-Server oder z.B. smtp.gmail.com
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<mailtrap-oder-smtp-user>
SMTP_PASS=<mailtrap-oder-smtp-passwort>
ADMIN_EMAIL=admin@lions-kunsttage.de

```

### backend/models.py

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Genre(str, Enum):
    abstrakt = "Abstrakt"
    akt = "Akt"
    landschaft = "Landschaft"
    menschen = "Menschen"
    pfalz = "Pfalz"
    portrait = "Portrait"
    staedte = "Städte"
    stilleben = "Stilleben"
    sonstiges = "Sonstiges"


class Verfuegbarkeit(str, Enum):
    verfuegbar = "Verfügbar"
    reserviert = "Reserviert"
    verkauft = "Verkauft"


class Abrechnungsempfaenger(str, Enum):
    kuenstler = "Künstler"
    galerist = "Galerist"
    lions = "Lions"  # Altdaten — nicht mehr in UI anzeigen


class Kuenstlertyp(str, Enum):
    galerie = "galerie"
    vor_ort = "vor_ort"
    eigenbestand = "eigenbestand"



class Zahlungsart(str, Enum):
    bar = "Bar"
    kreditkarte = "Kreditkarte"
    paypal = "PayPal"
    ueberweisung = "Überweisung"


# --- Künstler ---

class KuenstlerBase(SQLModel):
    db_ident: str = Field(unique=True, index=True)
    db_name: str
    db_vorname: str
    kuenstlertyp: Kuenstlertyp = Field(default=Kuenstlertyp.vor_ort)
    kuenstler_nr: Optional[str] = Field(default=None, max_length=3, description="3-stellige externe Künstlernummer (KKK)")
    db_beruf: Optional[str] = None
    db_leben: Optional[str] = None
    db_lebenstext: Optional[str] = None
    db_kommentar: Optional[str] = None
    db_inspiration: Optional[str] = None
    db_ausstellungen: Optional[str] = None


class Kuenstler(KuenstlerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    db_email: Optional[str] = None
    db_telefon: Optional[str] = None
    db_instagram: Optional[str] = None
    db_facebook: Optional[str] = None
    db_webseite: Optional[str] = None
    db_adresse: Optional[str] = None
    db_plz: Optional[str] = None
    db_ort: Optional[str] = None
    portrait_foto: Optional[str] = None
    dsgvo_einwilligung: bool = False
    dsgvo_zeitstempel: Optional[datetime] = None
    login_token: Optional[str] = None
    login_token_expiry: Optional[datetime] = None
    aktiv: bool = True
    vor_ort_anwesend: bool = False
    ist_galerist: bool = False
    abrechnungsempf: Abrechnungsempfaenger = Field(default=Abrechnungsempfaenger.kuenstler)
    galerist_id: Optional[int] = Field(default=None, foreign_key="kuenstler.id")
    bilder: List["Bild"] = Relationship(back_populates="kuenstler")


class KuenstlerCreate(KuenstlerBase):
    db_email: Optional[str] = None
    db_telefon: Optional[str] = None
    db_adresse: Optional[str] = None


class KuenstlerPublic(KuenstlerBase):
    id: int
    kuenstler_nr: Optional[str] = None
    db_email: Optional[str] = None
    db_adresse: Optional[str] = None
    db_plz: Optional[str] = None
    db_ort: Optional[str] = None
    db_instagram: Optional[str] = None
    db_facebook: Optional[str] = None
    db_webseite: Optional[str] = None
    portrait_foto: Optional[str] = None
    aktiv: bool = True
    vor_ort_anwesend: bool = False
    ist_galerist: bool = False
    abrechnungsempf: Abrechnungsempfaenger = Abrechnungsempfaenger.kuenstler
    galerist_id: Optional[int] = None


# --- Bild ---

class BildBase(SQLModel):
    bild_nr: str = Field(unique=True, index=True)
    foto_nr: Optional[str] = None
    kuenstler_id: int = Field(foreign_key="kuenstler.id")
    bildtitel: str
    anmerkung_bild: Optional[str] = None
    bildtechnik: str
    genre: Genre
    anzahl: int = 1
    hoehe_rahmen_cm: float
    breite_rahmen_cm: float
    hoehe_cm: Optional[float] = None
    breite_cm: Optional[float] = None
    tiefe_cm: Optional[float] = None
    gewicht_kg: Optional[float] = None
    abrechnungsempf: Abrechnungsempfaenger = Abrechnungsempfaenger.kuenstler
    galerist_id: Optional[int] = None


class Bild(BildBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    einlieferungspreis: Optional[float] = None
    verkaufspreis_vorschlag: Optional[float] = None
    verkaufspreis: Optional[float] = None
    bild_url_web: Optional[str] = None
    bild_url_original: Optional[str] = None
    verfuegbarkeit: Verfuegbarkeit = Verfuegbarkeit.verfuegbar
    freigegeben: bool = False
    in_ausstellung: bool = True
    erstellt_am: datetime = Field(default_factory=datetime.utcnow)
    kuenstler: Optional[Kuenstler] = Relationship(back_populates="bilder")


class BildCreate(BildBase):
    bild_nr: Optional[str] = None  # wird auto-generiert wenn leer
    einlieferungspreis: Optional[float] = None
    verkaufspreis: Optional[float] = None


class BildPublic(BildBase):
    id: int
    einlieferungspreis: Optional[float] = None
    verkaufspreis_vorschlag: Optional[float] = None
    verkaufspreis: Optional[float] = None
    bild_url_web: Optional[str] = None
    verfuegbarkeit: Verfuegbarkeit
    freigegeben: bool = False
    in_ausstellung: bool = True
    kuenstler: Optional[KuenstlerPublic] = None
    galerist: Optional[KuenstlerPublic] = None


# --- BildFoto (max. 3 Fotos pro Bild) ---

class BildFoto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bild_id: int = Field(foreign_key="bild.id", index=True)
    url: str
    reihenfolge: int = 1


# --- Reservierung ---

class Reservierung(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bild_id: int = Field(foreign_key="bild.id")
    vorname: str
    name: str
    email: str
    telefon: Optional[str] = None
    erstellt_am: datetime = Field(default_factory=datetime.utcnow)
    storniert: bool = False


class ReservierungCreate(SQLModel):
    bild_id: int
    vorname: str
    name: str
    email: str
    telefon: Optional[str] = None


# --- Kauf (Vor-Ort-Kasse) ---

class Kauf(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bild_id: int = Field(foreign_key="bild.id")
    reservierung_id: Optional[int] = Field(default=None, foreign_key="reservierung.id")
    kaeufer_titel: Optional[str] = None
    kaeufer_vorname: str
    kaeufer_name: str
    kaeufer_strasse: str
    kaeufer_plz: str
    kaeufer_ort: str
    kaeufer_email: str
    zahlungsart: Zahlungsart
    bezahlt: bool = False
    bezahlt_am: Optional[datetime] = None
    erstellt_am: datetime = Field(default_factory=datetime.utcnow)
    # Snapshot-Felder — werden beim Archivieren befüllt
    snap_bild_nr: Optional[str] = None
    snap_bildtitel: Optional[str] = None
    snap_kuenstler: Optional[str] = None
    snap_bildtechnik: Optional[str] = None
    snap_verkaufspreis: Optional[float] = None
    snap_hoehe_rahmen_cm: Optional[float] = None
    snap_breite_rahmen_cm: Optional[float] = None
    snap_genre: Optional[str] = None


class KaufCreate(SQLModel):
    bild_id: int
    reservierung_id: Optional[int] = None
    kaeufer_titel: Optional[str] = None
    kaeufer_vorname: str
    kaeufer_name: str
    kaeufer_strasse: str
    kaeufer_plz: str
    kaeufer_ort: str
    kaeufer_email: str
    zahlungsart: Zahlungsart


# --- Merkliste ---

class Besucher(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: Optional[str] = Field(default=None, index=True)
    telefon: Optional[str] = None
    token: str = Field(unique=True, index=True)
    erstellt_am: datetime = Field(default_factory=datetime.utcnow)
    email_abgemeldet: bool = Field(default=False)
    eintraege: List["MerklisteEintrag"] = Relationship(back_populates="besucher")


class MerklisteEintrag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    besucher_id: int = Field(foreign_key="besucher.id")
    bild_id: int = Field(foreign_key="bild.id")
    hinzugefuegt_am: datetime = Field(default_factory=datetime.utcnow)
    besucher: Optional["Besucher"] = Relationship(back_populates="eintraege")


# --- Künstler-Nachrichten ---

class KuenstlerNachricht(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    betreff: str
    text: str
    erstellt_am: datetime = Field(default_factory=datetime.utcnow)
    gelesen_eintraege: List["KuenstlerNachrichtGelesen"] = Relationship(back_populates="nachricht")


class KuenstlerNachrichtGelesen(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nachricht_id: int = Field(foreign_key="kuenstlernachricht.id")
    kuenstler_id: int = Field(foreign_key="kuenstler.id")
    gelesen_am: datetime = Field(default_factory=datetime.utcnow)
    nachricht: Optional["KuenstlerNachricht"] = Relationship(back_populates="gelesen_eintraege")


# --- Seiteneinstellungen (Key-Value) ---

class Einstellung(SQLModel, table=True):
    schluessel: str = Field(primary_key=True)
    wert: str = Field(default="")

```

### backend/database.py

```python
from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kunsttage.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db():
    SQLModel.metadata.create_all(engine)
    # Spalten-Migrationen für bestehende DBs
    with engine.connect() as con:
        cols = [r[1] for r in con.exec_driver_sql("PRAGMA table_info(kuenstler)")]
        if "kuenstler_nr" not in cols:
            con.exec_driver_sql("ALTER TABLE kuenstler ADD COLUMN kuenstler_nr TEXT")
            con.commit()
        if "ist_galerist" not in cols:
            con.exec_driver_sql("ALTER TABLE kuenstler ADD COLUMN ist_galerist INTEGER DEFAULT 0")
            con.commit()
        kauf_cols = [r[1] for r in con.exec_driver_sql("PRAGMA table_info(kauf)")]
        for col, typ in [
            ("snap_bild_nr", "TEXT"), ("snap_bildtitel", "TEXT"),
            ("snap_kuenstler", "TEXT"), ("snap_bildtechnik", "TEXT"),
            ("snap_verkaufspreis", "REAL"), ("snap_hoehe_rahmen_cm", "REAL"),
            ("snap_breite_rahmen_cm", "REAL"), ("snap_genre", "TEXT"),
        ]:
            if col not in kauf_cols:
                con.exec_driver_sql(f"ALTER TABLE kauf ADD COLUMN {col} {typ}")
        besucher_cols = [r[1] for r in con.exec_driver_sql("PRAGMA table_info(besucher)")]
        if "email_abgemeldet" not in besucher_cols:
            con.exec_driver_sql("ALTER TABLE besucher ADD COLUMN email_abgemeldet INTEGER DEFAULT 0")
        # Einstellung-Tabelle wird durch SQLModel.metadata.create_all angelegt
        con.commit()


def get_session():
    with Session(engine) as session:
        yield session

```

### backend/main.py

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

from database import create_db
from routers import artworks, reservations, sales, artists, admin, merkliste, archive, export, auth as auth_router, einstellungen
from services.auth_service import verify_token

app = FastAPI(title="Kunsttage auf der Ludwigshöhe API", version="1.0.0")

app.include_router(artworks.router)
app.include_router(reservations.router)
app.include_router(sales.router)
app.include_router(artists.router)
app.include_router(admin.router)
app.include_router(merkliste.router)
app.include_router(archive.router)
app.include_router(export.router)
app.include_router(auth_router.router)
app.include_router(einstellungen.router)

# ── Auth-Middleware ───────────────────────────────────────────────────────────
# Pfade, die ohne JWT erreichbar sind
_OPEN = ("/bilder", "/uploads", "/reservierungen", "/kuenstler",
         "/merkliste", "/auth", "/docs", "/openapi.json", "/redoc", "/",
         "/einstellungen")


def _is_open(path: str) -> bool:
    return any(
        path == p or path.startswith(p + "/") or path.startswith(p + "?")
        for p in _OPEN
    )


def _orga_erlaubt(method: str, path: str) -> bool:
    """Orga darf: alle /kaeufe-Endpoints + GET /admin/bilder* (für Aufsteller)."""
    if path.startswith("/kaeufe"):
        return True
    if path.startswith("/admin/bilder") and method == "GET":
        return True
    return False


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    method = request.method

    if method == "OPTIONS" or _is_open(path):
        return await call_next(request)

    auth = request.headers.get("Authorization", "")
    token_str = auth.removeprefix("Bearer ").strip() if auth.startswith("Bearer ") else ""

    if not token_str:
        return JSONResponse({"detail": "Nicht angemeldet"}, status_code=401)

    payload = verify_token(token_str)
    if not payload:
        return JSONResponse({"detail": "Token ungültig oder abgelaufen"}, status_code=401)

    rolle = payload.get("rolle", "")

    if rolle == "admin":
        return await call_next(request)

    if rolle == "orga" and _orga_erlaubt(method, path):
        return await call_next(request)

    return JSONResponse({"detail": "Kein Zugriff"}, status_code=403)


# CORS muss nach der Auth-Middleware registriert werden, damit es auch
# 401/403-Antworten mit Access-Control-Allow-Origin versieht (Starlette:
# zuletzt registriert = außerste Schicht).
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    create_db()


@app.get("/")
def root():
    return {"status": "Kunsttage auf der Ludwigshöhe API läuft"}

```

### Backend — Routers


### backend/routers/admin.py

```python
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from sqlmodel import Session, select, func
from pydantic import BaseModel
from typing import Optional
import secrets
from datetime import datetime, timedelta
from models import Bild, BildPublic, BildFoto, Kuenstler, KuenstlerCreate, KuenstlerPublic, Reservierung, Kauf, Besucher, MerklisteEintrag, Genre, Verfuegbarkeit, Abrechnungsempfaenger, KuenstlerNachricht, KuenstlerNachrichtGelesen
from database import get_session
from services.import_service import import_csv, import_excel
from services.email_service import send_merkliste
from services.image_service import compress_image, save_image
from services.price_service import berechne_verkaufspreis
from services.vita_pdf_service import generate_vita_pdf
from fastapi.responses import Response
import csv, io

router = APIRouter(prefix="/admin", tags=["Admin"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


# --- Bilder freischalten ---

@router.patch("/bilder/{bild_id}/freigeben")
def freigeben(bild_id: int, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    bild.freigegeben = True
    session.add(bild)
    session.commit()
    return {"status": "freigegeben"}


class MassenfreigabeIn(BaseModel):
    ids: list[int]
    freigegeben: bool = True


@router.patch("/bilder/massenfreigabe")
def massenfreigabe(body: MassenfreigabeIn, session: Session = Depends(get_session)):
    bilder = session.exec(select(Bild).where(Bild.id.in_(body.ids))).all()
    for b in bilder:
        b.freigegeben = body.freigegeben
        session.add(b)
    session.commit()
    return {"freigegeben": len(bilder)}


@router.patch("/bilder/{bild_id}/preis")
def preis_setzen(bild_id: int, verkaufspreis: float, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    bild.verkaufspreis = verkaufspreis
    session.add(bild)
    session.commit()
    return {"verkaufspreis": verkaufspreis}


# --- Bild löschen ---

@router.delete("/bilder/{bild_id}")
def bild_loeschen(bild_id: int, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    session.delete(bild)
    session.commit()
    return {"status": "gelöscht"}


# --- Bild bearbeiten ---

class BildUpdate(BaseModel):
    bildtitel: Optional[str] = None
    bildtechnik: Optional[str] = None
    genre: Optional[Genre] = None
    breite_rahmen_cm: Optional[float] = None
    hoehe_rahmen_cm: Optional[float] = None
    breite_cm: Optional[float] = None
    hoehe_cm: Optional[float] = None
    tiefe_cm: Optional[float] = None
    gewicht_kg: Optional[float] = None
    einlieferungspreis: Optional[float] = None
    verkaufspreis: Optional[float] = None
    anmerkung_bild: Optional[str] = None
    foto_nr: Optional[str] = None
    in_ausstellung: Optional[bool] = None
    freigegeben: Optional[bool] = None
    abrechnungsempf: Optional[Abrechnungsempfaenger] = None
    galerist_id: Optional[int] = None


@router.patch("/bilder/{bild_id}", response_model=BildPublic)
def bild_aktualisieren(bild_id: int, update: BildUpdate, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(bild, field, value)
    if update.einlieferungspreis is not None:
        bild.verkaufspreis_vorschlag = berechne_verkaufspreis(update.einlieferungspreis)
    session.add(bild)
    session.commit()
    session.refresh(bild)
    return bild


# --- Foto-Upload ---

@router.post("/bilder/{bild_id}/foto")
async def foto_hochladen(
    bild_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    data = await file.read()
    web_bytes, orig_bytes = compress_image(data, file.filename)
    web_url, _ = save_image(web_bytes, orig_bytes, bild.bild_nr, UPLOAD_DIR)
    bild.bild_url_web = web_url
    session.add(bild)
    session.commit()
    return {"bild_url_web": web_url}


# --- Zusatz-Fotos (max. 3 gesamt) ---

@router.get("/bilder/{bild_id}/fotos")
def get_zusatz_fotos(bild_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(BildFoto).where(BildFoto.bild_id == bild_id).order_by(BildFoto.reihenfolge)
    ).all()


@router.post("/bilder/{bild_id}/fotos")
async def zusatz_foto_hochladen(
    bild_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    anzahl = session.exec(
        select(func.count(BildFoto.id)).where(BildFoto.bild_id == bild_id)
    ).one()
    belegt = anzahl + (1 if bild.bild_url_web else 0)
    if belegt >= 3:
        raise HTTPException(400, "Maximal 3 Fotos pro Bild erlaubt")

    data = await file.read()
    web_bytes, _ = compress_image(data, file.filename)
    reihenfolge = anzahl + 1
    filename = f"{bild.bild_nr}_{reihenfolge + 1}"
    web_path = os.path.join(UPLOAD_DIR, "web", f"{filename}.jpg")
    os.makedirs(os.path.dirname(web_path), exist_ok=True)
    with open(web_path, "wb") as f:
        f.write(web_bytes)
    url = f"/uploads/web/{filename}.jpg"
    foto = BildFoto(bild_id=bild_id, url=url, reihenfolge=reihenfolge)
    session.add(foto)
    session.commit()
    session.refresh(foto)
    return foto


@router.delete("/bilder/{bild_id}/fotos/{foto_id}")
def zusatz_foto_loeschen(bild_id: int, foto_id: int, session: Session = Depends(get_session)):
    foto = session.get(BildFoto, foto_id)
    if not foto or foto.bild_id != bild_id:
        raise HTTPException(404)
    path = "." + foto.url
    if os.path.exists(path):
        os.remove(path)
    session.delete(foto)
    session.commit()
    return {"status": "gelöscht"}


# --- CSV/Excel-Import ---

@router.post("/import/csv")
async def import_csv_endpoint(file: UploadFile = File(...), session: Session = Depends(get_session)):
    data = await file.read()
    return import_csv(data, session)


@router.post("/import/excel")
async def import_excel_endpoint(file: UploadFile = File(...), session: Session = Depends(get_session)):
    data = await file.read()
    return import_excel(data, session)


# --- Druckliste ---

@router.get("/druckliste")
def druckliste(session: Session = Depends(get_session)):
    bilder = session.exec(select(Bild).order_by(Bild.bild_nr)).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "Bild-Nr", "Titel", "Künstler", "Technik", "Genre",
        "Breite (cm)", "Höhe (cm)", "Preis (€)", "Status",
    ])
    for b in bilder:
        k = session.get(Kuenstler, b.kuenstler_id)
        kuenstler_name = f"{k.db_vorname} {k.db_name}" if k else "—"
        writer.writerow([
            b.bild_nr, b.bildtitel, kuenstler_name, b.bildtechnik, b.genre.value,
            b.breite_rahmen_cm, b.hoehe_rahmen_cm, b.verkaufspreis or "—", b.verfuegbarkeit.value,
        ])
    from fastapi.responses import StreamingResponse
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=druckliste.csv"},
    )


# --- Übersichten ---

@router.get("/kuenstler/alle", response_model=list[KuenstlerPublic])
def alle_kuenstler(mit_inaktiven: bool = False, session: Session = Depends(get_session)):
    q = select(Kuenstler).order_by(Kuenstler.db_name)
    if not mit_inaktiven:
        q = q.where(Kuenstler.aktiv == True)
    return session.exec(q).all()


@router.patch("/bilder/{bild_id}/ausstellung")
def ausstellung_toggle(bild_id: int, in_ausstellung: bool, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    bild.in_ausstellung = in_ausstellung
    session.add(bild)
    session.commit()
    return {"in_ausstellung": in_ausstellung}


class BildNeuData(BaseModel):
    kuenstler_id: int
    bildtitel: str
    bildtechnik: str
    genre: Genre
    breite_rahmen_cm: float = 0
    hoehe_rahmen_cm: float = 0
    einlieferungspreis: Optional[float] = None
    in_ausstellung: bool = True
    abrechnungsempf: Optional[Abrechnungsempfaenger] = None
    galerist_id: Optional[int] = None


@router.post("/bilder/neu", response_model=BildPublic)
def bild_neu(data: BildNeuData, session: Session = Depends(get_session)):
    kuenstler = session.get(Kuenstler, data.kuenstler_id)
    if not kuenstler:
        raise HTTPException(404, "Künstler nicht gefunden")
    year = datetime.now().year % 100
    if kuenstler.kuenstler_nr:
        prefix = f"{year:02d}{kuenstler.kuenstler_nr:>03s}"
        count = session.exec(select(func.count(Bild.id)).where(Bild.bild_nr.like(f"{prefix}%"))).one()
        nn = count + 1
        bild_nr = f"{prefix}{nn:02d}"
        while session.exec(select(Bild).where(Bild.bild_nr == bild_nr)).first():
            nn += 1
            bild_nr = f"{prefix}{nn:02d}"
    else:
        # Fallback wenn noch keine Künstlernummer vergeben: JJVORXXXX
        count = session.exec(select(func.count(Bild.id))).one()
        bild_nr = f"{year:02d}VOR{count+1:04d}"
        while session.exec(select(Bild).where(Bild.bild_nr == bild_nr)).first():
            count += 1
            bild_nr = f"{year:02d}VOR{count:04d}"
    b = Bild(
        bild_nr=bild_nr,
        kuenstler_id=data.kuenstler_id,
        bildtitel=data.bildtitel,
        bildtechnik=data.bildtechnik,
        genre=data.genre,
        breite_rahmen_cm=data.breite_rahmen_cm,
        hoehe_rahmen_cm=data.hoehe_rahmen_cm,
        einlieferungspreis=data.einlieferungspreis,
        verkaufspreis_vorschlag=berechne_verkaufspreis(data.einlieferungspreis) if data.einlieferungspreis else None,
        in_ausstellung=data.in_ausstellung,
    )
    session.add(b)
    session.commit()
    session.refresh(b)
    _ = b.kuenstler
    return BildPublic.model_validate(b)


@router.get("/bilder/alle", response_model=list[BildPublic])
def alle_bilder(session: Session = Depends(get_session)):
    bilder = session.exec(select(Bild).order_by(Bild.bild_nr)).all()
    result = []
    for b in bilder:
        data = BildPublic.model_validate(b)
        if b.galerist_id:
            data.galerist = session.get(Kuenstler, b.galerist_id)
        result.append(data)
    return result


@router.post("/kuenstler")
def kuenstler_anlegen(daten: KuenstlerCreate, session: Session = Depends(get_session)):
    db_ident = f"voort_{daten.db_name.lower().replace(' ', '_')}_{daten.db_vorname.lower().replace(' ', '_')}"
    # Eindeutigkeit sicherstellen
    basis = db_ident
    zähler = 1
    while session.exec(select(Kuenstler).where(Kuenstler.db_ident == db_ident)).first():
        db_ident = f"{basis}_{zähler}"
        zähler += 1
    k = Kuenstler(
        db_ident=db_ident,
        db_name=daten.db_name,
        db_vorname=daten.db_vorname,
        db_email=daten.db_email,
        db_telefon=daten.db_telefon,
        db_adresse=daten.db_adresse,
        aktiv=True,
    )
    session.add(k)
    session.commit()
    session.refresh(k)
    return {"id": k.id, "db_ident": k.db_ident}


@router.get("/kuenstler/{kuenstler_id}", response_model=KuenstlerPublic)
def kuenstler_detail(kuenstler_id: int, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    return k


@router.patch("/kuenstler/{kuenstler_id}", response_model=KuenstlerPublic)
def kuenstler_aktualisieren(kuenstler_id: int, daten: dict = Body(...), session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    felder = ["db_name","db_vorname","db_email","db_telefon","db_adresse","db_plz","db_ort",
              "db_beruf","db_leben","db_lebenstext","db_kommentar","db_inspiration","db_ausstellungen",
              "db_instagram","db_facebook","db_webseite","aktiv","vor_ort_anwesend","kuenstler_nr",
              "abrechnungsempf","galerist_id","ist_galerist","kuenstlertyp"]
    for f in felder:
        if f in daten:
            setattr(k, f, daten[f])
    session.add(k)
    session.commit()
    session.refresh(k)
    return k


@router.delete("/kuenstler/{kuenstler_id}")
def kuenstler_loeschen(kuenstler_id: int, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    bilder = session.exec(select(Bild).where(Bild.kuenstler_id == kuenstler_id)).all()
    if bilder:
        raise HTTPException(400, detail=f"Künstler hat {len(bilder)} Bild(er) — bitte zuerst alle Bilder löschen.")
    session.delete(k)
    session.commit()
    return {"status": "gelöscht"}


@router.post("/kuenstler/{kuenstler_id}/einladen")
def kuenstler_einladen(kuenstler_id: int, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    token = secrets.token_urlsafe(32)
    k.login_token = token
    k.login_token_expiry = datetime.utcnow() + timedelta(hours=48)
    session.add(k)
    session.commit()
    return {"token": token, "portal_url": f"/kuenstler/login?token={token}"}


@router.get("/kuenstler/{kuenstler_id}/vita-pdf")
def vita_pdf(kuenstler_id: int, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    bilder = session.exec(
        select(Bild).where(Bild.kuenstler_id == kuenstler_id, Bild.in_ausstellung == True)
        .order_by(Bild.bild_nr)
    ).all()
    pdf = generate_vita_pdf(k, bilder, UPLOAD_DIR)
    name = f"vita_{k.db_name}_{k.db_vorname or ''}".replace(" ", "_")
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{name}.pdf"'},
    )


@router.get("/reservierungen")
def alle_reservierungen(session: Session = Depends(get_session)):
    return session.exec(select(Reservierung).where(Reservierung.storniert == False)).all()


@router.get("/kaeufe")
def alle_kaeufe(session: Session = Depends(get_session)):
    return session.exec(select(Kauf)).all()


@router.get("/merklisten")
def alle_merklisten(session: Session = Depends(get_session)):
    besucher_liste = session.exec(
        select(Besucher).order_by(Besucher.erstellt_am.desc())
    ).all()
    result = []
    for b in besucher_liste:
        eintraege = session.exec(
            select(MerklisteEintrag)
            .where(MerklisteEintrag.besucher_id == b.id)
            .order_by(MerklisteEintrag.hinzugefuegt_am)
        ).all()
        bild_ids = [e.bild_id for e in eintraege]
        bilder = []
        for bid in bild_ids:
            bild = session.get(Bild, bid)
            if bild:
                _ = bild.kuenstler
                bilder.append(BildPublic.model_validate(bild))
        result.append({
            "id": b.id,
            "email": b.email,
            "telefon": b.telefon,
            "erstellt_am": b.erstellt_am,
            "anzahl": len(bilder),
            "bilder": bilder,
        })
    return result


@router.post("/merklisten/{besucher_id}/zusenden")
def merkliste_an_besucher_senden(besucher_id: int, session: Session = Depends(get_session)):
    besucher = session.get(Besucher, besucher_id)
    if not besucher:
        raise HTTPException(404, "Besucher nicht gefunden")
    if not besucher.email:
        raise HTTPException(400, "Keine E-Mail-Adresse hinterlegt")
    eintraege = session.exec(
        select(MerklisteEintrag)
        .where(MerklisteEintrag.besucher_id == besucher_id)
        .order_by(MerklisteEintrag.hinzugefuegt_am)
    ).all()
    if not eintraege:
        raise HTTPException(400, "Merkliste ist leer")
    bilder = []
    for e in eintraege:
        bild = session.get(Bild, e.bild_id)
        if bild:
            _ = bild.kuenstler
            bilder.append(bild)
    send_merkliste(besucher.email, bilder)
    return {"status": "gesendet", "email": besucher.email}


class NachfassData(BaseModel):
    betreff: str
    text: str


@router.post("/merklisten/nachfassen")
def merklisten_nachfassen(data: NachfassData, session: Session = Depends(get_session)):
    alle_besucher = session.exec(
        select(Besucher).where(Besucher.email != None, Besucher.email_abgemeldet == False)
    ).all()
    empfaenger = []
    for b in alle_besucher:
        hat_eintraege = session.exec(
            select(MerklisteEintrag).where(MerklisteEintrag.besucher_id == b.id)
        ).first()
        if hat_eintraege:
            empfaenger.append((b.email, b.token))
    if not empfaenger:
        raise HTTPException(400, "Keine Empfänger mit Merkliste gefunden")
    from services.email_service import send_nachfass
    send_nachfass(data.betreff, data.text, empfaenger)
    return {"status": "gesendet", "anzahl": len(empfaenger)}


# --- Besucher-Newsletter ---

@router.post("/newsletter/besucher")
def besucher_newsletter(data: NachfassData, session: Session = Depends(get_session)):
    alle = session.exec(
        select(Besucher).where(Besucher.email != None, Besucher.email_abgemeldet == False)
    ).all()
    empfaenger = [(b.email, b.token) for b in alle if b.email]
    if not empfaenger:
        raise HTTPException(400, "Keine Besucher mit E-Mail gefunden")
    from services.email_service import send_nachfass
    send_nachfass(data.betreff, data.text, empfaenger)
    return {"status": "gesendet", "anzahl": len(empfaenger)}


# --- Künstler-Nachrichten ---

class NachrichtData(BaseModel):
    betreff: str
    text: str


@router.post("/nachrichten")
def nachricht_senden(data: NachrichtData, session: Session = Depends(get_session)):
    nachricht = KuenstlerNachricht(betreff=data.betreff, text=data.text)
    session.add(nachricht)
    session.commit()
    session.refresh(nachricht)
    kuenstler_liste = session.exec(
        select(Kuenstler).where(
            Kuenstler.vor_ort_anwesend == True,
            Kuenstler.aktiv == True,
            Kuenstler.db_email != None,
        )
    ).all()
    empfaenger = [(k.db_email, None) for k in kuenstler_liste if k.db_email]
    if empfaenger:
        from services.email_service import send_nachfass
        send_nachfass(data.betreff, data.text, empfaenger)
    return {"id": nachricht.id, "anzahl": len(empfaenger)}


@router.get("/nachrichten")
def alle_nachrichten(session: Session = Depends(get_session)):
    nachrichten = session.exec(
        select(KuenstlerNachricht).order_by(KuenstlerNachricht.erstellt_am.desc())
    ).all()
    gesamt_empfaenger = session.exec(
        select(func.count(Kuenstler.id)).where(
            Kuenstler.vor_ort_anwesend == True,
            Kuenstler.aktiv == True,
            Kuenstler.db_email != None,
        )
    ).one()
    result = []
    for n in nachrichten:
        gelesen = session.exec(
            select(func.count(KuenstlerNachrichtGelesen.id))
            .where(KuenstlerNachrichtGelesen.nachricht_id == n.id)
        ).one()
        result.append({
            "id": n.id,
            "betreff": n.betreff,
            "text": n.text,
            "erstellt_am": n.erstellt_am,
            "gelesen": gelesen,
            "gesamt": gesamt_empfaenger,
        })
    return result


@router.get("/nachrichten/{nachricht_id}/ungelesen")
def nachricht_ungelesen(nachricht_id: int, session: Session = Depends(get_session)):
    nachricht = session.get(KuenstlerNachricht, nachricht_id)
    if not nachricht:
        raise HTTPException(404, "Nachricht nicht gefunden")
    gelesen_ids = session.exec(
        select(KuenstlerNachrichtGelesen.kuenstler_id)
        .where(KuenstlerNachrichtGelesen.nachricht_id == nachricht_id)
    ).all()
    kuenstler_liste = session.exec(
        select(Kuenstler).where(
            Kuenstler.vor_ort_anwesend == True,
            Kuenstler.aktiv == True,
            Kuenstler.db_email != None,
            Kuenstler.id.not_in(gelesen_ids) if gelesen_ids else True,
        )
    ).all()
    return [{"id": k.id, "name": f"{k.db_vorname} {k.db_name}", "email": k.db_email} for k in kuenstler_liste]


# --- KI-Beschreibung ---

@router.post("/bilder/{bild_id}/ai-beschreibung")
async def ai_beschreibung_generieren(bild_id: int, session: Session = Depends(get_session)):
    import anthropic
    import base64
    import mimetypes

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(503, "ANTHROPIC_API_KEY nicht konfiguriert")

    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404, "Bild nicht gefunden")

    kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild.kuenstler_id else None
    kuenstler_name = f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else "Unbekannt"

    abmasse = (
        f"{bild.breite_rahmen_cm} × {bild.hoehe_rahmen_cm} cm"
        if bild.breite_rahmen_cm and bild.hoehe_rahmen_cm else "nicht angegeben"
    )
    kuenstler_aussage = kuenstler.db_kommentar if kuenstler else None

    prompt = f"""Du bist ein erfahrener Kunstkritiker und Marketing-Texter für eine Benefiz-Kunstausstellung.

Schreibe eine kurze, einladende Beschreibung (2–3 Sätze) für folgendes Kunstwerk, die auf der Ausstellungswebsite veröffentlicht wird. Der Text soll neugierig machen und zum Kauf animieren.

Kunstwerk:
- Titel: {bild.bildtitel}
- Künstler: {kuenstler_name}
- Technik: {bild.bildtechnik}
- Genre: {bild.genre}
- Maße: {abmasse}
{f"- Aussage des Künstlers: {kuenstler_aussage}" if kuenstler_aussage else ""}

Gib nur den fertigen Beschreibungstext aus, ohne Überschrift, Einleitung oder Erklärungen. Sprache: Deutsch."""

    content: list = []

    # Alle verfügbaren Fotos hinzufügen (Hauptfoto + Zusatzfotos, max. 3)
    foto_urls = []
    if bild.bild_url_web:
        foto_urls.append(bild.bild_url_web)
    zusatz = session.exec(select(BildFoto).where(BildFoto.bild_id == bild_id).order_by(BildFoto.reihenfolge)).all()
    for z in zusatz:
        foto_urls.append(z.url)

    for foto_url in foto_urls[:3]:
        img_path = "." + foto_url
        if os.path.exists(img_path):
            with open(img_path, "rb") as f:
                img_data = base64.standard_b64encode(f.read()).decode("utf-8")
            mime = mimetypes.guess_type(img_path)[0] or "image/jpeg"
            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": mime, "data": img_data},
            })

    content.append({"type": "text", "text": prompt})

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        messages=[{"role": "user", "content": content}],
    )

    return {"beschreibung": response.content[0].text.strip()}

```

### backend/routers/archive.py

```python
import os
import csv
import io
import shutil
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from models import Bild, Kuenstler, Kauf
from database import get_session
from services.import_service import import_csv as _import_csv

router = APIRouter(prefix="/admin/archiv", tags=["Archiv"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
ARCHIV_DIR = os.getenv("ARCHIV_DIR", "./archiv")


def _prafix_zu_raw(prafix: str) -> str:
    """'25.' → '25'  |  '25.400.' → '25400'"""
    return prafix.replace(".", "")


def _jahr_aus_prafix(prafix: str) -> str:
    """'25.' oder '25.400.' → '2025'"""
    digits = prafix.replace(".", "")[:2]
    return f"20{digits}"


def _ordner_name(kuenstler: Kuenstler | None, galerist: Kuenstler | None) -> str:
    if galerist:
        return re.sub(r"[^\w\-]", "_", f"{galerist.db_name}_{galerist.db_vorname}".strip("_"))
    if kuenstler:
        return re.sub(r"[^\w\-]", "_", f"{kuenstler.db_name}_{kuenstler.db_vorname}".strip("_"))
    return "_unbekannt"


def _bilder_fuer_prafix(prafix: str, session: Session) -> list[Bild]:
    raw = _prafix_zu_raw(prafix)
    alle = session.exec(select(Bild).order_by(Bild.bild_nr)).all()
    return [b for b in alle if b.bild_nr.startswith(raw)]


@router.get("/vorschau")
def vorschau(prafix: str, session: Session = Depends(get_session)):
    if not prafix or not re.match(r"^\d{2}(\.\d{3})?\.?$", prafix):
        raise HTTPException(400, "Präfix muss '25.' oder '25.400.' sein")
    bilder = _bilder_fuer_prafix(prafix, session)
    gruppen: dict[str, int] = {}
    for b in bilder:
        kuenstler = session.get(Kuenstler, b.kuenstler_id)
        galerist = session.get(Kuenstler, b.galerist_id) if b.galerist_id else None
        name = _ordner_name(kuenstler, galerist)
        gruppen[name] = gruppen.get(name, 0) + 1
    return {
        "prafix": prafix,
        "jahr": _jahr_aus_prafix(prafix),
        "anzahl": len(bilder),
        "gruppen": [{"name": k, "anzahl": v} for k, v in sorted(gruppen.items())],
    }


@router.get("/liste")
def archiv_liste():
    if not os.path.exists(ARCHIV_DIR):
        return []
    result = []
    for jahr in sorted(os.listdir(ARCHIV_DIR)):
        jahr_pfad = os.path.join(ARCHIV_DIR, jahr)
        if not os.path.isdir(jahr_pfad):
            continue
        csvs = sorted(f for f in os.listdir(jahr_pfad) if f.endswith(".csv"))
        for csv_datei in csvs:
            # Zeilenanzahl zählen
            with open(os.path.join(jahr_pfad, csv_datei), encoding="utf-8-sig") as f:
                anzahl = sum(1 for _ in f) - 1  # minus Header
            result.append({
                "jahr": jahr,
                "datei": csv_datei,
                "pfad": f"{jahr}/{csv_datei}",
                "anzahl": max(anzahl, 0),
            })
    return result


class ReimportRequest(BaseModel):
    pfad: str  # relativ zu ARCHIV_DIR, z. B. "2025/archiv_25.csv"


@router.post("/reimport")
def archiv_reimport(req: ReimportRequest, session: Session = Depends(get_session)):
    csv_pfad = os.path.join(ARCHIV_DIR, req.pfad)
    if not os.path.exists(csv_pfad):
        raise HTTPException(404, "Archiv-Datei nicht gefunden")

    jahr_dir = os.path.dirname(csv_pfad)

    # 1. Daten in DB importieren (bestehende Import-Logik)
    with open(csv_pfad, "rb") as f:
        data = f.read()
    import_result = _import_csv(data, session)

    # 2. Bilddateien zurück nach uploads/ verschieben und URLs in DB setzen
    with open(csv_pfad, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    dateien_zurueck = 0
    datei_fehler = []
    os.makedirs(os.path.join(UPLOAD_DIR, "web"), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_DIR, "original"), exist_ok=True)

    for row in rows:
        bild_nr = row.get("bild_nr", "").strip()
        bild_dateiname = row.get("bild_dateiname", "").strip()
        if not bild_nr or not bild_dateiname:
            continue

        # Datei in Unterverzeichnissen des Archivjahrs suchen
        gefunden = False
        for entry in os.scandir(jahr_dir):
            if not entry.is_dir():
                continue
            src_web = os.path.join(entry.path, bild_dateiname)
            if not os.path.exists(src_web):
                continue

            ziel_web = os.path.join(UPLOAD_DIR, "web", bild_dateiname)
            shutil.move(src_web, ziel_web)
            dateien_zurueck += 1

            orig_name = os.path.splitext(bild_dateiname)[0] + "_orig"
            src_orig = os.path.join(entry.path, orig_name)
            ziel_orig = os.path.join(UPLOAD_DIR, "original", orig_name)
            hat_orig = False
            if os.path.exists(src_orig):
                shutil.move(src_orig, ziel_orig)
                dateien_zurueck += 1
                hat_orig = True

            # URLs im DB-Eintrag setzen
            bild = session.exec(select(Bild).where(Bild.bild_nr == bild_nr)).first()
            if bild:
                bild.bild_url_web = f"/uploads/web/{bild_dateiname}"
                if hat_orig:
                    bild.bild_url_original = f"/uploads/original/{orig_name}"
                session.add(bild)

            gefunden = True
            break

        if not gefunden:
            datei_fehler.append(f"{bild_nr}: '{bild_dateiname}' nicht im Archiv gefunden")

    session.commit()
    return {
        "importiert": import_result["importiert"],
        "import_fehler": import_result["fehler"],
        "dateien_zurueck": dateien_zurueck,
        "datei_fehler": datei_fehler,
    }


class ArchivRequest(BaseModel):
    prafix: str


@router.post("/erstellen")
def archiv_erstellen(req: ArchivRequest, session: Session = Depends(get_session)):
    prafix = req.prafix
    if not prafix or not re.match(r"^\d{2}(\.\d{3})?\.?$", prafix):
        raise HTTPException(400, "Präfix muss '25.' oder '25.400.' sein")

    bilder = _bilder_fuer_prafix(prafix, session)
    if not bilder:
        raise HTTPException(404, "Keine Bilder für dieses Präfix gefunden")

    jahr = _jahr_aus_prafix(prafix)
    archiv_basis = os.path.join(ARCHIV_DIR, jahr)
    os.makedirs(archiv_basis, exist_ok=True)

    # CSV aufbauen (Import-Spalten + Käuferdaten für verkaufte Bilder)
    csv_buf = io.StringIO()
    writer = csv.writer(csv_buf)
    writer.writerow([
        "bild_nr", "kuenstler_name", "kuenstler_vorname",
        "bildtitel", "bildtechnik", "genre",
        "hoehe_rahmen_cm", "breite_rahmen_cm",
        "hoehe_cm", "breite_cm", "tiefe_cm", "gewicht_kg",
        "anmerkung_bild",
        "einlieferungspreis", "verkaufspreis",
        "abrechnungsempf", "bild_dateiname",
        "galerist_name", "galerist_vorname",
        # Käufer-Spalten (nur bei verkauften Bildern befüllt)
        "kaeufer_titel", "kaeufer_vorname", "kaeufer_name",
        "kaeufer_strasse", "kaeufer_plz", "kaeufer_ort", "kaeufer_email",
        "zahlungsart", "bezahlt", "kauf_datum",
    ])

    verschoben = 0
    fehler = []

    for b in bilder:
        kuenstler = session.get(Kuenstler, b.kuenstler_id)
        galerist = session.get(Kuenstler, b.galerist_id) if b.galerist_id else None
        kuenstler_name = f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else ""
        ordner = _ordner_name(kuenstler, galerist)
        ziel_dir = os.path.join(archiv_basis, ordner)
        os.makedirs(ziel_dir, exist_ok=True)

        # Bilddateien verschieben
        bild_dateiname = ""
        for src_rel in [b.bild_url_web, b.bild_url_original]:
            if not src_rel:
                continue
            src_path = os.path.join(os.path.dirname(UPLOAD_DIR), src_rel.lstrip("/"))
            if os.path.exists(src_path):
                dateiname = os.path.basename(src_path)
                ziel_path = os.path.join(ziel_dir, dateiname)
                try:
                    shutil.move(src_path, ziel_path)
                    if src_rel == b.bild_url_web:
                        bild_dateiname = dateiname
                    verschoben += 1
                except Exception as e:
                    fehler.append(f"{b.bild_nr}: {e}")

        # Käufe für dieses Bild suchen und Snapshots setzen
        kaeufe = session.exec(select(Kauf).where(Kauf.bild_id == b.id)).all()
        kauf_csv = ["", "", "", "", "", "", "", "", "", ""]  # leere Käufer-Spalten
        for kauf in kaeufe:
            # Snapshot-Felder in Kauf befüllen
            kauf.snap_bild_nr = b.bild_nr
            kauf.snap_bildtitel = b.bildtitel
            kauf.snap_kuenstler = kuenstler_name
            kauf.snap_bildtechnik = b.bildtechnik
            kauf.snap_verkaufspreis = b.verkaufspreis
            kauf.snap_hoehe_rahmen_cm = b.hoehe_rahmen_cm
            kauf.snap_breite_rahmen_cm = b.breite_rahmen_cm
            kauf.snap_genre = b.genre.value
            session.add(kauf)
            # Käuferdaten für CSV (letzter/einziger Kauf)
            kauf_csv = [
                kauf.kaeufer_titel or "", kauf.kaeufer_vorname, kauf.kaeufer_name,
                kauf.kaeufer_strasse, kauf.kaeufer_plz, kauf.kaeufer_ort, kauf.kaeufer_email,
                kauf.zahlungsart.value, "Ja" if kauf.bezahlt else "Nein",
                kauf.erstellt_am.strftime("%d.%m.%Y") if kauf.erstellt_am else "",
            ]

        # CSV-Zeile
        writer.writerow([
            b.bild_nr,
            kuenstler.db_name if kuenstler else "",
            kuenstler.db_vorname if kuenstler else "",
            b.bildtitel, b.bildtechnik, b.genre.value,
            b.hoehe_rahmen_cm, b.breite_rahmen_cm,
            b.hoehe_cm or "", b.breite_cm or "",
            b.tiefe_cm or "", b.gewicht_kg or "",
            b.anmerkung_bild or "",
            b.einlieferungspreis or "", b.verkaufspreis or "",
            b.abrechnungsempf.value, bild_dateiname,
            galerist.db_name if galerist else "",
            galerist.db_vorname if galerist else "",
        ] + kauf_csv)

        # Bild aus DB löschen
        session.delete(b)

    # CSV speichern
    raw = _prafix_zu_raw(prafix)
    csv_pfad = os.path.join(archiv_basis, f"archiv_{raw}.csv")
    with open(csv_pfad, "w", encoding="utf-8-sig", newline="") as f:
        f.write(csv_buf.getvalue())

    session.commit()

    return {
        "archiviert": len(bilder),
        "dateien_verschoben": verschoben,
        "zielverzeichnis": archiv_basis,
        "csv": csv_pfad,
        "fehler": fehler,
    }

```

### backend/routers/artists.py

```python
import logging
import os
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select, func
from pydantic import BaseModel
from typing import Optional
from models import Kuenstler, KuenstlerCreate, KuenstlerPublic, Bild, BildPublic, Genre, Abrechnungsempfaenger, KuenstlerNachricht, KuenstlerNachrichtGelesen
from database import get_session
from services import email_service
from services.image_service import compress_image, save_image
from services.price_service import berechne_verkaufspreis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kuenstler", tags=["Künstler"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


@router.get("/", response_model=list[KuenstlerPublic])
def list_kuenstler(session: Session = Depends(get_session)):
    # Nur Künstler mit mindestens einem freigegebenen Bild mit Foto
    mit_bild = select(Bild.kuenstler_id).where(
        Bild.freigegeben == True,
        Bild.bild_url_web != None,
    ).distinct()
    return session.exec(
        select(Kuenstler).where(
            Kuenstler.aktiv == True,
            Kuenstler.id.in_(mit_bild),
        )
    ).all()


@router.get("/{kuenstler_id}", response_model=KuenstlerPublic)
def get_kuenstler(kuenstler_id: int, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    return k


@router.post("/einladen")
def einladen(kuenstler_id: int, session: Session = Depends(get_session)):
    """Admin: E-Mail-Login-Link an Künstler senden."""
    k = session.get(Kuenstler, kuenstler_id)
    if not k or not k.db_email:
        raise HTTPException(404, "Künstler oder E-Mail nicht gefunden")

    token = secrets.token_urlsafe(32)
    k.login_token = token
    k.login_token_expiry = datetime.utcnow() + timedelta(hours=48)
    session.add(k)
    session.commit()

    try:
        email_service.send_kuenstler_login(k.db_email, k.db_vorname, token)
    except Exception as exc:
        logger.warning("E-Mail-Versand fehlgeschlagen: %s", exc)
    return {"status": "eingeladen"}


@router.post("/login-link-anfordern")
def login_link_anfordern(data: dict, session: Session = Depends(get_session)):
    """Künstler fordert neuen Login-Link per E-Mail an."""
    email = (data.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(400, "E-Mail erforderlich")
    k = session.exec(select(Kuenstler).where(Kuenstler.db_email == email, Kuenstler.aktiv == True)).first()
    if not k:
        # Keine Fehlermeldung um E-Mail-Enumeration zu vermeiden
        return {"status": "gesendet"}
    token = secrets.token_urlsafe(32)
    k.login_token = token
    k.login_token_expiry = datetime.utcnow() + timedelta(hours=48)
    session.add(k)
    session.commit()
    try:
        email_service.send_kuenstler_login(k.db_email, k.db_vorname or k.db_name, token)
    except Exception as exc:
        logger.warning("E-Mail-Versand fehlgeschlagen: %s", exc)
    return {"status": "gesendet"}


@router.get("/login/verify")
def verify_token(token: str, session: Session = Depends(get_session)):
    k = session.exec(
        select(Kuenstler).where(Kuenstler.login_token == token)
    ).first()
    if not k or not k.login_token_expiry or k.login_token_expiry < datetime.utcnow():
        raise HTTPException(401, "Token ungültig oder abgelaufen")
    return {"kuenstler_id": k.id, "name": f"{k.db_vorname} {k.db_name}"}


@router.patch("/{kuenstler_id}/profil")
def profil_aktualisieren(
    kuenstler_id: int,
    daten: dict,
    session: Session = Depends(get_session),
):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    erlaubt = {"db_beruf", "db_leben", "db_kommentar", "db_ausstellungen", "db_adresse", "db_email", "db_instagram", "db_facebook", "db_webseite"}
    for key, val in daten.items():
        if key in erlaubt:
            setattr(k, key, val)
    session.add(k)
    session.commit()
    return {"status": "aktualisiert"}


@router.patch("/{kuenstler_id}/dsgvo")
def dsgvo_einwilligung(kuenstler_id: int, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    k.dsgvo_einwilligung = True
    k.dsgvo_zeitstempel = datetime.utcnow()
    session.add(k)
    session.commit()
    return {"status": "einwilligung_erteilt", "zeitstempel": k.dsgvo_zeitstempel}


class BildEinreichungData(BaseModel):
    bildtitel: str
    bildtechnik: str
    genre: Genre
    breite_rahmen_cm: float = 0
    hoehe_rahmen_cm: float = 0
    einlieferungspreis: Optional[float] = None
    anmerkung_bild: Optional[str] = None
    abrechnungsempf: Optional[Abrechnungsempfaenger] = None
    galerist_id: Optional[int] = None


def _generiere_bild_nr(kuenstler: Kuenstler, session: Session) -> str:
    if not kuenstler.kuenstler_nr:
        raise HTTPException(400, "Keine Künstlernummer hinterlegt — bitte Admin kontaktieren")
    year = datetime.now().year % 100
    prefix = f"{year:02d}{kuenstler.kuenstler_nr:>03s}"
    count = session.exec(select(func.count(Bild.id)).where(Bild.bild_nr.like(f"{prefix}%"))).one()
    nn = count + 1
    bild_nr = f"{prefix}{nn:02d}"
    while session.exec(select(Bild).where(Bild.bild_nr == bild_nr)).first():
        nn += 1
        bild_nr = f"{prefix}{nn:02d}"
    return bild_nr


@router.get("/{kuenstler_id}/bilder", response_model=list[BildPublic])
def kuenstler_bilder(kuenstler_id: int, session: Session = Depends(get_session)):
    bilder = session.exec(
        select(Bild).where(Bild.kuenstler_id == kuenstler_id).order_by(Bild.bild_nr)
    ).all()
    return [BildPublic.model_validate(b) for b in bilder]


@router.post("/{kuenstler_id}/bilder", response_model=BildPublic)
def bild_einreichen(kuenstler_id: int, data: BildEinreichungData, session: Session = Depends(get_session)):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404, "Künstler nicht gefunden")
    bild_nr = _generiere_bild_nr(k, session)
    b = Bild(
        bild_nr=bild_nr,
        kuenstler_id=kuenstler_id,
        bildtitel=data.bildtitel,
        bildtechnik=data.bildtechnik,
        genre=data.genre,
        breite_rahmen_cm=data.breite_rahmen_cm,
        hoehe_rahmen_cm=data.hoehe_rahmen_cm,
        einlieferungspreis=data.einlieferungspreis,
        verkaufspreis_vorschlag=berechne_verkaufspreis(data.einlieferungspreis) if data.einlieferungspreis else None,
        anmerkung_bild=data.anmerkung_bild,
        abrechnungsempf=data.abrechnungsempf,
        galerist_id=data.galerist_id,
        freigegeben=False,
        in_ausstellung=True,
    )
    session.add(b)
    session.commit()
    session.refresh(b)
    return BildPublic.model_validate(b)


@router.post("/{kuenstler_id}/bilder/{bild_id}/foto")
async def bild_foto_hochladen(
    kuenstler_id: int, bild_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    b = session.get(Bild, bild_id)
    if not b or b.kuenstler_id != kuenstler_id:
        raise HTTPException(404)
    data = await file.read()
    web_bytes, orig_bytes = compress_image(data, file.filename)
    web_url, orig_url = save_image(web_bytes, orig_bytes, b.bild_nr, UPLOAD_DIR)
    b.bild_url_web = web_url
    b.bild_url_original = orig_url
    session.add(b)
    session.commit()
    return {"bild_url_web": web_url}


@router.delete("/{kuenstler_id}/bilder/{bild_id}")
def bild_zurueckziehen(kuenstler_id: int, bild_id: int, session: Session = Depends(get_session)):
    b = session.get(Bild, bild_id)
    if not b or b.kuenstler_id != kuenstler_id:
        raise HTTPException(404)
    if b.freigegeben:
        raise HTTPException(400, "Freigegebene Bilder können nicht zurückgezogen werden")
    session.delete(b)
    session.commit()
    return {"status": "gelöscht"}


@router.get("/{kuenstler_id}/nachrichten")
def kuenstler_nachrichten(kuenstler_id: int, session: Session = Depends(get_session)):
    session.get(Kuenstler, kuenstler_id) or (_ for _ in ()).throw(HTTPException(404))
    nachrichten = session.exec(
        select(KuenstlerNachricht).order_by(KuenstlerNachricht.erstellt_am.desc())
    ).all()
    gelesen_ids = set(session.exec(
        select(KuenstlerNachrichtGelesen.nachricht_id)
        .where(KuenstlerNachrichtGelesen.kuenstler_id == kuenstler_id)
    ).all())
    return [
        {"id": n.id, "betreff": n.betreff, "text": n.text,
         "erstellt_am": n.erstellt_am, "gelesen": n.id in gelesen_ids}
        for n in nachrichten
    ]


@router.post("/{kuenstler_id}/nachrichten/{nachricht_id}/gelesen")
def nachricht_gelesen(kuenstler_id: int, nachricht_id: int, session: Session = Depends(get_session)):
    exists = session.exec(
        select(KuenstlerNachrichtGelesen).where(
            KuenstlerNachrichtGelesen.kuenstler_id == kuenstler_id,
            KuenstlerNachrichtGelesen.nachricht_id == nachricht_id,
        )
    ).first()
    if not exists:
        session.add(KuenstlerNachrichtGelesen(kuenstler_id=kuenstler_id, nachricht_id=nachricht_id))
        session.commit()
    return {"status": "ok"}


@router.post("/{kuenstler_id}/portrait")
async def portrait_hochladen(
    kuenstler_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    k = session.get(Kuenstler, kuenstler_id)
    if not k:
        raise HTTPException(404)
    data = await file.read()
    web_bytes, orig_bytes = compress_image(data, file.filename)
    web_url, _ = save_image(web_bytes, orig_bytes, f"portrait_{kuenstler_id}", UPLOAD_DIR)
    k.portrait_foto = web_url
    session.add(k)
    session.commit()
    return {"portrait_foto": web_url}

```

### backend/routers/artworks.py

```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlmodel import Session, select, func
from typing import Optional
from datetime import datetime
from models import Bild, BildCreate, BildPublic, BildFoto, Verfuegbarkeit, Genre
from database import get_session
from services.image_service import compress_image, save_image
from services.price_service import berechne_verkaufspreis
import os

router = APIRouter(prefix="/bilder", tags=["Bilder"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


@router.get("/", response_model=list[BildPublic])
def list_bilder(
    genre: Optional[Genre] = None,
    technik: Optional[str] = None,
    kuenstler_id: Optional[int] = None,
    nur_verfuegbar: bool = True,
    session: Session = Depends(get_session),
):
    q = select(Bild).where(Bild.freigegeben == True, Bild.bild_url_web != None)
    if nur_verfuegbar:
        q = q.where(Bild.verfuegbarkeit == Verfuegbarkeit.verfuegbar)
    if genre:
        q = q.where(Bild.genre == genre)
    if technik:
        q = q.where(Bild.bildtechnik.ilike(f"%{technik}%"))
    if kuenstler_id:
        q = q.where(Bild.kuenstler_id == kuenstler_id)
    return session.exec(q).all()


@router.get("/{bild_id}", response_model=BildPublic)
def get_bild(bild_id: int, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild or not bild.freigegeben:
        raise HTTPException(404, "Bild nicht gefunden")
    return bild


@router.get("/{bild_id}/fotos")
def get_bild_fotos(bild_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(BildFoto).where(BildFoto.bild_id == bild_id).order_by(BildFoto.reihenfolge)
    ).all()


def _generiere_bild_nr(kuenstler_id: int, session: Session) -> str:
    from models import Kuenstler
    from fastapi import HTTPException
    kuenstler = session.get(Kuenstler, kuenstler_id)
    if not kuenstler or not kuenstler.kuenstler_nr:
        raise HTTPException(400, f"Künstler {kuenstler_id} hat keine Künstlernummer (KKK) hinterlegt")
    year = datetime.now().year % 100
    prefix = f"{year:02d}{kuenstler.kuenstler_nr:>03s}"  # z.B. "26105"
    count = session.exec(
        select(func.count(Bild.id)).where(Bild.bild_nr.like(f"{prefix}%"))
    ).one()
    nn = count + 1
    bild_nr = f"{prefix}{nn:02d}"
    while session.exec(select(Bild).where(Bild.bild_nr == bild_nr)).first():
        nn += 1
        bild_nr = f"{prefix}{nn:02d}"
    return bild_nr


@router.post("/", response_model=BildPublic)
def create_bild(bild: BildCreate, session: Session = Depends(get_session)):
    if not bild.bild_nr:
        bild.bild_nr = _generiere_bild_nr(bild.kuenstler_id, session)
    db_bild = Bild.model_validate(bild)
    if bild.einlieferungspreis and not bild.verkaufspreis:
        db_bild.verkaufspreis_vorschlag = berechne_verkaufspreis(bild.einlieferungspreis)
    session.add(db_bild)
    session.commit()
    session.refresh(db_bild)
    return db_bild


@router.post("/{bild_id}/bild-upload")
async def upload_bild(
    bild_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404, "Bild nicht gefunden")

    data = await file.read()
    web_bytes, orig_bytes = compress_image(data, file.filename)
    web_url, orig_url = save_image(web_bytes, orig_bytes, bild.bild_nr, UPLOAD_DIR)

    bild.bild_url_web = web_url
    bild.bild_url_original = orig_url
    session.add(bild)
    session.commit()
    return {"bild_url_web": web_url}

```

### backend/routers/auth.py

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.auth_service import create_token, check_passwort

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    rolle: str   # "admin" | "orga"
    passwort: str


@router.post("/login")
def login(req: LoginRequest):
    if req.rolle not in ("admin", "orga"):
        raise HTTPException(status_code=400, detail="Unbekannte Rolle")
    if not check_passwort(req.rolle, req.passwort):
        raise HTTPException(status_code=401, detail="Falsches Passwort")
    stunden = 24 if req.rolle == "admin" else 12
    token = create_token(req.rolle, stunden=stunden)
    return {"token": token, "rolle": req.rolle, "stunden": stunden}

```

### backend/routers/einstellungen.py

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from models import Einstellung
from database import get_session

router = APIRouter(tags=["Einstellungen"])

DATENSCHUTZ_DEFAULT = """Datenschutzerklärung

Stand: Juni 2026

1. Verantwortlicher

Lions Club Villa Ludwigshöhe e.V.
c/o [Ansprechpartner Name]
[Straße und Hausnummer]
76829 Landau in der Pfalz
E-Mail: [email@example.de]


2. Welche Daten wir verarbeiten und warum

a) Besucher (Merkliste)
Wenn Sie eine Merkliste anlegen, speichern wir Ihre E-Mail-Adresse oder Telefonnummer sowie Ihre Favoritenliste. Diese Daten werden ausschließlich verwendet, um Ihnen Ihre Merkliste zuzusenden und Sie bei Bedarf über die Verfügbarkeit der gemerkten Werke zu informieren.
Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
Speicherdauer: Bis zu 12 Monate nach Veranstaltungsende oder bis zum Widerruf der Einwilligung.
Sie können sich jederzeit über den Abmelde-Link in unseren E-Mails oder per Kontaktaufnahme abmelden.

b) Käufer und Reservierungen
Beim Kauf oder der Reservierung eines Werkes erheben wir Ihren Namen, Ihre Anschrift und E-Mail-Adresse sowie die Zahlungsart. Diese Daten werden zur Abwicklung des Kaufvertrags und zur Ausstellung einer Quittung benötigt.
Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
Speicherdauer: 10 Jahre (handels- und steuerrechtliche Aufbewahrungspflicht).

c) Künstler
Von teilnehmenden Künstlerinnen und Künstlern verarbeiten wir Namen, Kontaktdaten, Vita, Portrait-Foto sowie Abbildungen der eingereichten Werke. Diese werden für den Kunstkatalog, die Ausstellungswebseite und Druckmaterialien der Veranstaltung verwendet.
Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
Die Einwilligung kann jederzeit widerrufen werden. Bei Widerruf werden die Daten aus dem öffentlichen Bereich entfernt.


3. Cookies

Diese Website verwendet einen technisch notwendigen Cookie (»kt_auth«) zur Verwaltung von Anmeldungen für Veranstalter und Künstler. Dieser Cookie enthält keinerlei Tracking-Informationen und ist für den Betrieb der Seite erforderlich. Eine Einwilligung ist hierfür nicht erforderlich (§ 25 Abs. 2 TTDSG).


4. Weitergabe an Dritte

Ihre Daten werden nicht an Dritte verkauft oder zu Werbezwecken weitergegeben. Eine Weitergabe erfolgt ausschließlich, wenn dies zur Vertragserfüllung erforderlich ist (z.B. E-Mail-Versand über unseren SMTP-Dienstleister).


5. Ihre Rechte

Sie haben das Recht auf:
• Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)
• Berichtigung unrichtiger Daten (Art. 16 DSGVO)
• Löschung Ihrer Daten (Art. 17 DSGVO)
• Einschränkung der Verarbeitung (Art. 18 DSGVO)
• Datenübertragbarkeit (Art. 20 DSGVO)
• Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)
• Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)

Zur Ausübung Ihrer Rechte wenden Sie sich an: [email@example.de]


6. Beschwerderecht

Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren:

Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz
Hintere Bleiche 34
55116 Mainz
https://www.datenschutz.rlp.de"""

IMPRESSUM_DEFAULT = """Impressum

Verantwortlich für den Inhalt:
Lions Club Villa Ludwigshöhe
c/o [Ansprechpartner Name]
[Straße und Hausnummer]
76829 Landau in der Pfalz

Kontakt:
E-Mail: [email@example.de]
Telefon: [+49 ...]

Veranstaltung:
Kunsttage auf der Ludwigshöhe 2026
Schloss Villa Ludwigshöhe
Villastraße 65
67480 Edenkoben

Verein:
Lions Club Villa Ludwigshöhe e.V.
Registergericht: Amtsgericht Landau
Registernummer: [VR ...]

Alle Erlöse aus dem Kunstverkauf fließen in voller Höhe in gemeinnützige Projekte der Lions Clubs der Südpfalz.

Haftungshinweis:
Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich."""


class EinstellungUpdate(BaseModel):
    text: str


def _lesen(schluessel: str, default: str, session: Session) -> dict:
    eintrag = session.get(Einstellung, schluessel)
    return {"text": eintrag.wert if eintrag else default}


def _speichern(schluessel: str, text: str, session: Session) -> dict:
    eintrag = session.get(Einstellung, schluessel)
    if eintrag:
        eintrag.wert = text
    else:
        eintrag = Einstellung(schluessel=schluessel, wert=text)
    session.add(eintrag)
    session.commit()
    return {"status": "gespeichert"}


@router.get("/einstellungen/impressum")
def impressum_lesen(session: Session = Depends(get_session)):
    return _lesen("impressum", IMPRESSUM_DEFAULT, session)


@router.put("/admin/einstellungen/impressum")
def impressum_speichern(data: EinstellungUpdate, session: Session = Depends(get_session)):
    return _speichern("impressum", data.text, session)


@router.get("/einstellungen/datenschutz")
def datenschutz_lesen(session: Session = Depends(get_session)):
    return _lesen("datenschutz", DATENSCHUTZ_DEFAULT, session)


@router.put("/admin/einstellungen/datenschutz")
def datenschutz_speichern(data: EinstellungUpdate, session: Session = Depends(get_session)):
    return _speichern("datenschutz", data.text, session)

```

### backend/routers/export.py

```python
"""
DATEV EXTF Export — Buchungsstapel + Debitoren/Kreditoren-Stammdaten

Encoding: Latin-1 (DATEV-Standard)
Dezimaltrennzeichen: Komma
Feldtrennzeichen: Semikolon
Datumformat Belegdatum: TTMM (kein Jahr)
Kontenrahmen: 04 (DATEV-Vereinskontenrahmen SKR49)

Kontenplan Lions Club Villa Ludwigshöhe:
  1460  Geldtransit       (Bar, Kreditkarte, PayPal)
  1800  Bank              (Überweisung)
  2120  Ausschüttung Erlös
  4120  Steuerfreie Umsätze § 19 UStG  (Erlöskonto)
  5200  Wareneingang
  6300  Sonst. betr. Ausgaben
  6400  Versicherungen
  6600  Werbekosten
  6800  Porto
  6850  Sonstiger Betriebsbedarf
  6855  Nebenkosten des Geldverkehrs
  10001+  Debitoren (Käufer, je E-Mail-Adresse)
  70001+  Kreditoren (Künstler / Galerien)
"""

import io
import zipfile
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from database import get_session
from models import Bild, Kauf, Kuenstler, Zahlungsart

router = APIRouter(prefix="/admin/export", tags=["Export"])

# ── Kontenplan ────────────────────────────────────────────────────────────────
# Bar/Kreditkarte/PayPal laufen alle über Geldtransit, Überweisung direkt auf Bank
KONTO_ZAHLUNGSART = {
    Zahlungsart.bar: "1460",
    Zahlungsart.ueberweisung: "1800",
    Zahlungsart.kreditkarte: "1460",
    Zahlungsart.paypal: "1460",
}
KONTO_ERLOESE = "4120"   # Steuerfreie Umsätze § 19 UStG
DEBITOR_BASIS = 10000    # Käufer: 10001, 10002, …
KREDITOR_BASIS = 70000   # Künstler: 70001, 70002, …


# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

def _ts() -> str:
    return datetime.now().strftime("%Y%m%d%H%M%S") + "000"


def _betrag(v: float) -> str:
    return f"{v:.2f}".replace(".", ",")


def _datum(dt: datetime) -> str:
    """DATEV Belegdatum: TTMM"""
    return dt.strftime("%d%m")


def _safe(s: str, max_len: int = 0) -> str:
    """Latin-1-sichere Kurzversion eines Strings."""
    s = s.replace(";", " ").replace('"', "'")
    if max_len:
        s = s[:max_len]
    return s


def _buchungsstapel_header(berater: int, mandant: int, wj_beginn: str) -> str:
    return (
        f'"EXTF";700;21;"Buchungsstapel";7;{_ts()};;'
        f'"RE";"";"";"";{berater};{mandant};{wj_beginn};04;"EUR";"";"";"";""'
    )


BUCHUNGSSTAPEL_SPALTEN = (
    "Umsatz (ohne Soll/Haben-Kz);Soll/Haben-Kennzeichen;WKZ Umsatz;Kurs;"
    "Basis-Umsatz;WKZ Basis-Umsatz;Konto;Gegenkonto (ohne BU-Schlüssel);"
    "BU-Schlüssel;Belegdatum;Belegfeld 1;Belegfeld 2;Skonto;Buchungstext;"
    "Postensperre;Adressnummer;Geschäftspartnerbank;Sachverhalt;Zinssperre;"
    "Beleglink;Beleginfo - Art 1;Beleginfo - Inhalt 1"
)


def _stammdaten_header(berater: int, mandant: int, wj_beginn: str) -> str:
    return (
        f'"EXTF";700;16;"Debitoren/Kreditoren";5;{_ts()};;'
        f'"RE";"";"";"";{berater};{mandant};{wj_beginn};04;"EUR";"";"";"";""'
    )


STAMMDATEN_SPALTEN = (
    "Konto;Name (Adressattyp Unternehmen);Unternehmensgegenstand;"
    "Name (Adressattyp natürl. Person);Vorname (Adressattyp natürl. Person);"
    "Name (Adressattyp keine Angabe);Adressattyp;Kurzbezeichnung;"
    "EU-Land;EU-UStIdNr.;Anrede;Titel/Akad. Grad;Adelstitel;Namensvorsatz;"
    "Adressart;Straße;Postfach;Postleitzahl;Ort;Land;Versandzusatz;"
    "Adresszusatz;Abweichende Anrede;Abw. Zustellbezeichnung 1;"
    "Abw. Zustellbezeichnung 2;Kennz. Korrespondenzadresse;"
    "Adresse Gültig von;Adresse Gültig bis;Telefon;Bemerkung;E-Mail"
)


def _stammdaten_zeile(konto: int, nachname: str, vorname: str,
                       strasse: str, plz: str, ort: str,
                       telefon: str = "", email: str = "") -> str:
    felder = [
        str(konto),           # Konto
        "",                   # Name Unternehmen
        "",                   # Unternehmensgegenstand
        _safe(nachname, 50),  # Name natürl. Person
        _safe(vorname, 30),   # Vorname natürl. Person
        "",                   # Name keine Angabe
        "2",                  # Adressattyp: 2 = natürliche Person
        _safe(f"{nachname} {vorname}", 15),  # Kurzbezeichnung
        "",                   # EU-Land
        "",                   # EU-UStIdNr
        "",                   # Anrede
        "",                   # Titel
        "",                   # Adelstitel
        "",                   # Namensvorsatz
        "STR",                # Adressart
        _safe(strasse, 40),
        "",                   # Postfach
        _safe(plz, 10),
        _safe(ort, 30),
        "DE",                 # Land
        "", "", "", "", "",   # Versandzusatz … Abw. Zustellbez. 2
        "",                   # Kennz. Korrespondenzadresse
        "", "",               # Gültig von / bis
        _safe(telefon, 20),
        "",                   # Bemerkung
        _safe(email, 60),
    ]
    return ";".join(felder)


# ── Export-Endpoint ───────────────────────────────────────────────────────────

@router.get("/datev", summary="DATEV EXTF Export als ZIP")
def export_datev(
    berater: int = Query(default=12345, description="DATEV Beraternummer (vom Steuerberater)"),
    mandant: int = Query(default=1, description="DATEV Mandantennummer"),
    wj_beginn: str = Query(default="20260101", description="Wirtschaftsjahr-Beginn YYYYMMDD"),
    nur_bezahlt: bool = Query(default=True, description="Nur bezahlte Käufe exportieren"),
    session: Session = Depends(get_session),
):
    kaeufe_alle = session.exec(select(Kauf).order_by(Kauf.erstellt_am)).all()
    kaeufe = [k for k in kaeufe_alle if k.bezahlt] if nur_bezahlt else kaeufe_alle

    bilder = {b.id: b for b in session.exec(select(Bild)).all()}
    kuenstler_alle = session.exec(select(Kuenstler).order_by(Kuenstler.db_name)).all()

    # Debitor-Nummern: je einmaliger E-Mail-Adresse eine Kontonummer
    debitor_map: dict[str, int] = {}
    debitor_nr = DEBITOR_BASIS + 1
    for k in kaeufe_alle:
        email = k.kaeufer_email.lower().strip()
        if email not in debitor_map:
            debitor_map[email] = debitor_nr
            debitor_nr += 1

    # Kreditor-Nummern: je Künstler eine Kontonummer
    kreditor_map: dict[int, int] = {
        k.id: KREDITOR_BASIS + i + 1
        for i, k in enumerate(kuenstler_alle)
    }

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:

        # ── 1. Buchungsstapel ─────────────────────────────────────────────────
        buf = io.StringIO()
        buf.write(_buchungsstapel_header(berater, mandant, wj_beginn) + "\r\n")
        buf.write(BUCHUNGSSTAPEL_SPALTEN + "\r\n")

        for kauf in kaeufe:
            bild = bilder.get(kauf.bild_id)
            preis = (bild.verkaufspreis if bild else None) or kauf.snap_verkaufspreis or 0.0
            bild_nr = (bild.bild_nr if bild else None) or kauf.snap_bild_nr or str(kauf.id)
            titel = (bild.bildtitel if bild else None) or kauf.snap_bildtitel or ""

            datum = kauf.bezahlt_am or kauf.erstellt_am
            konto = KONTO_ZAHLUNGSART.get(kauf.zahlungsart, "1200")
            beleg = _safe(f"KV-{bild_nr}", 12)
            text = _safe(f"Kunstverkauf {bild_nr} {titel}", 60)

            zeile = (
                f"{_betrag(preis)};S;EUR;;;;"
                f"{konto};{KONTO_ERLOESE};;"
                f"{_datum(datum)};{beleg};;;"
                f"{text};;;;;;;"
                f'"";"" '
            )
            buf.write(zeile + "\r\n")

        zf.writestr(
            "EXTF_Buchungsstapel_2026.csv",
            buf.getvalue().encode("latin-1", errors="replace"),
        )

        # ── 2. Debitoren-Stamm (Käufer) ──────────────────────────────────────
        buf = io.StringIO()
        buf.write(_stammdaten_header(berater, mandant, wj_beginn) + "\r\n")
        buf.write(STAMMDATEN_SPALTEN + "\r\n")

        seen: set[str] = set()
        for kauf in kaeufe_alle:
            email = kauf.kaeufer_email.lower().strip()
            if email in seen:
                continue
            seen.add(email)
            buf.write(
                _stammdaten_zeile(
                    konto=debitor_map[email],
                    nachname=kauf.kaeufer_name,
                    vorname=kauf.kaeufer_vorname,
                    strasse=kauf.kaeufer_strasse,
                    plz=kauf.kaeufer_plz,
                    ort=kauf.kaeufer_ort,
                    email=kauf.kaeufer_email,
                )
                + "\r\n"
            )

        zf.writestr(
            "EXTF_Debitoren_2026.csv",
            buf.getvalue().encode("latin-1", errors="replace"),
        )

        # ── 3. Kreditoren-Stamm (Künstler / Galerie) ─────────────────────────
        buf = io.StringIO()
        buf.write(_stammdaten_header(berater, mandant, wj_beginn) + "\r\n")
        buf.write(STAMMDATEN_SPALTEN + "\r\n")

        for k in kuenstler_alle:
            buf.write(
                _stammdaten_zeile(
                    konto=kreditor_map[k.id],
                    nachname=k.db_name,
                    vorname=k.db_vorname,
                    strasse=k.db_adresse or "",
                    plz=k.db_plz or "",
                    ort=k.db_ort or "",
                    telefon=k.db_telefon or "",
                    email=k.db_email or "",
                )
                + "\r\n"
            )

        zf.writestr(
            "EXTF_Kreditoren_2026.csv",
            buf.getvalue().encode("latin-1", errors="replace"),
        )

        # ── 4. Artikelliste (Bilder) — kein DATEV-Format, Info für Steuerberater
        buf = io.StringIO()
        buf.write(
            "Bild-Nr;Titel;Technik;Genre;Verkaufspreis;Einlieferungspreis;"
            "Kuenstler;Abrechnungsempfaenger\r\n"
        )
        kuenstler_idx = {k.id: k for k in kuenstler_alle}
        for bild in sorted(bilder.values(), key=lambda b: b.bild_nr):
            if not bild.verkaufspreis:
                continue
            k = kuenstler_idx.get(bild.kuenstler_id)
            kuenstler_name = f"{k.db_vorname} {k.db_name}".strip() if k else ""
            buf.write(
                f"{bild.bild_nr};{_safe(bild.bildtitel)};{bild.bildtechnik};"
                f"{bild.genre};{_betrag(bild.verkaufspreis)};"
                f"{_betrag(bild.einlieferungspreis) if bild.einlieferungspreis else ''};"
                f"{_safe(kuenstler_name)};{bild.abrechnungsempf}\r\n"
            )

        zf.writestr(
            "Artikel_Bilder_2026.csv",
            buf.getvalue().encode("latin-1", errors="replace"),
        )

    zip_buf.seek(0)
    dateiname = f"DATEV_Kunsttage_{datetime.now().strftime('%Y%m%d')}.zip"
    return StreamingResponse(
        zip_buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={dateiname}"},
    )

```

### backend/routers/merkliste.py

```python
import secrets
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional
from models import Besucher, MerklisteEintrag, Bild, BildPublic
from database import get_session
from services.email_service import send_merkliste

router = APIRouter(prefix="/merkliste", tags=["Merkliste"])


class AnmeldenData(BaseModel):
    email: Optional[str] = None
    telefon: Optional[str] = None


@router.post("/anmelden")
def anmelden(data: AnmeldenData, session: Session = Depends(get_session)):
    email = (data.email or "").strip().lower() or None
    telefon = (data.telefon or "").strip() or None
    if not email and not telefon:
        raise HTTPException(400, "E-Mail oder Telefon erforderlich")

    besucher = None
    if email:
        besucher = session.exec(select(Besucher).where(Besucher.email == email)).first()
    if not besucher and telefon:
        besucher = session.exec(select(Besucher).where(Besucher.telefon == telefon)).first()

    if not besucher:
        besucher = Besucher(email=email, telefon=telefon, token=secrets.token_urlsafe(32))
        session.add(besucher)
        session.commit()
        session.refresh(besucher)

    return {"token": besucher.token, "besucher_id": besucher.id}


def _besucher_by_token(token: str, session: Session) -> Besucher:
    b = session.exec(select(Besucher).where(Besucher.token == token)).first()
    if not b:
        raise HTTPException(401, "Ungültiger Token")
    return b


@router.get("/")
def get_merkliste(token: str, session: Session = Depends(get_session)):
    besucher = _besucher_by_token(token, session)
    eintraege = session.exec(
        select(MerklisteEintrag)
        .where(MerklisteEintrag.besucher_id == besucher.id)
        .order_by(MerklisteEintrag.hinzugefuegt_am)
    ).all()
    bild_ids = [e.bild_id for e in eintraege]
    if not bild_ids:
        return {"bilder": []}
    bilder = session.exec(select(Bild).where(Bild.id.in_(bild_ids))).all()
    bild_map = {b.id: b for b in bilder}
    result = []
    for bid in bild_ids:
        b = bild_map.get(bid)
        if b:
            _ = b.kuenstler  # lazy load relationship
            result.append(BildPublic.model_validate(b))
    return {"bilder": result, "email": besucher.email, "telefon": besucher.telefon}


class ProfilUpdate(BaseModel):
    email: Optional[str] = None
    telefon: Optional[str] = None


@router.patch("/profil")
def profil_aktualisieren(token: str, data: ProfilUpdate, session: Session = Depends(get_session)):
    besucher = _besucher_by_token(token, session)
    if data.email is not None:
        besucher.email = data.email.strip().lower() or None
    if data.telefon is not None:
        besucher.telefon = data.telefon.strip() or None
    session.add(besucher)
    session.commit()
    return {"email": besucher.email, "telefon": besucher.telefon}


@router.post("/zusenden")
def merkliste_zusenden(token: str, session: Session = Depends(get_session)):
    besucher = _besucher_by_token(token, session)
    if not besucher.email:
        raise HTTPException(400, "Keine E-Mail-Adresse hinterlegt")
    eintraege = session.exec(
        select(MerklisteEintrag)
        .where(MerklisteEintrag.besucher_id == besucher.id)
        .order_by(MerklisteEintrag.hinzugefuegt_am)
    ).all()
    if not eintraege:
        raise HTTPException(400, "Merkliste ist leer")
    bilder = session.exec(select(Bild).where(Bild.id.in_([e.bild_id for e in eintraege]))).all()
    bild_map = {b.id: b for b in bilder}
    geordnet = [bild_map[e.bild_id] for e in eintraege if e.bild_id in bild_map]
    for b in geordnet:
        _ = b.kuenstler
    send_merkliste(besucher.email, geordnet, token=besucher.token)
    return {"status": "gesendet", "email": besucher.email}


@router.post("/abmelden")
def abmelden(token: str, session: Session = Depends(get_session)):
    besucher = session.exec(select(Besucher).where(Besucher.token == token)).first()
    if not besucher:
        raise HTTPException(404, "Ungültiger Abmelde-Link")
    besucher.email_abgemeldet = True
    session.add(besucher)
    session.commit()
    return {"status": "abgemeldet", "email": besucher.email}


@router.post("/{bild_id}")
def hinzufuegen(bild_id: int, token: str, session: Session = Depends(get_session)):
    besucher = _besucher_by_token(token, session)
    exists = session.exec(
        select(MerklisteEintrag).where(
            MerklisteEintrag.besucher_id == besucher.id,
            MerklisteEintrag.bild_id == bild_id,
        )
    ).first()
    if not exists:
        session.add(MerklisteEintrag(besucher_id=besucher.id, bild_id=bild_id))
        session.commit()
    return {"status": "ok"}


@router.delete("/{bild_id}")
def entfernen(bild_id: int, token: str, session: Session = Depends(get_session)):
    besucher = _besucher_by_token(token, session)
    eintrag = session.exec(
        select(MerklisteEintrag).where(
            MerklisteEintrag.besucher_id == besucher.id,
            MerklisteEintrag.bild_id == bild_id,
        )
    ).first()
    if eintrag:
        session.delete(eintrag)
        session.commit()
    return {"status": "ok"}

```

### backend/routers/reservations.py

```python
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import Bild, Reservierung, ReservierungCreate, Verfuegbarkeit
from database import get_session
from services import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reservierungen", tags=["Reservierungen"])


@router.post("/")
def reservieren(data: ReservierungCreate, session: Session = Depends(get_session)):
    bild = session.get(Bild, data.bild_id)
    if not bild:
        raise HTTPException(404, "Bild nicht gefunden")
    if bild.verfuegbarkeit != Verfuegbarkeit.verfuegbar:
        raise HTTPException(409, "Bild ist nicht mehr verfügbar")

    reservierung = Reservierung.model_validate(data)
    session.add(reservierung)

    bild.verfuegbarkeit = Verfuegbarkeit.reserviert
    session.add(bild)
    session.commit()
    session.refresh(reservierung)

    name = f"{data.vorname} {data.name}"
    try:
        email_service.send_reservierung_besucher(data.email, name, bild.bildtitel, bild.bild_nr)
    except Exception as exc:
        logger.warning("Besucher-Mail fehlgeschlagen: %s", exc)
    try:
        email_service.send_reservierung_admin(bild.bild_nr, bild.bildtitel, name, data.email, data.telefon or "")
    except Exception as exc:
        logger.warning("Admin-Mail fehlgeschlagen: %s", exc)

    return {"id": reservierung.id, "status": "reserviert"}


@router.delete("/{reservierung_id}")
def stornieren(reservierung_id: int, session: Session = Depends(get_session)):
    r = session.get(Reservierung, reservierung_id)
    if not r:
        raise HTTPException(404)
    r.storniert = True
    bild = session.get(Bild, r.bild_id)
    if bild and bild.verfuegbarkeit == Verfuegbarkeit.reserviert:
        bild.verfuegbarkeit = Verfuegbarkeit.verfuegbar
        session.add(bild)
    session.add(r)
    session.commit()
    return {"status": "storniert"}

```

### backend/routers/sales.py

```python
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from models import Bild, Kauf, KaufCreate, Verfuegbarkeit, Kuenstler
from database import get_session
from services import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kaeufe", tags=["Kasse"])


@router.get("/kaeufer")
def kaeufer_liste(session: Session = Depends(get_session)):
    kaeufe = session.exec(select(Kauf).order_by(Kauf.erstellt_am.desc())).all()
    # Gruppieren nach E-Mail
    gruppen: dict[str, dict] = {}
    for k in kaeufe:
        bild = session.get(Bild, k.bild_id)
        kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild and bild.kuenstler_id else None
        email = k.kaeufer_email.lower().strip()
        if email not in gruppen:
            gruppen[email] = {
                "email": k.kaeufer_email,
                "titel": k.kaeufer_titel,
                "vorname": k.kaeufer_vorname,
                "name": k.kaeufer_name,
                "strasse": k.kaeufer_strasse,
                "plz": k.kaeufer_plz,
                "ort": k.kaeufer_ort,
                "kaeufe": [],
                "gesamt": 0.0,
            }
        preis = (bild.verkaufspreis if bild else None) or k.snap_verkaufspreis or 0
        gruppen[email]["kaeufe"].append({
            "kauf_id": k.id,
            "datum": k.erstellt_am,
            "bild_nr": (bild.bild_nr if bild else None) or k.snap_bild_nr,
            "bildtitel": (bild.bildtitel if bild else None) or k.snap_bildtitel,
            "kuenstler": (f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else None) or k.snap_kuenstler,
            "verkaufspreis": preis,
            "bezahlt": k.bezahlt,
            "zahlungsart": k.zahlungsart,
        })
        gruppen[email]["gesamt"] += preis
    return sorted(gruppen.values(), key=lambda x: x["name"].lower())


@router.get("/")
def alle_kaeufe(session: Session = Depends(get_session)):
    kaeufe = session.exec(select(Kauf).order_by(Kauf.erstellt_am.desc())).all()
    result = []
    for k in kaeufe:
        bild = session.get(Bild, k.bild_id)
        kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild and bild.kuenstler_id else None
        result.append({
            "id": k.id,
            "erstellt_am": k.erstellt_am,
            "bezahlt": k.bezahlt,
            "bezahlt_am": k.bezahlt_am,
            "zahlungsart": k.zahlungsart,
            "kaeufer_titel": k.kaeufer_titel,
            "kaeufer_vorname": k.kaeufer_vorname,
            "kaeufer_name": k.kaeufer_name,
            "kaeufer_email": k.kaeufer_email,
            "kaeufer_strasse": k.kaeufer_strasse,
            "kaeufer_plz": k.kaeufer_plz,
            "kaeufer_ort": k.kaeufer_ort,
            "bild_id": k.bild_id,
            "bild_nr": (bild.bild_nr if bild else None) or k.snap_bild_nr,
            "bildtitel": (bild.bildtitel if bild else None) or k.snap_bildtitel,
            "verkaufspreis": (bild.verkaufspreis if bild else None) or k.snap_verkaufspreis,
            "kuenstler": (f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else None) or k.snap_kuenstler,
        })
    return result


@router.post("/")
def kauf_erfassen(data: KaufCreate, session: Session = Depends(get_session)):
    bild = session.get(Bild, data.bild_id)
    if not bild:
        raise HTTPException(404, "Bild nicht gefunden")
    if bild.verfuegbarkeit == Verfuegbarkeit.verkauft:
        raise HTTPException(409, "Bild bereits verkauft")

    kauf = Kauf.model_validate(data)
    session.add(kauf)

    bild.verfuegbarkeit = Verfuegbarkeit.verkauft
    session.add(bild)
    session.commit()
    session.refresh(kauf)

    name = f"{data.kaeufer_vorname} {data.kaeufer_name}"
    try:
        email_service.send_kaufbestaetigung(
            data.kaeufer_email, name, bild.bildtitel,
            bild.verkaufspreis or 0, data.zahlungsart.value,
        )
    except Exception as exc:
        logger.warning("E-Mail-Versand fehlgeschlagen: %s", exc)

    return {"id": kauf.id, "status": "verkauft"}


@router.get("/{kauf_id}")
def kauf_detail(kauf_id: int, session: Session = Depends(get_session)):
    kauf = session.get(Kauf, kauf_id)
    if not kauf:
        raise HTTPException(404)
    bild = session.get(Bild, kauf.bild_id)
    kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild and bild.kuenstler_id else None
    return {
        "id": kauf.id,
        "erstellt_am": kauf.erstellt_am,
        "bezahlt": kauf.bezahlt,
        "bezahlt_am": kauf.bezahlt_am,
        "zahlungsart": kauf.zahlungsart,
        "kaeufer_titel": kauf.kaeufer_titel,
        "kaeufer_vorname": kauf.kaeufer_vorname,
        "kaeufer_name": kauf.kaeufer_name,
        "kaeufer_email": kauf.kaeufer_email,
        "kaeufer_strasse": kauf.kaeufer_strasse,
        "kaeufer_plz": kauf.kaeufer_plz,
        "kaeufer_ort": kauf.kaeufer_ort,
        "bild_id": kauf.bild_id,
        "bild_nr": (bild.bild_nr if bild else None) or kauf.snap_bild_nr,
        "bildtitel": (bild.bildtitel if bild else None) or kauf.snap_bildtitel,
        "bildtechnik": (bild.bildtechnik if bild else None) or kauf.snap_bildtechnik,
        "genre": (bild.genre if bild else None) or kauf.snap_genre,
        "breite_rahmen_cm": (bild.breite_rahmen_cm if bild else None) or kauf.snap_breite_rahmen_cm,
        "hoehe_rahmen_cm": (bild.hoehe_rahmen_cm if bild else None) or kauf.snap_hoehe_rahmen_cm,
        "breite_cm": bild.breite_cm if bild else None,
        "hoehe_cm": bild.hoehe_cm if bild else None,
        "verkaufspreis": (bild.verkaufspreis if bild else None) or kauf.snap_verkaufspreis,
        "kuenstler": (f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else None) or kauf.snap_kuenstler,
        "kuenstler_beruf": kuenstler.db_beruf if kuenstler else None,
    }


@router.patch("/{kauf_id}/bezahlt")
def als_bezahlt_markieren(kauf_id: int, session: Session = Depends(get_session)):
    kauf = session.get(Kauf, kauf_id)
    if not kauf:
        raise HTTPException(404)
    kauf.bezahlt = True
    kauf.bezahlt_am = datetime.utcnow()
    session.add(kauf)
    session.commit()
    return {"status": "bezahlt"}

```

### Backend — Services


### backend/services/auth_service.py

```python
import os
from jose import jwt, JWTError
from datetime import datetime, timedelta

SECRET = os.getenv("JWT_SECRET", "dev-secret-bitte-aendern")
ALGORITHM = "HS256"

ADMIN_PW = os.getenv("ADMIN_PASSWORT", "")
ORGA_PW = os.getenv("ORGA_PASSWORT", "")


def create_token(rolle: str, stunden: int = 12) -> str:
    payload = {
        "rolle": rolle,
        "exp": datetime.utcnow() + timedelta(hours=stunden),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None


def check_passwort(rolle: str, passwort: str) -> bool:
    if rolle == "admin":
        return bool(ADMIN_PW) and passwort == ADMIN_PW
    if rolle == "orga":
        return bool(ORGA_PW) and passwort == ORGA_PW
    return False

```

### backend/services/email_service.py

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")


def _send(to: str, subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(SMTP_USER, to, msg.as_string())


def send_reservierung_besucher(email: str, name: str, bildtitel: str, bild_nr: str):
    _send(
        email,
        f"Reservierungsbestätigung – {bildtitel}",
        f"""
        <p>Hallo {name},</p>
        <p>Ihre Reservierung für <strong>{bildtitel}</strong> (Nr. {bild_nr}) wurde erfolgreich registriert.</p>
        <p>Bitte holen Sie das Werk während der Veranstaltung ab oder sprechen Sie uns wegen Transport an.</p>
        <p>Mit freundlichen Grüßen<br>Kunsttage auf der Ludwigshöhe</p>
        """,
    )


def send_reservierung_admin(bild_nr: str, bildtitel: str, name: str, email: str, telefon: str):
    if not ADMIN_EMAIL:
        return
    _send(
        ADMIN_EMAIL,
        f"Neue Reservierung: {bildtitel}",
        f"""
        <p><strong>Neue Reservierung eingegangen</strong></p>
        <ul>
            <li>Bild: {bildtitel} ({bild_nr})</li>
            <li>Käufer: {name}</li>
            <li>E-Mail: {email}</li>
            <li>Telefon: {telefon or '—'}</li>
        </ul>
        """,
    )


def send_kaufbestaetigung(email: str, name: str, bildtitel: str, preis: float, zahlungsart: str):
    _send(
        email,
        f"Kaufbestätigung – {bildtitel}",
        f"""
        <p>Hallo {name},</p>
        <p>vielen Dank für Ihren Kauf!</p>
        <p><strong>{bildtitel}</strong> – {preis:.2f} € ({zahlungsart})</p>
        <p>Mit freundlichen Grüßen<br>Kunsttage auf der Ludwigshöhe</p>
        """,
    )


def _abmelde_footer(token: str) -> str:
    link = f"{BASE_URL}/merkliste/abmelden?token={token}"
    return f"""
    <p style="color:#9ca3af;font-size:11px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px">
      Kunsttage auf der Ludwigshöhe · Lions Club Villa Ludwigshöhe<br>
      <a href="{link}" style="color:#9ca3af">Von E-Mails abmelden</a>
    </p>"""


def send_merkliste(email: str, bilder: list, token: str = "") -> None:
    zeilen = ""
    for b in bilder:
        kuenstler = ""
        if b.kuenstler:
            kuenstler = f"{b.kuenstler.db_vorname} {b.kuenstler.db_name}".strip()
        masse = f"{b.breite_rahmen_cm} × {b.hoehe_rahmen_cm} cm" if b.breite_rahmen_cm else ""
        preis = f"<strong>{b.verkaufspreis:.0f} €</strong>" if b.verkaufspreis else "Preis auf Anfrage"
        verfuegbar = b.verfuegbarkeit.value if hasattr(b.verfuegbarkeit, "value") else str(b.verfuegbarkeit)
        farbe = "#16a34a" if verfuegbar == "Verfügbar" else "#ca8a04" if verfuegbar == "Reserviert" else "#dc2626"
        zeilen += f"""
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:12px 8px;vertical-align:top;width:60px">
            {'<img src="' + BASE_URL + b.bild_url_web + '" style="width:56px;height:56px;object-fit:cover;border-radius:4px">' if b.bild_url_web else '<div style="width:56px;height:56px;background:#f3f4f6;border-radius:4px"></div>'}
          </td>
          <td style="padding:12px 8px;vertical-align:top">
            <strong style="font-size:14px">{b.bildtitel}</strong><br>
            <span style="color:#6b7280;font-size:13px">{kuenstler}</span><br>
            <span style="color:#9ca3af;font-size:12px;font-family:monospace">Nr. {b.bild_nr}</span>
            &nbsp;·&nbsp;
            <span style="color:#9ca3af;font-size:12px">{b.bildtechnik}{" · " + masse if masse else ""}</span>
            {"<br><span style='color:#6b7280;font-size:12px;font-style:italic'>" + b.anmerkung_bild + "</span>" if b.anmerkung_bild else ""}
          </td>
          <td style="padding:12px 8px;vertical-align:top;text-align:right;white-space:nowrap">
            {preis}<br>
            <span style="font-size:11px;color:{farbe}">{verfuegbar}</span>
          </td>
        </tr>"""
    _send(
        email,
        "Ihre Merkliste – Kunsttage auf der Ludwigshöhe 2026",
        f"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:8px">
            Meine Merkliste · Kunsttage auf der Ludwigshöhe 2026
          </h2>
          <p style="color:#6b7280;font-size:13px">
            Schloss Villa Ludwigshöhe · Edenkoben<br>
            Bitte bringen Sie diese Liste zur Ausstellung mit. Die Preise sind unverbindlich.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            {zeilen}
          </table>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            {len(bilder)} {"Werk" if len(bilder) == 1 else "Werke"} gespeichert
          </p>
          {_abmelde_footer(token) if token else ""}
        </div>
        """,
    )


def send_nachfass(betreff: str, text: str, empfaenger: list[tuple[str, str | None]]):
    """Sendet individuelle E-Mails mit personalisierten Abmelde-Links.
    empfaenger: Liste von (email, token_oder_None) Tupeln.
    """
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        for email, token in empfaenger:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = betreff
            msg["From"] = SMTP_USER
            msg["To"] = email
            html = f"""
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <p style="white-space:pre-line">{text}</p>
              {_abmelde_footer(token) if token else '<p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px">Kunsttage auf der Ludwigshöhe · Lions Club Villa Ludwigshöhe</p>'}
            </div>
            """
            msg.attach(MIMEText(html, "html"))
            s.sendmail(SMTP_USER, email, msg.as_string())


def send_kuenstler_login(email: str, name: str, token: str):
    link = f"{BASE_URL}/kuenstler/login?token={token}"
    _send(
        email,
        "Ihr Zugang zum Künstler-Portal",
        f"""
        <p>Hallo {name},</p>
        <p>hier ist Ihr persönlicher Login-Link für das Künstler-Portal:</p>
        <p><a href="{link}">{link}</a></p>
        <p>Der Link ist 48 Stunden gültig.</p>
        <p>Mit freundlichen Grüßen<br>Kunsttage auf der Ludwigshöhe</p>
        """,
    )

```

### backend/services/image_service.py

```python
from PIL import Image
import io
import os

MAX_WEB_SIZE = (1500, 1500)
MAX_WEB_KB = 500


def compress_image(data: bytes, filename: str) -> tuple[bytes, bytes]:
    """Returns (web_bytes, original_bytes). Web version max 1500px / 500KB."""
    original = data

    img = Image.open(io.BytesIO(data))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    img.thumbnail(MAX_WEB_SIZE, Image.LANCZOS)

    quality = 85
    while True:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        if buf.tell() <= MAX_WEB_KB * 1024 or quality <= 40:
            break
        quality -= 5

    return buf.getvalue(), original


def save_image(web_bytes: bytes, original_bytes: bytes, bild_nr: str, upload_dir: str) -> tuple[str, str]:
    web_path = os.path.join(upload_dir, "web", f"{bild_nr}.jpg")
    orig_path = os.path.join(upload_dir, "original", f"{bild_nr}_orig")

    os.makedirs(os.path.dirname(web_path), exist_ok=True)
    os.makedirs(os.path.dirname(orig_path), exist_ok=True)

    with open(web_path, "wb") as f:
        f.write(web_bytes)
    with open(orig_path, "wb") as f:
        f.write(original_bytes)

    return f"/uploads/web/{bild_nr}.jpg", f"/uploads/original/{bild_nr}_orig"

```

### backend/services/import_service.py

```python
import pandas as pd
from sqlmodel import Session, select
from models import Bild, Kuenstler, Genre, Abrechnungsempfaenger
from services.price_service import berechne_verkaufspreis
from datetime import datetime
import io


PFLICHT_SPALTEN = {
    "bild_nr", "kuenstler_name", "kuenstler_vorname",
    "bildtitel", "bildtechnik", "genre",
    "hoehe_rahmen_cm", "breite_rahmen_cm",
}


def import_csv(data: bytes, session: Session) -> dict:
    df = pd.read_csv(io.BytesIO(data), dtype=str)
    return _process(df, session)


def import_excel(data: bytes, session: Session) -> dict:
    df = pd.read_excel(io.BytesIO(data), dtype=str)
    return _process(df, session)


def _normalisiere_bild_nr(bild_nr: str) -> str:
    """Normalisiert bild_nr auf das Format JJKKKNN (7 Stellen).
    - 7-stellig mit Jahrspräfix (20–29): unverändert  → '2610501' bleibt '2610501'
    - 5-stellig (KKKNN ohne Jahr):       Jahr voranstellen → '10501' wird '2610501'
    - Andere Längen:                      unverändert (Legacy / manuell)
    """
    year_prefix = f"{datetime.now().year % 100:02d}"
    if len(bild_nr) == 7 and bild_nr[:2].isdigit() and 20 <= int(bild_nr[:2]) <= 29:
        return bild_nr
    if len(bild_nr) == 5 and bild_nr.isdigit():
        return year_prefix + bild_nr
    return bild_nr


def _process(df: pd.DataFrame, session: Session) -> dict:
    fehlend = PFLICHT_SPALTEN - set(df.columns)
    if fehlend:
        raise ValueError(f"Fehlende Pflichtspalten: {fehlend}")

    importiert, fehler = 0, []

    for i, row in df.iterrows():
        try:
            bild_nr = _normalisiere_bild_nr(row["bild_nr"].strip())

            # Künstler suchen oder anlegen
            ident = f"{row['kuenstler_name'].strip()}_{row['kuenstler_vorname'].strip()}".lower()
            kuenstler = session.exec(
                select(Kuenstler).where(Kuenstler.db_ident == ident)
            ).first()
            if not kuenstler:
                kuenstler = Kuenstler(
                    db_ident=ident,
                    db_name=row["kuenstler_name"].strip(),
                    db_vorname=row["kuenstler_vorname"].strip(),
                )
                session.add(kuenstler)
                session.flush()

            einlieferungspreis = _float(row.get("einlieferungspreis"))
            verkaufspreis = _float(row.get("verkaufspreis"))
            if not verkaufspreis and einlieferungspreis:
                verkaufspreis = berechne_verkaufspreis(einlieferungspreis)

            genre_val = row["genre"].strip()
            genre = next(
                (g for g in Genre if g.value.lower() == genre_val.lower()),
                Genre.sonstiges,
            )

            abrech_raw = (row.get("abrechnungsempf") or "").strip().lower()
            abrech = Abrechnungsempfaenger.galerist if "galerist" in abrech_raw else Abrechnungsempfaenger.kuenstler

            # Galerist per Name nachschlagen (Spalten: galerist_name + galerist_vorname)
            galerist_id = None
            galerist_name_raw = (row.get("galerist_name") or "").strip()
            if abrech == Abrechnungsempfaenger.galerist and galerist_name_raw:
                galerist_vorname_raw = (row.get("galerist_vorname") or "").strip()
                g_ident = f"{galerist_name_raw}_{galerist_vorname_raw}".lower()
                galerist = session.exec(
                    select(Kuenstler).where(Kuenstler.db_ident == g_ident)
                ).first()
                if galerist:
                    galerist_id = galerist.id

            bild = Bild(
                bild_nr=bild_nr,
                kuenstler_id=kuenstler.id,
                bildtitel=row["bildtitel"].strip(),
                bildtechnik=row["bildtechnik"].strip(),
                genre=genre,
                anzahl=int(_float(row.get("anzahl")) or 1),
                hoehe_rahmen_cm=float(row["hoehe_rahmen_cm"]),
                breite_rahmen_cm=float(row["breite_rahmen_cm"]),
                einlieferungspreis=einlieferungspreis,
                verkaufspreis_vorschlag=berechne_verkaufspreis(einlieferungspreis) if einlieferungspreis else None,
                verkaufspreis=verkaufspreis,
                abrechnungsempf=abrech,
                galerist_id=galerist_id,
                foto_nr=row.get("bild_dateiname", "").strip() or None,
            )
            session.add(bild)
            importiert += 1
        except Exception as e:
            fehler.append({"zeile": i + 2, "fehler": str(e)})

    session.commit()
    return {"importiert": importiert, "fehler": fehler}


def _float(val) -> float | None:
    try:
        return float(str(val).replace(",", "."))
    except (TypeError, ValueError):
        return None

```

### backend/services/price_service.py

```python
import math


def berechne_verkaufspreis(einlieferungspreis: float) -> float:
    """Einlieferungspreis × 1,80, aufgerundet auf nächste 10€."""
    rohpreis = einlieferungspreis * 1.80
    return math.ceil(rohpreis / 10) * 10

```

### backend/services/vita_pdf_service.py

```python
import io, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, Image, Table, TableStyle, HRFlowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

W, H = A4
MARGIN = 1.8 * cm
BODY_W = W - 2 * MARGIN
COL_L = BODY_W * 0.44
COL_R = BODY_W * 0.56
FOOTER_H = 1.2 * cm

OLIVE      = colors.HexColor("#7a8c50")
DARK       = colors.HexColor("#1a1a1a")
BOX_BG     = colors.HexColor("#f4f4f2")
BOX_BORDER = colors.HexColor("#d0d0c8")
MID        = colors.HexColor("#555555")
GRAY_BOX   = colors.HexColor("#888888")


def S(name, **kw):
    d = dict(fontName="Helvetica", textColor=DARK, leading=14, fontSize=10)
    d.update(kw)
    return ParagraphStyle(name, **d)


def content_box(rows, col_width):
    t = Table([[r] for r in rows], colWidths=[col_width - 0.2*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BOX_BG),
        ("BOX",           (0, 0), (-1, -1), 0.5, BOX_BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
    ]))
    return t


def section_block(heading, rows, col_width):
    return [
        Paragraph(heading, S("sh", fontSize=12, fontName="Helvetica-Bold",
                             spaceAfter=3, spaceBefore=10)),
        content_box(rows, col_width),
    ]


def text_to_paras(text, style):
    result = []
    for line in text.strip().split("\n"):
        line = line.strip()
        if line:
            result.append(Paragraph(line, style))
        else:
            result.append(Spacer(1, 3))
    return result


def draw_footer(canvas, doc):
    canvas.saveState()
    y = MARGIN - 0.2*cm
    canvas.setStrokeColor(OLIVE)
    canvas.setLineWidth(1)
    canvas.line(MARGIN, y + 0.4*cm, W - MARGIN, y + 0.4*cm)
    canvas.setFillColor(OLIVE)
    canvas.setFont("Helvetica", 14)
    canvas.drawString(MARGIN, y - 0.3*cm, "Lions Club Villa Ludwigshoehe")
    canvas.drawRightString(W - MARGIN, y - 0.3*cm,
                           "Kunsttage auf der Ludwigshoehe  2026")
    canvas.restoreState()


def generate_vita_pdf(kuenstler, bilder: list, upload_dir: str) -> bytes:
    buf = io.BytesIO()

    frame = Frame(MARGIN, MARGIN + FOOTER_H, BODY_W, H - 2*MARGIN - FOOTER_H,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    template = PageTemplate(id="main", frames=[frame], onPage=draw_footer)
    doc = BaseDocTemplate(buf, pagesize=A4, pageTemplates=[template])

    story = []

    # Portrait
    portrait_path = None
    if kuenstler.portrait_foto:
        p = upload_dir.rstrip("/") + "/" + kuenstler.portrait_foto.replace("/uploads/", "")
        if os.path.exists(p):
            portrait_path = p

    portrait_el = (Image(portrait_path, width=5.5*cm, height=5.5*cm, kind="proportional")
                   if portrait_path else Spacer(5.5*cm, 5.5*cm))

    # Name + Beruf-Box
    name = f"{kuenstler.db_vorname or ''} {kuenstler.db_name}".strip()
    beruf = kuenstler.db_beruf or ""
    right_w = BODY_W - 5.8*cm

    beruf_el = Spacer(1, 0.4*cm)
    if beruf:
        beruf_table = Table(
            [[Paragraph(beruf, S("b2", fontSize=15, textColor=colors.white,
                                 leading=20, alignment=TA_CENTER))]],
            colWidths=[right_w - 0.2*cm],
        )
        beruf_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), GRAY_BOX),
            ("BOX",           (0, 0), (-1, -1), 0.5, GRAY_BOX),
            ("TOPPADDING",    (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING",   (0, 0), (-1, -1), 6),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ]))
        beruf_el = beruf_table

    name_col = [
        Spacer(1, 0.3*cm),
        Paragraph(name, S("n", fontSize=28, fontName="Helvetica-Bold", leading=32, spaceAfter=6)),
        HRFlowable(width="100%", thickness=1, color=OLIVE, spaceAfter=10),
        beruf_el,
    ]

    header = Table([[portrait_el, name_col]], colWidths=[5.8*cm, right_w])
    header.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header)
    story.append(Spacer(1, 0.3*cm))
    story.append(HRFlowable(width="100%", thickness=1.5, color=OLIVE, spaceAfter=6))

    # Linke Spalte
    body_s = S("bd", fontSize=9, leading=13)
    left_items = []

    if kuenstler.db_inspiration and kuenstler.db_inspiration.strip():
        left_items += section_block("Inspiration",
                                    text_to_paras(kuenstler.db_inspiration, body_s), COL_L)

    leben = kuenstler.db_lebenstext or kuenstler.db_kommentar or ""
    heading_l = "Leben/Ausbildung" if kuenstler.db_lebenstext else "Kurzbiografie"
    if leben.strip():
        left_items += section_block(heading_l, text_to_paras(leben, body_s), COL_L)

    # Rechte Spalte
    right_items = []

    if kuenstler.db_ausstellungen and kuenstler.db_ausstellungen.strip():
        aus_rows = []
        for line in kuenstler.db_ausstellungen.strip().split("\n"):
            line = line.strip().lstrip("•·-").strip()
            if line:
                aus_rows.append(Paragraph(
                    f"• {line}",
                    S("au", fontSize=9, leading=14, leftIndent=8, firstLineIndent=-8)))
        right_items += section_block("Ausstellungen / Auszeichnungen", aus_rows, COL_R)

    # Kontakt
    adresse = ", ".join(filter(None, [
        kuenstler.db_adresse,
        f"{kuenstler.db_plz or ''} {kuenstler.db_ort or ''}".strip() or None,
    ])) if (kuenstler.db_adresse or kuenstler.db_plz) else ""
    telefon = getattr(kuenstler, "db_telefon", None) or ""

    kontakt_rows = []
    for label, text in [
        ("Adr.",   adresse),
        ("Web",    kuenstler.db_webseite or ""),
        ("Tel.",   telefon),
        ("E-Mail", kuenstler.db_email or ""),
        ("Insta",  kuenstler.db_instagram or ""),
        ("FB",     kuenstler.db_facebook or ""),
    ]:
        zeile = f"<b>{label}</b>   {text.strip()}" if text.strip() else f"<b>{label}</b>"
        kontakt_rows.append(Paragraph(zeile, S("kk", fontSize=9, leading=16)))

    right_items += section_block("Kontakt", kontakt_rows, COL_R)

    # Body 2-Spalten
    def col_wrap(items, w):
        if not items:
            return Spacer(1, 1)
        t = Table([[i] for i in items], colWidths=[w - 0.3*cm])
        t.setStyle(TableStyle([
            ("LEFTPADDING",   (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
            ("TOPPADDING",    (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        return t

    body = Table(
        [[col_wrap(left_items, COL_L), col_wrap(right_items, COL_R)]],
        colWidths=[COL_L, COL_R],
    )
    body.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (0, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(body)

    doc.build(story)
    buf.seek(0)
    return buf.read()

```

---

## Frontend

### Frontend — Konfiguration


### frontend/package.json

```json
{
  "name": "lions-kunsttage-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@paypal/react-paypal-js": "^10.0.0",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}

```

### frontend/next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
};

module.exports = nextConfig;

```

### frontend/tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lions: {
          blue: "#003B71",
          gold: "#C8A951",
        },
      },
    },
  },
  plugins: [],
};

```

### frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

### frontend/playwright.config.ts

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});

```

### frontend/middleware.ts

```ts
import { NextRequest, NextResponse } from "next/server";

// Seiten, auf die Orga-Team Zugriff hat
const ORGA_SEITEN = [
  "/admin/bilder/aufsteller",
  "/admin/kasse",
  "/admin/kaufuebersicht",
  "/admin/kaeufer",
];

function decodePayload(token: string): { rolle?: string; exp?: number } | null {
  try {
    const part = token.split(".")[1];
    const json = Buffer.from(part, "base64url").toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("kt_auth")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const payload = decodePayload(token);
  if (!payload?.exp || payload.exp < Date.now() / 1000) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const rolle = payload.rolle;

  if (rolle === "admin") return NextResponse.next();

  if (rolle === "orga") {
    const erlaubt = ORGA_SEITEN.some(s => pathname.startsWith(s));
    if (erlaubt) return NextResponse.next();
    // Orga landet standardmäßig auf der Kasse
    return NextResponse.redirect(new URL("/admin/kasse", request.url));
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};

```

### Frontend — App Root


### app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Kunsttage-Titel-Typografie ───────────────────────────────────────────── */
.kunsttage {
  font-family: var(--font-cormorant), "Georgia", serif;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 0.01em;
  color: #1e3a5f;
}

.kunsttage span {
  font-size: 5rem; /* Basisgröße — alle relativen Werte skalieren mit */
  display: inline-block;
}

/* Individuelle Buchstabengrößen: K-u-n-s-t-t-a-g-e */
.kunsttage span:nth-child(1) { font-size: 5.0rem; }   /* K */
.kunsttage span:nth-child(2) { font-size: 3.0rem; }   /* u */
.kunsttage span:nth-child(3) { font-size: 3.8rem; }   /* n */
.kunsttage span:nth-child(4) { font-size: 2.6rem; }   /* s */
.kunsttage span:nth-child(5) { font-size: 5.4rem; }   /* t */
.kunsttage span:nth-child(6) { font-size: 4.2rem; }   /* t */
.kunsttage span:nth-child(7) { font-size: 2.8rem; }   /* a */
.kunsttage span:nth-child(8) { font-size: 3.5rem; }   /* g */
.kunsttage span:nth-child(9) { font-size: 4.6rem; }   /* e */

/* Header-Variante */
.kunsttage-header {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #C8A951;
}

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

```

### app/layout.tsx

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import Providers from "./Providers";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    default: "Kunsttage auf der Ludwigshöhe 2026",
    template: "%s | Kunsttage auf der Ludwigshöhe",
  },
  description: "Kunstausstellung und Benefizveranstaltung im Schloss Villa Ludwigshöhe, Edenkoben – organisiert von den Lions Clubs der Südpfalz.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "Kunsttage auf der Ludwigshöhe",
    locale: "de_DE",
    type: "website",
    images: [{ url: "/villa.jpg", width: 1200, height: 630, alt: "Schloss Villa Ludwigshöhe – Kunsttage 2026" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={cormorant.variable}>
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <KeyboardShortcuts />
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          <footer className="mt-16 py-6 text-center text-sm text-gray-400 border-t print:hidden">
            <p>Kunsttage auf der Ludwigshöhe · Eine Benefizveranstaltung der Lions Clubs der Südpfalz · Alle Erlöse für gemeinnützige Zwecke</p>
            <p className="mt-2 flex items-center justify-center gap-4">
              <Link href="/impressum" className="hover:text-gray-600 underline underline-offset-2">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-gray-600 underline underline-offset-2">Datenschutz</Link>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

```

### app/page.tsx

```tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { getBilder } from "@/lib/api";
import { Bild } from "@/lib/types";
import BildCard from "@/components/BildCard";
import FilterBar from "@/components/FilterBar";

const STORAGE_KEY = "galerie_state";

export default function GaleriePage() {
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [alleBilder, setAlleBilder] = useState<Bild[]>([]);
  const [genre, setGenre] = useState("");
  const [technik, setTechnik] = useState("");
  const [kuenstlerId, setKuenstlerId] = useState("");
  const [sortierung, setSortierung] = useState("");
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  const [restored, setRestored] = useState(false);

  // Filter-State und Scroll-Position aus sessionStorage wiederherstellen
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { genre: g, technik: t, kuenstlerId: k, sortierung: s, scrollY } = JSON.parse(saved);
        if (g) setGenre(g);
        if (t) setTechnik(t);
        if (k) setKuenstlerId(k);
        if (s) setSortierung(s);
        sessionStorage.removeItem(STORAGE_KEY);
        if (scrollY) setTimeout(() => window.scrollTo({ top: scrollY }), 100);
      }
    } catch {}
    setRestored(true);
  }, []);

  // Einmalig alle Bilder laden für die Künstler-Dropdown-Optionen
  useEffect(() => {
    getBilder().then(setAlleBilder).catch(() => {});
  }, []);

  const kuenstlerOptionen = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of alleBilder) {
      if (b.kuenstler && !map.has(b.kuenstler_id)) {
        const k = b.kuenstler;
        map.set(b.kuenstler_id, `${k.db_name}${k.db_vorname ? `, ${k.db_vorname}` : ""}`);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [alleBilder]);

  useEffect(() => {
    if (!restored) return;
    setLaden(true);
    getBilder({
      genre: genre || undefined,
      technik: technik || undefined,
      kuenstler_id: kuenstlerId ? Number(kuenstlerId) : undefined,
    })
      .then(data => {
        if (sortierung === "zufall")
          data.sort(() => Math.random() - 0.5);
        else if (sortierung === "preis_asc")
          data.sort((a, b) => (a.verkaufspreis ?? Infinity) - (b.verkaufspreis ?? Infinity));
        else if (sortierung === "preis_desc")
          data.sort((a, b) => (b.verkaufspreis ?? -1) - (a.verkaufspreis ?? -1));
        setBilder(data);
      })
      .catch(() => setFehler("Verbindung zum Server fehlgeschlagen."))
      .finally(() => setLaden(false));
  }, [genre, technik, kuenstlerId, sortierung, restored]);

  function handleBildClick() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        genre, technik, kuenstlerId, sortierung, scrollY: window.scrollY,
      }));
    } catch {}
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="mb-10 text-center">
        <h1 aria-label="Kunsttage" className="kunsttage justify-center">
          <span>K</span>
          <span>u</span>
          <span>n</span>
          <span>s</span>
          <span>t</span>
          <span>t</span>
          <span>a</span>
          <span>g</span>
          <span>e</span>
        </h1>
        <p
          className="text-gray-500 mt-2 text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          auf der Ludwigshöhe · 2026 · Schloss Villa Ludwigshöhe · Edenkoben
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-lions-blue">Galerie</h2>
      </div>

      <FilterBar
        genre={genre} technik={technik} onGenre={setGenre} onTechnik={setTechnik}
        kuenstlerId={kuenstlerId} onKuenstler={setKuenstlerId}
        kuenstlerOptionen={kuenstlerOptionen}
        sortierung={sortierung} onSortierung={setSortierung}
      />

      {fehler && <p className="text-red-600 py-4">{fehler}</p>}

      {laden ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bilder.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">Keine Bilder gefunden.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {bilder.map((b) => (
            <div key={b.id} onClick={handleBildClick}>
              <BildCard bild={b} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

```

### app/Providers.tsx

```tsx
"use client";
import { MerklisteProvider } from "@/lib/MerklisteContext";
import AnmeldeModal from "@/components/AnmeldeModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MerklisteProvider>
      {children}
      <AnmeldeModal />
    </MerklisteProvider>
  );
}

```

### app/robots.ts

```ts
import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/kuenstler/portal"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

```

### app/sitemap.ts

```ts
import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/veranstaltung`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ];

  let bildUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/bilder?limit=1000`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const bilder: { id: number }[] = await res.json();
      bildUrls = bilder.map((b) => ({
        url: `${SITE}/bilder/${b.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {}

  return [...staticPages, ...bildUrls];
}

```

### Frontend — App — Öffentliche Seiten


### app/veranstaltung/page.tsx

```tsx
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: { absolute: "Kunsttage auf der Ludwigshöhe 2026" },
  description:
    "Kunsttage auf der Ludwigshöhe 2026 – Schloss Villa Ludwigshöhe, Edenkoben – 17. und 18. Oktober 2026. Eintritt frei. Kunst für einen guten Zweck.",
  openGraph: {
    title: "Kunsttage auf der Ludwigshöhe 2026",
    description: "17. & 18. Oktober 2026 · Schloss Villa Ludwigshöhe · Edenkoben · Eintritt frei",
    images: [{ url: "/villa.jpg", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ExhibitionEvent",
  name: "Kunsttage auf der Ludwigshöhe 2026",
  description:
    "Jährliche Benefizkunstausstellung der Lions Clubs der Südpfalz im Schloss Villa Ludwigshöhe. Alle Erlöse für gemeinnützige Zwecke.",
  startDate: "2026-10-17T12:00:00+02:00",
  endDate: "2026-10-18T17:00:00+02:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  isAccessibleForFree: true,
  organizer: {
    "@type": "Organization",
    name: "Lions Clubs der Südpfalz",
  },
  location: {
    "@type": "Place",
    name: "Schloss Villa Ludwigshöhe",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Villastraße 64",
      postalCode: "67480",
      addressLocality: "Edenkoben",
      addressCountry: "DE",
    },
  },
  image: "/villa.jpg",
};

const TAGE = [
  { datum: "Samstag, 17. Oktober 2026", zeit: "12:00 – 18:00 Uhr" },
  { datum: "Sonntag, 18. Oktober 2026", zeit: "10:00 – 17:00 Uhr" },
];

export default function VeranstaltungPage() {
  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-96 md:h-[560px]">
        <Image
          src="/villa.jpg"
          alt="Säulengang der Schloss Villa Ludwigshöhe"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 space-y-2">
          <p className="text-lions-gold font-semibold uppercase tracking-widest text-sm">
            14. Kunsttage auf der Ludwigshöhe
          </p>
          <h1 className="text-4xl font-bold text-white">
            Kunst für einen guten Zweck
          </h1>
          <p className="text-gray-200 text-lg">
            Schloss Villa Ludwigshöhe · Edenkoben · Oktober 2026
          </p>
        </div>
      </div>

      {/* Termine + Info */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Termine */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <h2 className="text-xl font-bold text-lions-blue border-b border-lions-gold pb-3">
            Öffnungszeiten
          </h2>
          <div className="space-y-4">
            {TAGE.map((t) => (
              <div key={t.datum} className="flex items-start gap-4">
                <div className="mt-1 w-3 h-3 rounded-full bg-lions-gold flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">{t.datum}</p>
                  <p className="text-gray-500">{t.zeit}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="font-medium text-lions-blue w-24">Eintritt</span>
              <span>frei</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-lions-blue w-24">Veranstalter</span>
              <span>Lions Clubs Annweiler, Bad Bergzabern, Edenkoben, Germersheim, Haßloch</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-lions-blue w-24">Erlöse</span>
              <span>100 % für gemeinnützige Projekte in der Südpfalz</span>
            </div>
          </div>
        </div>

        {/* Adresse + Anfahrt */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <h2 className="text-xl font-bold text-lions-blue border-b border-lions-gold pb-3">
            Veranstaltungsort
          </h2>
          <div className="space-y-1">
            <p className="font-semibold text-gray-800 text-lg">Schloss Villa Ludwigshöhe</p>
            <p className="text-gray-600">Villastraße 64</p>
            <p className="text-gray-600">67480 Edenkoben</p>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-lions-blue">Anfahrt mit dem Auto</h3>
            <p className="text-gray-600">
              A65 Abfahrt Edenkoben, dann Richtung Rhodt. Die Villa liegt am Haardtrand
              oberhalb von Edenkoben, ca. 3 km vom Ortszentrum entfernt.
              Parkplätze sind vor Ort vorhanden.
            </p>

            <h3 className="font-semibold text-lions-blue pt-2">Anfahrt mit Bus & Bahn</h3>
            <p className="text-gray-600">
              S-Bahn S1 bis Bahnhof Edenkoben, dann Bus Linie 506 Richtung
              Rhodt/Schloss Villa Ludwigshöhe (Haltestelle Schloss Villa Ludwigshöhe).
            </p>
          </div>

          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Schloss+Villa+Ludwigsh%C3%B6he%2C+Villastra%C3%9Fe+64%2C+67480+Edenkoben"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-5 py-2 bg-lions-blue text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Route berechnen →
          </a>
        </div>
      </div>

      {/* Karte */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 pt-6 pb-4">
          <h2 className="text-xl font-bold text-lions-blue">Lage</h2>
          <p className="text-gray-500 text-sm mt-1">Schloss Villa Ludwigshöhe · Villastraße 64 · 67480 Edenkoben</p>
        </div>
        <iframe
          title="Lage des Schloss Villa Ludwigshöhe"
          src="https://www.openstreetmap.org/export/embed.html?bbox=8.0800%2C49.2720%2C8.0980%2C49.2810&layer=mapnik&marker=49.2762%2C8.0864"
          width="100%"
          height="420"
          className="border-0"
          loading="lazy"
        />
        <div className="px-8 py-3 text-xs text-gray-400">
          Karte: © <a href="https://www.openstreetmap.org/?mlat=49.2770&mlon=8.0890#map=17/49.2770/8.0890" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>-Mitwirkende
        </div>
      </div>

      {/* Über die Veranstaltung */}
      <div className="bg-lions-blue text-white rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-bold">Über die Kunsttage auf der Ludwigshöhe</h2>
        <p className="text-blue-100 leading-relaxed">
          Die Kunsttage auf der Ludwigshöhe sind eine jährliche Benefizausstellung der Lions Clubs der Südpfalz.
          Seit über einem Jahrzehnt präsentieren regionale Künstlerinnen und Künstler ihre Werke
          in einem der schönsten historischen Gebäude der Pfalz — der Schloss Villa Ludwigshöhe,
          einstiger Sommerresidenz König Ludwigs I. von Bayern.
        </p>
        <p className="text-blue-100 leading-relaxed">
          Der gesamte Erlös aus dem Kunstverkauf fließt in gemeinnützige Projekte der Region.
          Bisher konnten so über <span className="text-lions-gold font-semibold">100.000 Euro</span> für
          soziale Zwecke gesammelt werden.
        </p>
      </div>

    </div>
  );
}

```

### app/bilder/[id]/page.tsx

```tsx
import type { Metadata } from "next";
import BildDetailClient from "./BildDetailClient";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function fetchBild(id: string) {
  try {
    const res = await fetch(`${API}/bilder/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const bild = await fetchBild(params.id);
  if (!bild) return { title: "Bild" };

  const kuenstler = bild.kuenstler
    ? `${bild.kuenstler.db_vorname} ${bild.kuenstler.db_name}`.trim()
    : "";
  const title = kuenstler ? `${bild.bildtitel} – ${kuenstler}` : bild.bildtitel;
  const description = [
    bild.bildtechnik,
    bild.genre,
    bild.breite_rahmen_cm && bild.hoehe_rahmen_cm
      ? `${bild.breite_rahmen_cm} × ${bild.hoehe_rahmen_cm} cm`
      : null,
    bild.verkaufspreis ? `${bild.verkaufspreis.toFixed(0)} €` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const ogImage = bild.bild_url_web ? `${API}${bild.bild_url_web}` : undefined;

  return {
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "article",
    },
  };
}

export default async function BildDetailPage({ params }: { params: { id: string } }) {
  const bild = await fetchBild(params.id);

  const jsonLd = bild
    ? {
        "@context": "https://schema.org",
        "@type": "VisualArtwork",
        name: bild.bildtitel,
        artMedium: bild.bildtechnik,
        genre: bild.genre,
        width: bild.breite_rahmen_cm ? `${bild.breite_rahmen_cm} cm` : undefined,
        height: bild.hoehe_rahmen_cm ? `${bild.hoehe_rahmen_cm} cm` : undefined,
        offers: bild.verkaufspreis
          ? {
              "@type": "Offer",
              price: bild.verkaufspreis,
              priceCurrency: "EUR",
              availability:
                bild.verfuegbarkeit === "Verfügbar"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/SoldOut",
            }
          : undefined,
        creator: bild.kuenstler
          ? {
              "@type": "Person",
              name: `${bild.kuenstler.db_vorname} ${bild.kuenstler.db_name}`.trim(),
            }
          : undefined,
        image: bild.bild_url_web ? `${API}${bild.bild_url_web}` : undefined,
        url: `${SITE}/bilder/${params.id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BildDetailClient id={params.id} />
    </>
  );
}

```

### app/bilder/[id]/BildDetailClient.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBild, reservieren, getBildFotosPublic } from "@/lib/api";
import { Bild, BildFoto } from "@/lib/types";
import { formatBildNr, bildAlt } from "@/lib/utils";
import MerklistenButton from "@/components/MerklistenButton";

const API = process.env.NEXT_PUBLIC_API_URL;

function WandVorschau({ bild }: { bild: Bild }) {
  const h = (bild.hoehe_rahmen_cm ?? 0) > 0 ? bild.hoehe_rahmen_cm! : (bild.hoehe_cm ?? 0);
  const w = (bild.breite_rahmen_cm ?? 0) > 0 ? bild.breite_rahmen_cm! : (bild.breite_cm ?? 0);
  if (h === 0 && w === 0) return null;

  const SCENE_W = 600;
  const SCENE_H = 380;
  const FLOOR_PX = 44;
  const floor_y = SCENE_H - FLOOR_PX;

  const DOOR_H_CM = 200, DOOR_W_CM = 90;
  const roomH_cm = Math.max(240, h + 60);
  const scale = (floor_y - 10) / roomH_cm;

  const door_h = DOOR_H_CM * scale;
  const door_w = DOOR_W_CM * scale;
  const door_x = SCENE_W - door_w - 50;
  const door_y = floor_y - door_h;

  const img_h = h * scale;
  const img_w = w * scale;

  const hang_y = floor_y - 155 * scale;
  const img_y = hang_y - img_h / 2;
  const img_x = (door_x - img_w) / 2;

  const imgSrc = bild.bild_url_web ? `${API}${bild.bild_url_web}` : null;

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 mb-1.5 text-center">
        Wandansicht (maßstabgerecht) · Tür als Referenz: 200 × 90 cm
      </p>
      <svg
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        className="w-full rounded-lg overflow-hidden border border-gray-100"
        style={{ background: "#f5f0eb" }}
      >
        <rect x={0} y={0} width={SCENE_W} height={floor_y} fill="#f5f0eb" />
        <rect x={0} y={floor_y} width={SCENE_W} height={FLOOR_PX} fill="#d9cfc3" />
        <rect x={0} y={floor_y} width={SCENE_W} height={5} fill="#c8bdb0" />

        <rect x={img_x + 5} y={img_y + 5} width={img_w} height={img_h}
          fill="rgba(0,0,0,0.12)" rx={2} />
        <rect x={img_x} y={img_y} width={img_w} height={img_h}
          fill="#7a5c2e" rx={2} />
        <rect x={img_x + 5} y={img_y + 5} width={img_w - 10} height={img_h - 10}
          fill="#ede8e0" />
        {imgSrc ? (
          <image href={imgSrc}
            x={img_x + 5} y={img_y + 5}
            width={img_w - 10} height={img_h - 10}
            preserveAspectRatio="xMidYMid meet" />
        ) : (
          <text x={img_x + img_w / 2} y={img_y + img_h / 2}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fill="#bbb">Kein Foto</text>
        )}
        <line x1={img_x + img_w / 2} y1={img_y} x2={img_x + img_w / 2} y2={img_y - 6}
          stroke="#888" strokeWidth={1.5} />
        <circle cx={img_x + img_w / 2} cy={img_y - 7} r={2.5} fill="#999" />

        <text x={img_x + img_w / 2} y={Math.min(img_y + img_h + 16, floor_y - 4)}
          textAnchor="middle" fontSize={11} fill="#666" fontFamily="sans-serif">
          {w} × {h} cm
        </text>

        <rect x={door_x - 7} y={door_y - 4} width={door_w + 14} height={door_h + 4}
          fill="#c4b5a2" rx={2} />
        <rect x={door_x} y={door_y} width={door_w} height={door_h}
          fill="#e4d9cc" />
        <rect x={door_x + 7} y={door_y + 10} width={door_w - 14} height={door_h * 0.42}
          fill="none" stroke="#cfc3b4" strokeWidth={1.5} rx={2} />
        <rect x={door_x + 7} y={door_y + door_h * 0.52} width={door_w - 14} height={door_h * 0.38}
          fill="none" stroke="#cfc3b4" strokeWidth={1.5} rx={2} />
        <circle cx={door_x + 14} cy={door_y + door_h * 0.55} r={4} fill="#b0a090" />
        <circle cx={door_x + 14} cy={door_y + door_h * 0.55} r={2} fill="#c8b8a4" />

        <text x={door_x + door_w / 2} y={door_y - 11}
          textAnchor="middle" fontSize={10} fill="#aaa" fontFamily="sans-serif">
          200 × 90 cm
        </text>
      </svg>
    </div>
  );
}

export default function BildDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [bild, setBild] = useState<Bild | null>(null);
  const [fehler, setFehler] = useState("");
  const [form, setForm] = useState({ vorname: "", name: "", email: "", telefon: "" });
  const [erfolg, setErfolg] = useState(false);
  const [senden, setSenden] = useState(false);
  const [dsgvo, setDsgvo] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [aktivFoto, setAktivFoto] = useState<string | null>(null);
  const [zusatzFotos, setZusatzFotos] = useState<BildFoto[]>([]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  useEffect(() => {
    getBild(Number(id)).then(b => { setBild(b); setAktivFoto(b.bild_url_web ?? null); }).catch(() => setFehler("Bild nicht gefunden."));
    getBildFotosPublic(Number(id)).then(setZusatzFotos).catch(() => {});
  }, [id]);

  async function handleReservieren(e: React.FormEvent) {
    e.preventDefault();
    if (!bild || !dsgvo) return;
    setSenden(true);
    try {
      await reservieren({ bild_id: bild.id, ...form });
      setErfolg(true);
      setBild({ ...bild, verfuegbarkeit: "Reserviert" });
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setSenden(false);
    }
  }

  if (fehler) return <p className="text-red-600">{fehler}</p>;
  if (!bild) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  const imgSrc = aktivFoto ? `${API}${aktivFoto}` : "/placeholder.jpg";
  const alleUrls = [bild.bild_url_web, ...zusatzFotos.map(f => f.url)].filter(Boolean) as string[];

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-lions-blue hover:text-blue-900"
      >
        ← Zurück zur Galerie
      </button>
      <div className="grid md:grid-cols-2 gap-10">
        {/* Bild + Wandansicht */}
        <div>
          {lightbox && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
              onClick={() => setLightbox(false)}
            >
              <img
                src={imgSrc}
                alt={bildAlt(bild)}
                className="max-w-full max-h-full object-contain select-none"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
              />
            </div>
          )}
          <img
            src={imgSrc}
            alt={bildAlt(bild)}
            className="w-full rounded-lg shadow-lg object-contain max-h-[600px] cursor-zoom-in"
            onClick={() => setLightbox(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
          />

          {alleUrls.length > 1 && (
            <div className="flex gap-2 mt-3">
              {alleUrls.map(url => (
                <button
                  key={url}
                  onClick={() => setAktivFoto(url)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    aktivFoto === url ? "border-lions-blue" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={`${API}${url}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <WandVorschau bild={bild} />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-lions-blue">{bild.bildtitel}</h1>
              <MerklistenButton bildId={bild.id} size="md" className="flex-shrink-0 mt-1" />
            </div>

            {bild.kuenstler && (
              <div className="mt-3 flex items-start gap-3">
                {bild.kuenstler.portrait_foto ? (
                  <img
                    src={`${API}${bild.kuenstler.portrait_foto}`}
                    alt={`Portrait ${bild.kuenstler.db_vorname ?? ""} ${bild.kuenstler.db_name ?? ""}`.trim()}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 mt-0.5 shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-lions-blue/10 flex items-center justify-center
                    text-lions-blue font-bold text-sm flex-shrink-0 mt-0.5">
                    {bild.kuenstler.db_vorname?.[0]}{bild.kuenstler.db_name?.[0]}
                  </div>
                )}

                <div className="min-w-0">
                  <a href={`/kuenstler/${bild.kuenstler.id}`}
                    className="text-lg font-medium text-gray-800 hover:text-lions-blue transition-colors">
                    {bild.kuenstler.db_vorname} {bild.kuenstler.db_name}
                  </a>
                  {bild.kuenstler.db_beruf && (
                    <p className="text-sm text-gray-500">{bild.kuenstler.db_beruf}</p>
                  )}
                  {bild.kuenstler.db_kommentar && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">
                      {bild.kuenstler.db_kommentar}
                    </p>
                  )}
                  <a href={`/kuenstler/${bild.kuenstler.id}`}
                    className="inline-block mt-1.5 text-xs text-lions-blue hover:underline">
                    Portrait & Vita ansehen →
                  </a>
                </div>
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Technik</dt>
            <dd className="font-medium">{bild.bildtechnik}</dd>
            <dt className="text-gray-500">Genre</dt>
            <dd className="font-medium">{bild.genre}</dd>
            {(bild.breite_rahmen_cm > 0 || bild.hoehe_rahmen_cm > 0) && (
              <>
                <dt className="text-gray-500">Maße mit Rahmen</dt>
                <dd className="font-medium">{bild.breite_rahmen_cm} × {bild.hoehe_rahmen_cm} cm</dd>
              </>
            )}
            {(bild.breite_cm || bild.hoehe_cm) && (
              <>
                <dt className="text-gray-500">Maße ohne Rahmen</dt>
                <dd className="font-medium">
                  {bild.breite_cm ?? "?"} × {bild.hoehe_cm ?? "?"} cm
                  {bild.tiefe_cm ? ` × ${bild.tiefe_cm} cm` : ""}
                </dd>
              </>
            )}
            {bild.gewicht_kg && (
              <>
                <dt className="text-gray-500">Gewicht</dt>
                <dd className="font-medium">{bild.gewicht_kg} kg</dd>
              </>
            )}
            <dt className="text-gray-500">Nr.</dt>
            <dd className="font-medium text-gray-400">{formatBildNr(bild.bild_nr)}</dd>
            {bild.verkaufspreis && (
              <>
                <dt className="text-gray-500">Preis</dt>
                <dd className="font-bold text-lions-blue text-lg">{bild.verkaufspreis.toFixed(0)} €</dd>
              </>
            )}
          </dl>

          {bild.anmerkung_bild && (
            <div className="bg-gray-50 rounded-md px-4 py-3 text-sm text-gray-600 leading-relaxed">
              {bild.anmerkung_bild}
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              bild.verfuegbarkeit === "Verfügbar" ? "bg-green-100 text-green-800" :
              bild.verfuegbarkeit === "Reserviert" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {bild.verfuegbarkeit}
            </div>
            {bild.in_ausstellung === false && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Online-Katalog
              </div>
            )}
          </div>

          {bild.verfuegbarkeit === "Verfügbar" && !erfolg && (
            <form onSubmit={handleReservieren} className="space-y-4 border-t pt-6">
              <h2 className="font-semibold text-gray-800">Werk reservieren</h2>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Vorname" value={form.vorname}
                  onChange={(e) => setForm({ ...form, vorname: e.target.value })}
                  className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-lions-blue" />
                <input required placeholder="Nachname" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-lions-blue" />
              </div>
              <input required type="email" placeholder="E-Mail" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-lions-blue" />
              <input placeholder="Telefon (optional)" value={form.telefon}
                onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-lions-blue" />
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={dsgvo} onChange={(e) => setDsgvo(e.target.checked)} className="mt-0.5" required />
                Ich stimme der Verarbeitung meiner Daten zur Abwicklung der Reservierung zu (DSGVO).
              </label>
              {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
              <button type="submit" disabled={senden || !dsgvo}
                className="w-full bg-lions-blue text-white py-2 rounded-md font-medium hover:bg-blue-900 transition-colors disabled:opacity-50">
                {senden ? "Wird gesendet…" : "Jetzt reservieren"}
              </button>
            </form>
          )}

          {erfolg && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
              Ihre Reservierung wurde bestätigt. Sie erhalten eine E-Mail-Bestätigung.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

```

### app/merkliste/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMerkliste } from "@/lib/MerklisteContext";
import { getMerkliste, merklisteZusenden } from "@/lib/api";
import { formatBildNr, bildAlt } from "@/lib/utils";
import { Bild } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MerklistePage() {
  const { token, email, telefon, ids, toggle, openModal, updateProfil } = useMerkliste();
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [laden, setLaden] = useState(false);
  const [mailLaden, setMailLaden] = useState(false);
  const [mailStatus, setMailStatus] = useState<"" | "ok" | "fehler">("");
  const [emailErgaenzen, setEmailErgaenzen] = useState(false);
  const [neueEmail, setNeueEmail] = useState("");
  const [neuesTelefon, setNeuesTelefon] = useState("");
  const [profilLaden, setProfilLaden] = useState(false);

  const druckTitel = email
    ? `Kunsttag26_Merkliste_von_${email}`
    : "Kunsttag26_Merkliste";

  useEffect(() => {
    document.title = druckTitel;
    return () => { document.title = "Kunsttage auf der Ludwigshöhe"; };
  }, [druckTitel]);

  useEffect(() => {
    if (!token) return;
    setLaden(true);
    getMerkliste(token)
      .then(data => setBilder(data.bilder))
      .finally(() => setLaden(false));
  }, [token]);

  async function handleProfilSpeichern() {
    setProfilLaden(true);
    try {
      await updateProfil(neueEmail || undefined, neuesTelefon || undefined);
      setEmailErgaenzen(false);
      setNeueEmail(""); setNeuesTelefon("");
    } finally { setProfilLaden(false); }
  }

  async function handleZusenden() {
    if (!token) return;
    setMailLaden(true); setMailStatus("");
    try {
      await merklisteZusenden(token);
      setMailStatus("ok");
      setTimeout(() => setMailStatus(""), 4000);
    } catch {
      setMailStatus("fehler");
      setTimeout(() => setMailStatus(""), 4000);
    } finally { setMailLaden(false); }
  }

  async function handleRemove(bildId: number) {
    await toggle(bildId);
    setBilder(prev => prev.filter(b => b.id !== bildId));
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-5 text-gray-300">♡</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ihre Merkliste</h1>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Melden Sie sich an, um Ihre persönliche Favoritenliste zu erstellen und zur Ausstellung mitzubringen.
        </p>
        <button
          onClick={openModal}
          className="bg-lions-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors">
          Anmelden / Merkliste erstellen
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Kontakt-Info + E-Mail ergänzen */}
      {token && (
        <div className="mb-4 print:hidden">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {email && <span>✉ {email}</span>}
            {telefon && <span>☏ {telefon}</span>}
            <button onClick={() => { setEmailErgaenzen(v => !v); setNeueEmail(email ?? ""); setNeuesTelefon(telefon ?? ""); }}
              className="text-lions-blue hover:underline text-xs">
              {emailErgaenzen ? "Abbrechen" : (email && telefon) ? "Kontakt bearbeiten" : "Kontakt ergänzen"}
            </button>
          </div>
          {emailErgaenzen && (
            <div className="mt-3 flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">E-Mail</label>
                <input type="email" value={neueEmail} onChange={e => setNeueEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-lions-blue w-56" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telefon</label>
                <input type="tel" value={neuesTelefon} onChange={e => setNeuesTelefon(e.target.value)}
                  placeholder="0611 12345"
                  className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-lions-blue w-40" />
              </div>
              <button onClick={handleProfilSpeichern} disabled={profilLaden || (!neueEmail && !neuesTelefon)}
                className="px-4 py-1.5 bg-lions-blue text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50">
                {profilLaden ? "…" : "Speichern"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bildschirm-Kopfzeile */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-lions-blue">Meine Merkliste</h1>
        {bilder.length > 0 && (
          <div className="flex items-center gap-2">
            {/* E-Mail senden */}
            {email && (
              <div className="flex items-center gap-2">
                {mailStatus === "ok" && (
                  <span className="text-sm text-green-600">✓ Gesendet an {email}</span>
                )}
                {mailStatus === "fehler" && (
                  <span className="text-sm text-red-500">Fehler beim Senden</span>
                )}
                <button
                  onClick={handleZusenden}
                  disabled={mailLaden}
                  className="flex items-center gap-2 border border-lions-blue text-lions-blue px-4 py-2 rounded-lg text-sm font-medium hover:bg-lions-blue/5 transition-colors disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {mailLaden ? "Wird gesendet…" : "Per E-Mail senden"}
                </button>
              </div>
            )}
            {/* Drucken */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-lions-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Liste drucken
            </button>
          </div>
        )}
      </div>

      {/* Druck-Kopfzeile */}
      <div className="hidden print:block mb-8">
        <div className="flex justify-between items-start border-b pb-4 mb-2">
          <div>
            <h1 className="text-xl font-bold">{druckTitel}</h1>
            <p className="text-sm text-gray-600 mt-0.5">Schloss Villa Ludwigshöhe · Edenkoben</p>
          </div>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <p className="text-sm text-gray-500 italic">Bitte bringen Sie diese Liste zur Ausstellung mit. Die Preise sind unverbindlich.</p>
      </div>

      {laden ? (
        <p className="text-gray-400 animate-pulse">Laden…</p>
      ) : bilder.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>Ihre Merkliste ist leer.</p>
          <Link href="/" className="inline-block mt-3 text-lions-blue hover:underline text-sm">
            Zur Galerie →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {bilder.map((b, i) => (
              <div key={b.id}
                className="bg-white rounded-lg shadow-sm border p-4 flex gap-4 items-start print:shadow-none print:border-gray-200 print:rounded-none print:border-0 print:border-b">
                {/* Laufende Nummer (nur Druck) */}
                <span className="hidden print:block text-gray-400 text-sm pt-1 w-5 flex-shrink-0">{i + 1}.</span>

                {/* Thumbnail */}
                <div className="w-20 flex-shrink-0 rounded overflow-hidden bg-gray-100 print:w-16">
                  {b.bild_url_web ? (
                    <img src={`${API}${b.bild_url_web}`} alt={bildAlt(b)}
                      className="w-full h-auto block" />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center text-gray-300 text-xs">—</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <a href={`/bilder/${b.id}`}
                      className="font-semibold text-gray-900 hover:text-lions-blue transition-colors print:text-black print:no-underline">
                      {b.bildtitel}
                    </a>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.verfuegbarkeit === "Verfügbar" ? "bg-green-100 text-green-800" :
                      b.verfuegbarkeit === "Reserviert" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>{b.verfuegbarkeit}</span>
                  </div>
                  {b.kuenstler && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {b.kuenstler.db_vorname} {b.kuenstler.db_name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                    <span className="font-mono text-gray-400">Nr. {formatBildNr(b.bild_nr)}</span>
                    <span>{b.bildtechnik}</span>
                    {b.breite_rahmen_cm > 0 && (
                      <span>{b.breite_rahmen_cm} × {b.hoehe_rahmen_cm} cm</span>
                    )}
                    {b.verkaufspreis && (
                      <span className="text-lions-blue font-semibold print:text-black">
                        {b.verkaufspreis.toFixed(0)} €
                      </span>
                    )}
                  </div>
                  {b.anmerkung_bild && (
                    <p className="mt-1.5 text-xs text-gray-500 italic leading-relaxed">
                      {b.anmerkung_bild}
                    </p>
                  )}
                </div>

                {/* Entfernen-Button */}
                <button
                  onClick={() => handleRemove(b.id)}
                  className="print:hidden text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Entfernen">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400 mt-4 print:hidden">
            {bilder.length} {bilder.length === 1 ? "Werk" : "Werke"} gespeichert
          </p>
        </>
      )}
    </div>
  );
}

```

### app/merkliste/abmelden/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AbmeldenPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"laden" | "ok" | "fehler">("laden");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("fehler");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/merkliste/abmelden?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        setEmail(data.email ?? "");
        setStatus("ok");
      })
      .catch(() => setStatus("fehler"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-sm max-w-md w-full p-8 text-center">
        {status === "laden" && (
          <p className="text-gray-500 animate-pulse">Einen Moment…</p>
        )}
        {status === "ok" && (
          <>
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Abgemeldet</h1>
            <p className="text-gray-600 text-sm mb-6">
              {email ? (
                <><strong>{email}</strong> erhält keine weiteren E-Mails von den Kunsttagen.</>
              ) : (
                "Sie erhalten keine weiteren E-Mails von den Kunsttagen."
              )}
            </p>
            <Link href="/" className="text-sm text-lions-blue hover:underline">
              Zur Startseite
            </Link>
          </>
        )}
        {status === "fehler" && (
          <>
            <div className="text-4xl mb-4">✕</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Link ungültig</h1>
            <p className="text-gray-600 text-sm mb-6">
              Der Abmelde-Link ist nicht mehr gültig oder wurde bereits verwendet.
            </p>
            <Link href="/" className="text-sm text-lions-blue hover:underline">
              Zur Startseite
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

```

### app/impressum/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";

export default function ImpressumPage() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/einstellungen/impressum`)
      .then(r => r.json())
      .then(d => setText(d.text))
      .catch(() => setText("Impressum konnte nicht geladen werden."));
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {text === null ? (
        <p className="text-gray-400 animate-pulse">Laden…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">{text}</pre>
        </div>
      )}
    </div>
  );
}

```

### app/datenschutz/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";

export default function DatenschutzPage() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/einstellungen/datenschutz`)
      .then(r => r.json())
      .then(d => setText(d.text))
      .catch(() => setText("Datenschutzerklärung konnte nicht geladen werden."));
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {text === null ? (
        <p className="text-gray-400 animate-pulse">Laden…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">{text}</pre>
        </div>
      )}
    </div>
  );
}

```

### Frontend — App — Admin-Bereich


### app/admin/archiv/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Gruppe { name: string; anzahl: number; }
interface Vorschau { prafix: string; jahr: string; anzahl: number; gruppen: Gruppe[]; }
interface ArchivErgebnis { archiviert: number; dateien_verschoben: number; zielverzeichnis: string; csv: string; fehler: string[]; }
interface ArchivEintrag { jahr: string; datei: string; pfad: string; anzahl: number; }
interface ReimportErgebnis { importiert: number; import_fehler: any[]; dateien_zurueck: number; datei_fehler: string[]; }

export default function ArchivPage() {
  // Archivieren
  const [prafix, setPrafix] = useState("");
  const [vorschau, setVorschau] = useState<Vorschau | null>(null);
  const [vorschauLaden, setVorschauLaden] = useState(false);
  const [archivLaden, setArchivLaden] = useState(false);
  const [archivErgebnis, setArchivErgebnis] = useState<ArchivErgebnis | null>(null);
  const [archivFehler, setArchivFehler] = useState("");

  // Rück-Import
  const [archive, setArchive] = useState<ArchivEintrag[]>([]);
  const [archiveLaden, setArchiveLaden] = useState(true);
  const [reimportPfad, setReimportPfad] = useState<string | null>(null);
  const [reimportLaden, setReimportLaden] = useState(false);
  const [reimportErgebnis, setReimportErgebnis] = useState<ReimportErgebnis | null>(null);

  function ladeArchive() {
    setArchiveLaden(true);
    fetch(`${API}/admin/archiv/liste`)
      .then(r => r.json()).then(setArchive)
      .finally(() => setArchiveLaden(false));
  }
  useEffect(ladeArchive, []);

  async function handleVorschau() {
    setArchivFehler(""); setVorschau(null); setArchivErgebnis(null);
    setVorschauLaden(true);
    try {
      const res = await fetch(`${API}/admin/archiv/vorschau?prafix=${encodeURIComponent(prafix)}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setVorschau(await res.json());
    } catch (e: any) { setArchivFehler(e.message); }
    finally { setVorschauLaden(false); }
  }

  async function handleArchivieren() {
    if (!vorschau) return;
    setArchivFehler(""); setArchivLaden(true);
    try {
      const res = await fetch(`${API}/admin/archiv/erstellen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prafix }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setArchivErgebnis(await res.json());
      setVorschau(null);
      ladeArchive();
    } catch (e: any) { setArchivFehler(e.message); }
    finally { setArchivLaden(false); }
  }

  async function handleReimport(pfad: string) {
    setReimportPfad(pfad); setReimportErgebnis(null); setReimportLaden(true);
    try {
      const res = await fetch(`${API}/admin/archiv/reimport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pfad }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setReimportErgebnis(await res.json());
    } catch (e: any) { alert(e.message); }
    finally { setReimportLaden(false); setReimportPfad(null); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-lions-blue mb-1">Archivierung</h1>
        <p className="text-gray-500 text-sm">
          Bilder eines Nummernkreises als CSV exportieren, Bilddateien ins Archivverzeichnis verschieben und aus der Datenbank entfernen — oder ein bestehendes Archiv zurück importieren.
        </p>
      </div>

      {/* ── ARCHIVIEREN ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Nummernkreis archivieren</h2>

        {archivErgebnis ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-3">Archivierung abgeschlossen</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p>✓ <strong>{archivErgebnis.archiviert}</strong> Bilder aus der Datenbank entfernt</p>
              <p>✓ <strong>{archivErgebnis.dateien_verschoben}</strong> Bilddateien verschoben</p>
              <p>✓ CSV: <code className="bg-green-100 px-1 rounded text-xs">{archivErgebnis.csv}</code></p>
              <p>✓ Verzeichnis: <code className="bg-green-100 px-1 rounded text-xs">{archivErgebnis.zielverzeichnis}</code></p>
            </div>
            {archivErgebnis.fehler.length > 0 && (
              <div className="mt-2 text-sm text-red-600">{archivErgebnis.fehler.map((f, i) => <p key={i}>{f}</p>)}</div>
            )}
            <button onClick={() => { setArchivErgebnis(null); setPrafix(""); }}
              className="mt-4 px-4 py-2 bg-green-700 text-white text-sm rounded-md hover:bg-green-800">
              Neue Archivierung
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nummernkreis-Präfix</label>
              <p className="text-xs text-gray-400 mb-2">
                Jahrgang: <code className="bg-gray-100 px-1 rounded">25.</code> · Jahrgang + Künstler: <code className="bg-gray-100 px-1 rounded">25.400.</code>
              </p>
              <div className="flex gap-3">
                <input type="text" value={prafix}
                  onChange={e => { setPrafix(e.target.value); setVorschau(null); setArchivFehler(""); }}
                  placeholder="z. B. 25. oder 25.400."
                  className="flex-1 border rounded-md px-3 py-2 text-sm bg-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-lions-blue"
                />
                <button onClick={handleVorschau} disabled={!prafix.trim() || vorschauLaden}
                  className="px-4 py-2 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 disabled:opacity-40 whitespace-nowrap">
                  {vorschauLaden ? "Laden…" : "Vorschau"}
                </button>
              </div>
              {archivFehler && <p className="mt-2 text-sm text-red-600">{archivFehler}</p>}
            </div>

            {vorschau && (
              <div>
                <div className="mb-3">
                  <p className="font-medium text-gray-800">
                    Archiv <span className="text-lions-blue font-mono">{vorschau.jahr}</span>
                    <span className="text-gray-400 font-normal text-sm ml-2">(Präfix {vorschau.prafix})</span>
                  </p>
                  <p className="text-sm text-gray-500"><strong>{vorschau.anzahl}</strong> Bilder werden archiviert</p>
                </div>
                <div className="border rounded-md overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase tracking-wide">
                        <th className="px-4 py-2 text-left font-medium">Unterverzeichnis</th>
                        <th className="px-4 py-2 text-right font-medium">Bilder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vorschau.gruppen.map(g => (
                        <tr key={g.name}>
                          <td className="px-4 py-2 font-mono text-gray-700 text-xs">{g.name}/</td>
                          <td className="px-4 py-2 text-right text-gray-600">{g.anzahl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3 text-sm text-yellow-800">
                  <strong>Achtung:</strong> {vorschau.anzahl} Bilder werden dauerhaft aus der Datenbank gelöscht.
                </div>
                <div className="flex gap-3">
                  <button onClick={handleArchivieren} disabled={archivLaden}
                    className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 disabled:opacity-40">
                    {archivLaden ? "Archiviere…" : `${vorschau.anzahl} Bilder archivieren`}
                  </button>
                  <button onClick={() => setVorschau(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── RÜCK-IMPORT ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Archiv zurück importieren</h2>

        {reimportErgebnis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Rück-Import abgeschlossen</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>✓ <strong>{reimportErgebnis.importiert}</strong> Bilder in die Datenbank importiert</p>
              <p>✓ <strong>{reimportErgebnis.dateien_zurueck}</strong> Bilddateien zurückverschoben</p>
            </div>
            {reimportErgebnis.datei_fehler.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {reimportErgebnis.datei_fehler.map((f, i) => <p key={i}>{f}</p>)}
              </div>
            )}
            <button onClick={() => setReimportErgebnis(null)}
              className="mt-3 px-3 py-1.5 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800">
              OK
            </button>
          </div>
        )}

        {archiveLaden ? (
          <p className="text-gray-400 text-sm">Laden…</p>
        ) : archive.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 text-sm">
            Noch keine archivierten Nummernkreise vorhanden.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-2 text-left font-medium">Jahr</th>
                  <th className="px-4 py-2 text-left font-medium">Datei</th>
                  <th className="px-4 py-2 text-right font-medium">Bilder</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {archive.map(a => (
                  <tr key={a.pfad} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-lions-blue font-medium">{a.jahr}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.datei}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{a.anzahl}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`${a.anzahl} Bilder aus „${a.datei}" zurück in die Datenbank importieren?`))
                            handleReimport(a.pfad);
                        }}
                        disabled={reimportLaden && reimportPfad === a.pfad}
                        className="px-3 py-1.5 bg-lions-blue text-white text-xs font-medium rounded-md hover:bg-blue-900 disabled:opacity-40 whitespace-nowrap"
                      >
                        {reimportLaden && reimportPfad === a.pfad ? "Importiere…" : "Zurück importieren"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

```

### app/admin/bilder/aufsteller/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { getAlleBilder } from "@/lib/api";
import { Bild } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AufstellerPage() {
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState("");
  const [vorschau, setVorschau] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("suche");
    if (s) setSuche(s);
    if (params.get("vorschau") === "1") setVorschau(true);
  }, []);

  useEffect(() => {
    getAlleBilder()
      .then(alle => setBilder(alle.filter(b => b.in_ausstellung && b.freigegeben)))
      .finally(() => setLaden(false));
  }, []);

  // Druckvorschau automatisch öffnen wenn ?vorschau=1
  useEffect(() => {
    if (vorschau && !laden && bilder.length > 0) {
      const t = setTimeout(() => window.print(), 800);
      return () => clearTimeout(t);
    }
  }, [vorschau, laden, bilder]);

  // App-Chrome beim Drucken ausblenden
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "aufsteller-print";
    style.textContent = `
      @page { size: A4 portrait; margin: 0; }
      @media print {
        header, footer, nav, .no-print { display: none !important; }
        body { margin: 0; }
        main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
        .aufsteller-card { height: 97mm !important; overflow: hidden !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("aufsteller-print")?.remove();
  }, []);

  function abmessungen(b: Bild): string {
    const hatRahmen = b.breite_rahmen_cm && b.hoehe_rahmen_cm;
    const hatOhne = b.breite_cm && b.hoehe_cm;
    const unterschiedlich = hatRahmen && hatOhne &&
      (b.breite_rahmen_cm !== b.breite_cm || b.hoehe_rahmen_cm !== b.hoehe_cm);

    if (unterschiedlich)
      return `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm} cm (mit Rahmen) · ${b.breite_cm} × ${b.hoehe_cm} cm ohne Rahmen`;
    if (hatRahmen)
      return `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm} cm`;
    if (hatOhne)
      return `${b.breite_cm} × ${b.hoehe_cm} cm`;
    return "—";
  }

  const terme = suche.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const sichtbar = terme.length
    ? bilder.filter(b => {
        const kuenstlerName = `${b.kuenstler?.db_vorname ?? ""} ${b.kuenstler?.db_name ?? ""}`.toLowerCase();
        return terme.some(t =>
          b.bild_nr.toLowerCase().includes(t) ||
          b.bildtitel.toLowerCase().includes(t) ||
          kuenstlerName.includes(t)
        );
      })
    : bilder;

  if (laden) return <p className="p-8 text-gray-400">Laden…</p>;

  return (
    <div>
      {/* Toolbar — nur am Bildschirm sichtbar, nicht im Vorschau-Fenster */}
      <div className={`no-print flex items-center gap-4 px-6 py-3 bg-white border-b sticky top-0 z-10${vorschau ? " hidden" : ""}`}>
        <div className="flex-1">
          <h1 className="font-bold text-lions-blue">Bildaufsteller</h1>
          <p className="text-xs text-gray-400">
            {terme.length ? `${sichtbar.length} von ${bilder.length} Aufstellern` : `${bilder.length} freigegebene Ausstellungsbilder`}
            {" · 6 pro A4-Seite (Hochformat, 2×3)"}
          </p>
        </div>
        <input
          type="search"
          placeholder="Bild-Nr., Titel oder Künstler…"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue w-64"
        />
        {terme.length > 0 && (
          <button
            onClick={() => setSuche("")}
            className="text-sm text-gray-400 hover:text-gray-700 px-2">
            Alle anzeigen
          </button>
        )}
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (suche.trim()) params.set("suche", suche.trim());
            params.set("vorschau", "1");
            window.open(`/admin/bilder/aufsteller?${params.toString()}`, "_blank");
          }}
          className="px-4 py-2 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 whitespace-nowrap">
          {terme.length ? `${sichtbar.length} drucken` : "Alle drucken"}
        </button>
      </div>

      {/* Aufsteller-Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2mm",
        padding: "0",
      }}>
        {sichtbar.map(b => (
          <Aufsteller key={b.id} bild={b} abmessungen={abmessungen(b)} />
        ))}
      </div>

      {sichtbar.length === 0 && (
        <p className="no-print text-center text-gray-400 py-16">Keine Aufsteller gefunden für „{suche.trim()}"</p>
      )}
    </div>
  );
}

function Aufsteller({ bild: b, abmessungen }: { bild: Bild; abmessungen: string }) {
  const kuenstler = b.kuenstler
    ? `${b.kuenstler.db_vorname} ${b.kuenstler.db_name}`.trim()
    : "—";
  const beruf = b.kuenstler?.db_beruf ?? "";
  const leben = b.kuenstler?.db_leben ?? "";

  return (
    <div className="aufsteller-card" style={{
      width: "104mm",
      height: "97mm",
      boxSizing: "border-box",
      padding: "6mm 8mm",
      border: "0.4px solid #aaa",
      pageBreakInside: "avoid",
      breakInside: "avoid",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Georgia, 'Times New Roman', serif",
      backgroundColor: "#fff",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2mm", flexShrink: 0 }}>
        <div style={{ fontSize: "6pt", color: "#888", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Kunsttage auf der Ludwigshöhe 2026
        </div>
        <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#0f2d5e", fontFamily: "monospace" }}>
          {formatBildNr(b.bild_nr)}
        </div>
      </div>

      <div style={{ borderTop: "1.5px solid #0f2d5e", marginBottom: "3mm", flexShrink: 0 }} />

      {/* Zweispaltiger Inhalt — flex:1 in definierter Kartenhöhe → kein Overflow */}
      <div style={{ display: "flex", gap: "4mm", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* Linke Spalte: Text */}
        <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
          <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1.15, marginBottom: "2mm" }}>
            {b.bildtitel}
          </div>
          <div style={{ fontSize: "8.5pt", color: "#333", marginBottom: "1mm" }}>
            {kuenstler}
            {(beruf || leben) && (
              <span style={{ fontSize: "7pt", color: "#888", marginLeft: "4px" }}>
                {[beruf, leben].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          <div style={{ fontSize: "7.5pt", color: "#555", lineHeight: 1.4 }}>
            {b.bildtechnik}
            {abmessungen !== "—" && (
              <span style={{ marginLeft: "6px", color: "#888" }}>· {abmessungen}</span>
            )}
          </div>
          <div style={{ fontSize: "6.5pt", color: "#777", fontStyle: "italic", marginTop: "1mm" }}>
            {b.anmerkung_bild ?? ""}
          </div>
        </div>

        {/* Rechte Spalte: Bild */}
        {b.bild_url_web && (
          <div style={{
            width: "30mm",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f8f8",
            borderRadius: "1mm",
            overflow: "hidden",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API}${b.bild_url_web}`}
              alt={b.bildtitel}
              style={{ maxWidth: "100%", maxHeight: "55mm", objectFit: "contain", display: "block" }}
            />
          </div>
        )}
      </div>

      {/* Preis — direktes Flex-Kind der Karte, immer am Kartenende */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "0.5px solid #eee", paddingTop: "2mm", marginTop: "2mm", flexShrink: 0 }}>
        <div style={{ fontSize: "6.5pt", color: "#aaa" }}>
          {b.genre}
        </div>
        <div style={{ fontSize: "17pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1 }}>
          {b.verkaufspreis ? `${b.verkaufspreis.toLocaleString("de-DE")} €` : "auf Anfrage"}
        </div>
      </div>
    </div>
  );
}

```

### app/admin/bilder/page.tsx

```tsx
"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { getAlleBilder, massenFreigeben, bilderFreigeben, preisSetzen, fotoHochladen, getAlleKuenstler, bildNeuAnlegen, ausstellungToggle, bildAktualisieren, bildLoeschen, aiBeschreibungGenerieren, getZusatzFotos, zusatzFotoHochladen, zusatzFotoLoeschen } from "@/lib/api";
import { BildFoto } from "@/lib/types";
import { Bild, Kuenstler } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const GENRES = ["Abstrakt","Akt","Landschaft","Menschen","Pfalz","Portrait","Städte","Stilleben","Sonstiges"];
type Filter = "alle" | "offen" | "mit_foto" | "ohne_foto" | "online" | "verfuegbar" | "reserviert" | "verkauft";
type SortKey = "kuenstler" | "titel" | "bild_nr" | "genre" | "einlieferungspreis" | "verkaufspreis";
type SortDir = "asc" | "desc";

function NeuModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Bild) => void }) {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [form, setForm] = useState({
    kuenstler_id: "", bildtitel: "", bildtechnik: "", genre: "Abstrakt",
    breite_rahmen_cm: "", hoehe_rahmen_cm: "", einlieferungspreis: "",
    in_ausstellung: true, abrechnungsempf: "Künstler", galerist_id: "",
  });
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => { getAlleKuenstler().then(setKuenstler); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const bild = await bildNeuAnlegen({
        kuenstler_id: Number(form.kuenstler_id),
        bildtitel: form.bildtitel,
        bildtechnik: form.bildtechnik,
        genre: form.genre,
        breite_rahmen_cm: Number(form.breite_rahmen_cm) || 0,
        hoehe_rahmen_cm: Number(form.hoehe_rahmen_cm) || 0,
        einlieferungspreis: form.einlieferungspreis ? Number(form.einlieferungspreis) : undefined,
        in_ausstellung: form.in_ausstellung,
        abrechnungsempf: form.abrechnungsempf,
        galerist_id: form.abrechnungsempf === "Galerist" && form.galerist_id ? Number(form.galerist_id) : undefined,
      });
      onCreated(bild);
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  const inp = "w-full border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Neues Bild anlegen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Künstler *</label>
            <select required value={form.kuenstler_id} onChange={e => setForm({...form, kuenstler_id: e.target.value})} className={inp}>
              <option value="">— bitte wählen —</option>
              {kuenstler.map(k => (
                <option key={k.id} value={k.id}>{k.db_vorname} {k.db_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bildtitel *</label>
            <input required value={form.bildtitel} onChange={e => setForm({...form, bildtitel: e.target.value})} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Technik *</label>
              <input required value={form.bildtechnik} onChange={e => setForm({...form, bildtechnik: e.target.value})} placeholder="z.B. Acryl auf Leinwand" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Genre *</label>
              <select required value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className={inp}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Breite (cm)</label>
              <input type="number" value={form.breite_rahmen_cm} onChange={e => setForm({...form, breite_rahmen_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Höhe (cm)</label>
              <input type="number" value={form.hoehe_rahmen_cm} onChange={e => setForm({...form, hoehe_rahmen_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Einlief.-Preis (€)</label>
              <input type="number" value={form.einlieferungspreis} onChange={e => setForm({...form, einlieferungspreis: e.target.value})} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Abrechnung über</label>
              <select value={form.abrechnungsempf} onChange={e => setForm({...form, abrechnungsempf: e.target.value, galerist_id: ""})} className={inp}>
                <option value="Künstler">Künstler</option>
                <option value="Galerist">Galerist / Sammler</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.in_ausstellung}
                  onChange={e => setForm({...form, in_ausstellung: e.target.checked})}
                  className="rounded" />
                In der Ausstellung
              </label>
            </div>
          </div>
          {form.abrechnungsempf === "Galerist" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Galerist / Sammler auswählen</label>
              <select required value={form.galerist_id} onChange={e => setForm({...form, galerist_id: e.target.value})} className={inp}>
                <option value="">— bitte wählen —</option>
                {kuenstler.filter(k => k.ist_galerist).sort((a, b) => a.db_name.localeCompare(b.db_name)).map(k => (
                  <option key={k.id} value={k.id}>{k.db_name}, {k.db_vorname}</option>
                ))}
              </select>
            </div>
          )}
          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
          <button type="submit" disabled={laden}
            className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 mt-2">
            {laden ? "Wird angelegt…" : "Bild anlegen"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditModal({ bild, onClose, onSaved, onDeleted }: { bild: Bild; onClose: () => void; onSaved: (b: Bild) => void; onDeleted: (id: number) => void }) {
  const [form, setForm] = useState({
    bildtitel: bild.bildtitel,
    bildtechnik: bild.bildtechnik,
    genre: bild.genre,
    breite_rahmen_cm: String(bild.breite_rahmen_cm ?? ""),
    hoehe_rahmen_cm: String(bild.hoehe_rahmen_cm ?? ""),
    breite_cm: String(bild.breite_cm ?? ""),
    hoehe_cm: String(bild.hoehe_cm ?? ""),
    tiefe_cm: String(bild.tiefe_cm ?? ""),
    gewicht_kg: String(bild.gewicht_kg ?? ""),
    einlieferungspreis: String(bild.einlieferungspreis ?? ""),
    verkaufspreis: String(bild.verkaufspreis ?? ""),
    anmerkung_bild: bild.anmerkung_bild ?? "",
    foto_nr: (bild as any).foto_nr ?? "",
    in_ausstellung: bild.in_ausstellung !== false,
    freigegeben: bild.freigegeben ?? false,
    abrechnungsempf: bild.abrechnungsempf ?? "Künstler",
    galerist_id: String(bild.galerist_id ?? ""),
  });
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => { getAlleKuenstler().then(setKuenstler).catch(() => {}); }, []);

  const [loeschenBestaetigt, setLoeschenBestaetigt] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(bild.bild_url_web ?? "");
  const [fotoLaedt, setFotoLaedt] = useState(false);
  const [aiLaedt, setAiLaedt] = useState(false);
  const [zusatzFotos, setZusatzFotos] = useState<BildFoto[]>([]);
  const [zusatzLaedt, setZusatzLaedt] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const zusatzInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    getZusatzFotos(bild.id).then(setZusatzFotos).catch(() => {});
  }, [bild.id]);
  const inp = "w-full border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-1 focus:ring-lions-blue";

  async function handleFotoWechsel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoLaedt(true);
    try {
      const { bild_url_web } = await fotoHochladen(bild.id, file);
      setFotoUrl(bild_url_web);
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setFotoLaedt(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const updated = await bildAktualisieren(bild.id, {
        bildtitel: form.bildtitel,
        bildtechnik: form.bildtechnik,
        genre: form.genre,
        breite_rahmen_cm: Number(form.breite_rahmen_cm) || 0,
        hoehe_rahmen_cm: Number(form.hoehe_rahmen_cm) || 0,
        ...(form.breite_cm ? { breite_cm: Number(form.breite_cm) } : {}),
        ...(form.hoehe_cm ? { hoehe_cm: Number(form.hoehe_cm) } : {}),
        ...(form.tiefe_cm ? { tiefe_cm: Number(form.tiefe_cm) } : {}),
        ...(form.gewicht_kg ? { gewicht_kg: Number(form.gewicht_kg) } : {}),
        ...(form.einlieferungspreis ? { einlieferungspreis: Number(form.einlieferungspreis) } : {}),
        ...(form.verkaufspreis ? { verkaufspreis: Number(form.verkaufspreis) } : {}),
        anmerkung_bild: form.anmerkung_bild || undefined,
        foto_nr: form.foto_nr || undefined,
        in_ausstellung: form.in_ausstellung,
        freigegeben: form.freigegeben,
        abrechnungsempf: form.abrechnungsempf,
        galerist_id: form.abrechnungsempf === "Galerist" && form.galerist_id ? Number(form.galerist_id) : null,
      });
      onSaved(updated);
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Bild bearbeiten</h2>
            <p className="text-xs text-gray-400 font-mono">{formatBildNr(bild.bild_nr)}</p>
            {bild.kuenstler && (
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {bild.kuenstler.db_name}, {bild.kuenstler.db_vorname}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {loeschenBestaetigt ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Wirklich löschen?</span>
                <button type="button" onClick={async () => { await bildLoeschen(bild.id); onDeleted(bild.id); }}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Ja</button>
                <button type="button" onClick={() => setLoeschenBestaetigt(false)}
                  className="px-2 py-1 text-xs text-gray-600 border rounded hover:bg-gray-100">Nein</button>
              </div>
            ) : (
              <button type="button" onClick={() => setLoeschenBestaetigt(true)}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors">
                Bild löschen
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Fotos — max. 3 gesamt */}
        <div className="mb-4">
          <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoWechsel} />
          <input ref={zusatzInputRef} type="file" accept="image/*" className="hidden" onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            setZusatzLaedt(true);
            try {
              const foto = await zusatzFotoHochladen(bild.id, file);
              setZusatzFotos(prev => [...prev, foto]);
            } catch (err: any) { setFehler(err.message); }
            finally { setZusatzLaedt(false); e.target.value = ""; }
          }} />

          {/* Lightbox */}
          {lightboxUrl && (
            <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxUrl(null)}>
              <img src={`http://localhost:8000${lightboxUrl}`} alt=""
                className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl" />
              <button onClick={() => setLightboxUrl(null)}
                className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300">×</button>
            </div>
          )}

          <div className="flex gap-2 flex-wrap items-start">
            {/* Hauptfoto */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {fotoUrl ? (
                  <img src={`http://localhost:8000${fotoUrl}`} alt={bild.bildtitel}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setLightboxUrl(fotoUrl)} />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">Kein Foto</span>
                )}
                {fotoLaedt && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><span className="text-xs animate-pulse">Lädt…</span></div>}
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">1</span>
              </div>
              <button type="button" onClick={() => fotoInputRef.current?.click()}
                className="text-xs text-lions-blue hover:underline">
                {fotoUrl ? "Ersetzen" : "+ Hochladen"}
              </button>
            </div>

            {/* Zusatzfotos */}
            {zusatzFotos.map((f, i) => (
              <div key={f.id} className="flex flex-col items-center gap-1">
                <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200">
                  <img src={`http://localhost:8000${f.url}`} alt=""
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setLightboxUrl(f.url)} />
                  <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">{i + 2}</span>
                </div>
                <button type="button"
                  onClick={async () => {
                    await zusatzFotoLoeschen(bild.id, f.id).catch(() => {});
                    setZusatzFotos(prev => prev.filter(x => x.id !== f.id));
                  }}
                  className="text-xs text-red-500 hover:underline">
                  Löschen
                </button>
              </div>
            ))}

            {/* + Slot */}
            {fotoUrl && zusatzFotos.length < 2 && (
              <div className="flex flex-col items-center gap-1">
                <button type="button" onClick={() => zusatzInputRef.current?.click()}
                  className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-lions-blue hover:text-lions-blue transition-colors text-xs">
                  {zusatzLaedt ? "Lädt…" : `+ Foto ${zusatzFotos.length + 2}`}
                </button>
                <span className="text-xs text-transparent select-none">—</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Maximal 3 Fotos · Klick auf Foto zum Vergrößern</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Titel *</label>
              <input required value={form.bildtitel} onChange={e => setForm({...form, bildtitel: e.target.value})} className={inp} />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Anmerkung</label>
                <button
                  type="button"
                  disabled={aiLaedt}
                  onClick={async () => {
                    setAiLaedt(true);
                    try {
                      const { beschreibung } = await aiBeschreibungGenerieren(bild.id);
                      setForm(f => ({ ...f, anmerkung_bild: beschreibung }));
                    } catch (err: any) {
                      setFehler("KI-Fehler: " + err.message);
                    } finally {
                      setAiLaedt(false);
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {aiLaedt ? (
                    <><span className="animate-spin inline-block">✦</span> Generiere…</>
                  ) : (
                    <>✦ KI-Beschreibung</>
                  )}
                </button>
              </div>
              <textarea rows={3} value={form.anmerkung_bild} onChange={e => setForm({...form, anmerkung_bild: e.target.value})} className={inp} placeholder="Beschreibung für die Webseite…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Technik *</label>
              <input required value={form.bildtechnik} onChange={e => setForm({...form, bildtechnik: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Genre *</label>
              <select required value={form.genre} onChange={e => setForm({...form, genre: e.target.value as any})} className={inp}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Maße mit Rahmen (cm)</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Breite" value={form.breite_rahmen_cm} onChange={e => setForm({...form, breite_rahmen_cm: e.target.value})} className={inp} />
              <input type="number" placeholder="Höhe" value={form.hoehe_rahmen_cm} onChange={e => setForm({...form, hoehe_rahmen_cm: e.target.value})} className={inp} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Maße ohne Rahmen (cm)</p>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="Breite" value={form.breite_cm} onChange={e => setForm({...form, breite_cm: e.target.value})} className={inp} />
              <input type="number" placeholder="Höhe" value={form.hoehe_cm} onChange={e => setForm({...form, hoehe_cm: e.target.value})} className={inp} />
              <input type="number" placeholder="Tiefe" value={form.tiefe_cm} onChange={e => setForm({...form, tiefe_cm: e.target.value})} className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gewicht (kg)</label>
              <input type="number" step="0.1" value={form.gewicht_kg} onChange={e => setForm({...form, gewicht_kg: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Einlief.-Preis (€)</label>
              <input type="number" value={form.einlieferungspreis} onChange={e => setForm({...form, einlieferungspreis: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Verkaufspreis (€)</label>
              <input type="number" value={form.verkaufspreis} onChange={e => setForm({...form, verkaufspreis: e.target.value})} className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Foto-Nr.</label>
              <input value={form.foto_nr} onChange={e => setForm({...form, foto_nr: e.target.value})} className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Abrechnung über</label>
              <select value={form.abrechnungsempf} onChange={e => setForm({...form, abrechnungsempf: e.target.value as any, galerist_id: ""})} className={inp}>
                <option value="Künstler">Künstler</option>
                <option value="Galerist">Galerist / Sammler</option>
              </select>
              {form.abrechnungsempf === "Galerist" && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Galerist / Sammler auswählen</label>
                  <select required value={form.galerist_id} onChange={e => setForm({...form, galerist_id: e.target.value})} className={inp}>
                    <option value="">— bitte wählen —</option>
                    {kuenstler.filter(k => k.ist_galerist).sort((a, b) => a.db_name.localeCompare(b.db_name)).map(k => (
                      <option key={k.id} value={k.id}>{k.db_name}, {k.db_vorname}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.in_ausstellung} onChange={e => setForm({...form, in_ausstellung: e.target.checked})} className="rounded" />
                In der Ausstellung
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.freigegeben} onChange={e => setForm({...form, freigegeben: e.target.checked})} className="rounded" />
                Freigegeben
              </label>
            </div>
          </div>

          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}

          <div className="flex items-center justify-end gap-3 pt-3 border-t sticky bottom-0 bg-white pb-1">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-100">Abbrechen</button>
              <button type="submit" disabled={laden} className="px-4 py-2 text-sm bg-lions-blue text-white rounded-md hover:bg-blue-900 disabled:opacity-50">
                {laden ? "Wird gespeichert…" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBilderPage() {
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [preise, setPreise] = useState<Record<number, string>>({});
  const [auswahl, setAuswahl] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<Filter>("offen");
  const [sortKey, setSortKey] = useState<SortKey>("kuenstler");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [kuenstlerFilter, setKuenstlerFilter] = useState<number | null>(null);
  const [kuenstlerImGaleristFilter, setKuenstlerImGaleristFilter] = useState<number | null>(null);
  const [laden, setLaden] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNeu, setShowNeu] = useState(false);
  const [editBild, setEditBild] = useState<Bild | null>(null);

  useEffect(() => {
    getAlleBilder().then(setBilder).finally(() => setLaden(false));
  }, []);

  const gefiltertOhneKuenstler = useMemo(() => {
    switch (filter) {
      case "offen":      return bilder.filter(b => !b.freigegeben);
      case "mit_foto":   return bilder.filter(b => !!b.bild_url_web);
      case "ohne_foto":  return bilder.filter(b => !b.bild_url_web);
      case "online":     return bilder.filter(b => b.in_ausstellung === false);
      case "verfuegbar": return bilder.filter(b => b.verfuegbarkeit === "Verfügbar");
      case "reserviert": return bilder.filter(b => b.verfuegbarkeit === "Reserviert");
      case "verkauft":   return bilder.filter(b => b.verfuegbarkeit === "Verkauft");
      default:          return bilder;
    }
  }, [bilder, filter]);

  const kuenstlerListe = useMemo(() => {
    const seen = new Map<number, { label: string; isGalerist: boolean }>();
    for (const b of gefiltertOhneKuenstler) {
      if (b.kuenstler && !seen.has(b.kuenstler_id)) {
        seen.set(b.kuenstler_id, { label: `${b.kuenstler.db_name}, ${b.kuenstler.db_vorname}`, isGalerist: false });
      }
      if (b.galerist && b.galerist_id && !seen.has(-b.galerist_id)) {
        seen.set(-b.galerist_id, { label: `${b.galerist.db_name}, ${b.galerist.db_vorname} (Galerist)`, isGalerist: true });
      }
    }
    return [...seen.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label));
  }, [gefiltertOhneKuenstler]);

  const sichtbar = useMemo(() => {
    const gefiltert = gefiltertOhneKuenstler.filter(b => {
      if (kuenstlerFilter === null) return true;
      if (kuenstlerFilter < 0) return b.galerist_id === -kuenstlerFilter;
      return b.kuenstler_id === kuenstlerFilter;
    }).filter(b => kuenstlerImGaleristFilter === null || b.kuenstler_id === kuenstlerImGaleristFilter);
    return [...gefiltert].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortKey) {
        case "kuenstler":
          va = `${a.kuenstler?.db_name ?? ""} ${a.kuenstler?.db_vorname ?? ""}`.toLowerCase();
          vb = `${b.kuenstler?.db_name ?? ""} ${b.kuenstler?.db_vorname ?? ""}`.toLowerCase();
          break;
        case "titel":
          va = a.bildtitel.toLowerCase(); vb = b.bildtitel.toLowerCase(); break;
        case "bild_nr":
          va = a.bild_nr; vb = b.bild_nr; break;
        case "genre":
          va = a.genre; vb = b.genre; break;
        case "einlieferungspreis":
          va = a.einlieferungspreis ?? 0; vb = b.einlieferungspreis ?? 0; break;
        case "verkaufspreis":
          va = a.verkaufspreis ?? 0; vb = b.verkaufspreis ?? 0; break;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [gefiltertOhneKuenstler, sortKey, sortDir, kuenstlerFilter, kuenstlerImGaleristFilter]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-lions-blue ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const alleAusgewaehlt = sichtbar.length > 0 && sichtbar.every(b => auswahl.has(b.id));

  function toggleAlle() {
    setAuswahl(alleAusgewaehlt ? new Set() : new Set(sichtbar.map(b => b.id)));
  }

  function toggleBild(id: number) {
    const next = new Set(auswahl);
    next.has(id) ? next.delete(id) : next.add(id);
    setAuswahl(next);
  }

  const alleAuswahlFreigegeben = auswahl.size > 0 &&
    [...auswahl].every(id => bilder.find(b => b.id === id)?.freigegeben);

  async function handleMassenfreigabe() {
    if (!auswahl.size || saving) return;
    setSaving(true);
    const neuerWert = !alleAuswahlFreigegeben;
    try {
      await massenFreigeben(Array.from(auswahl), neuerWert);
      const ids = new Set(auswahl);
      setBilder(prev => prev.map(b => ids.has(b.id) ? { ...b, freigegeben: neuerWert } : b));
      setAuswahl(new Set());
    } finally {
      setSaving(false);
    }
  }

  async function handleFreigeben(id: number) {
    await bilderFreigeben(id);
    setBilder(prev => prev.map(b => b.id === id ? { ...b, freigegeben: true } : b));
  }

  async function handleFreigabeToggle(id: number, aktuell: boolean) {
    await bildAktualisieren(id, { freigegeben: !aktuell });
    setBilder(prev => prev.map(b => b.id === id ? { ...b, freigegeben: !aktuell } : b));
  }


  async function handlePreis(id: number) {
    const preis = parseFloat(preise[id] ?? "");
    if (!preis) return;
    await preisSetzen(id, preis);
    setBilder(prev => prev.map(b => b.id === id ? { ...b, verkaufspreis: preis } : b));
  }

  async function handleAusstellungToggle(id: number, inAusstellung: boolean) {
    await ausstellungToggle(id, inAusstellung);
    setBilder(prev => prev.map(b => b.id === id ? { ...b, in_ausstellung: inAusstellung } : b));
  }

  function handleEditSaved(updated: Bild) {
    setBilder(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
    setEditBild(null);
  }

  function handleDeleted(id: number) {
    setBilder(prev => prev.filter(b => b.id !== id));
    setEditBild(null);
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  const freigegebenCount = bilder.filter(b => b.freigegeben).length;
  const mitFotoCount = bilder.filter(b => !!b.bild_url_web).length;

  function handleCreated(b: Bild) {
    setBilder(prev => [b, ...prev]);
    setShowNeu(false);
    setFilter("offen");
  }

  const filterTabs: { key: Filter; label: string; count: number; color?: string }[] = [
    { key: "alle",       label: "Alle",              count: bilder.length },
    { key: "offen",      label: "Nicht freigegeben", count: bilder.filter(b => !b.freigegeben).length },
    { key: "mit_foto",   label: "Mit Foto",          count: mitFotoCount },
    { key: "ohne_foto",  label: "Ohne Foto",         count: bilder.filter(b => !b.bild_url_web).length },
    { key: "online",     label: "Nur Online",        count: bilder.filter(b => b.in_ausstellung === false).length },
    { key: "verfuegbar", label: "Verfügbar",         count: bilder.filter(b => b.verfuegbarkeit === "Verfügbar").length, color: "green" },
    { key: "reserviert", label: "Reserviert",        count: bilder.filter(b => b.verfuegbarkeit === "Reserviert").length, color: "yellow" },
    { key: "verkauft",   label: "Verkauft",          count: bilder.filter(b => b.verfuegbarkeit === "Verkauft").length, color: "red" },
  ];

  return (
    <div className="space-y-4">
      {showNeu && <NeuModal onClose={() => setShowNeu(false)} onCreated={handleCreated} />}
      {editBild && <EditModal bild={editBild} onClose={() => setEditBild(null)} onSaved={handleEditSaved} onDeleted={handleDeleted} />}
      {/* Kopfzeile */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-lions-blue">Bildverwaltung</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            {freigegebenCount}/{bilder.length} freigegeben · {mitFotoCount} mit Foto
          </p>
          <button onClick={() => setShowNeu(true)}
            className="px-4 py-1.5 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 transition-colors">
            + Neues Bild
          </button>
        </div>
      </div>

      {/* Filter-Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map(t => {
          const aktiv = filter === t.key;
          const aktivClass =
            t.color === "green"  ? "bg-green-600 text-white" :
            t.color === "yellow" ? "bg-yellow-500 text-white" :
            t.color === "red"    ? "bg-red-600 text-white" :
            "bg-lions-blue text-white";
          const inaktivClass =
            t.color === "green"  ? "bg-white text-green-700 border border-green-200 hover:border-green-500" :
            t.color === "yellow" ? "bg-white text-yellow-700 border border-yellow-200 hover:border-yellow-500" :
            t.color === "red"    ? "bg-white text-red-700 border border-red-200 hover:border-red-500" :
            "bg-white text-gray-600 border border-gray-200 hover:border-lions-blue";
          return (
            <button key={t.key}
              onClick={() => { setFilter(t.key); setAuswahl(new Set()); setKuenstlerFilter(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${aktiv ? aktivClass : inaktivClass}`}>
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {/* Aktionsleiste */}
      <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm border gap-4">
        <div className="flex items-center gap-3">
          <input type="checkbox"
            checked={alleAusgewaehlt}
            onChange={toggleAlle}
            className="rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600">
            {auswahl.size > 0 ? `${auswahl.size} ausgewählt` : `${sichtbar.length} Einträge`}
          </span>
          {auswahl.size > 0 && (
            <button onClick={() => setAuswahl(new Set())}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Auswahl aufheben
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Künstler:</label>
          <select
            value={kuenstlerFilter ?? ""}
            onChange={e => { setKuenstlerFilter(e.target.value ? Number(e.target.value) : null); setKuenstlerImGaleristFilter(null); }}
            className="border rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-lions-blue min-w-[200px]"
          >
            <option value="">— Alle Künstler —</option>
            {kuenstlerListe.map(([id, { label }]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          {kuenstlerFilter !== null && (
            <button onClick={() => { setKuenstlerFilter(null); setKuenstlerImGaleristFilter(null); }}
              className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        {kuenstlerFilter !== null && kuenstlerFilter < 0 && (() => {
          const galeristBilder = gefiltertOhneKuenstler.filter(b => b.galerist_id === -kuenstlerFilter);
          const künstlerImGalerist = [...new Map(galeristBilder.filter(b => b.kuenstler).map(b => [b.kuenstler_id, `${b.kuenstler!.db_name}, ${b.kuenstler!.db_vorname}`])).entries()].sort((a,b) => a[1].localeCompare(b[1]));
          return (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">Künstler im Galerist:</label>
              <select
                value={kuenstlerImGaleristFilter ?? ""}
                onChange={e => setKuenstlerImGaleristFilter(e.target.value ? Number(e.target.value) : null)}
                className="border rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-lions-blue min-w-[180px]"
              >
                <option value="">— Alle —</option>
                {künstlerImGalerist.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              {kuenstlerImGaleristFilter !== null && (
                <button onClick={() => setKuenstlerImGaleristFilter(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
          );
        })()}
        <button
          onClick={handleMassenfreigabe}
          disabled={auswahl.size === 0 || saving}
          className={`px-4 py-1.5 text-white text-sm font-medium rounded-md transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            ${alleAuswahlFreigegeben ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}>
          {saving
            ? "Wird gespeichert…"
            : auswahl.size === 0
            ? "— freigeben"
            : alleAuswahlFreigegeben
            ? `${auswahl.size} Freigabe zurückziehen`
            : `${auswahl.size} freigeben`}
        </button>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-2 py-2 w-8"></th>
              <th className="px-2 py-2 text-left whitespace-nowrap cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("bild_nr")}>
                Nr.<SortIcon col="bild_nr" />
              </th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("kuenstler")}>
                Künstler<SortIcon col="kuenstler" />
              </th>
              <th className="px-2 py-2 text-center">Foto</th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-gray-700" style={{minWidth:"200px"}} onClick={() => handleSort("titel")}>
                Titel<SortIcon col="titel" />
              </th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-gray-700" style={{width:"120px",maxWidth:"120px"}} onClick={() => handleSort("genre")}>
                Technik · Genre<SortIcon col="genre" />
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                <div>Maße (cm)</div>
                <div className="font-normal normal-case text-gray-400">B × H × (T)</div>
              </th>
              <th className="px-2 py-2 text-center whitespace-nowrap">Status · Ausst.</th>
              <th className="px-2 py-2 text-right cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("einlieferungspreis")}>
                <div>Einlief.<SortIcon col="einlieferungspreis" /></div>
                <div>Vorschlag</div>
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("verkaufspreis")}>
                <div>Verkauf<SortIcon col="verkaufspreis" /></div>
                <div className="font-normal normal-case text-gray-400">Euro</div>
              </th>
              <th className="px-2 py-2 text-center">Freigabe</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sichtbar.map(b => (
              <tr key={b.id}
                onClick={() => setEditBild(b)}
                className={`cursor-pointer transition-colors ${
                  auswahl.has(b.id)
                    ? "bg-blue-50 hover:bg-blue-100"
                    : b.freigegeben
                    ? "hover:bg-gray-100"
                    : "bg-yellow-50 hover:bg-yellow-100"
                }`}>
                <td className="px-2 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  <input type="checkbox"
                    checked={auswahl.has(b.id)}
                    onChange={() => toggleBild(b.id)}
                    className="rounded cursor-pointer"
                  />
                </td>
                <td className="px-2 py-1.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                  {formatBildNr(b.bild_nr)}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {b.kuenstler && (
                    <div className="text-sm font-medium text-gray-700">
                      {b.kuenstler.db_name},
                    </div>
                  )}
                  {b.kuenstler && (
                    <div className="text-xs text-gray-500">
                      {b.kuenstler.db_vorname}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {b.bild_url_web ? (
                    <img
                      src={`http://localhost:8000${b.bild_url_web}`}
                      alt={b.bildtitel}
                      className="w-9 h-9 object-cover rounded mx-auto"
                    />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-2 py-1.5" style={{minWidth:"200px"}}>
                  <div className="font-medium leading-tight">{b.bildtitel}</div>
                  {b.anmerkung_bild && (
                    <div className="text-xs text-amber-600 mt-0.5 leading-snug line-clamp-2">{b.anmerkung_bild}</div>
                  )}
                </td>
                <td className="px-2 py-1.5" style={{width:"120px",maxWidth:"120px"}}>
                  <div className="text-xs text-gray-600 truncate">{b.bildtechnik || "—"}</div>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-0.5 inline-block">
                    {b.genre}
                  </span>
                  {b.abrechnungsempf && b.abrechnungsempf !== "Künstler" && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
                      b.abrechnungsempf === "Galerist" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {b.abrechnungsempf}
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right text-xs text-gray-600 whitespace-nowrap">
                  <div>
                    {b.breite_rahmen_cm && b.hoehe_rahmen_cm
                      ? `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm}`
                      : "—"}
                  </div>
                  {(b.breite_cm || b.hoehe_cm || b.tiefe_cm) && (
                    <div className="text-gray-400">
                      {[b.breite_cm, b.hoehe_cm, b.tiefe_cm]
                        .filter(v => v != null)
                        .join(" × ")}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.verfuegbarkeit === "Verfügbar"  ? "bg-green-100 text-green-700" :
                    b.verfuegbarkeit === "Reserviert" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{b.verfuegbarkeit}</span>
                  <div className="mt-1">
                    <button
                      onClick={() => handleAusstellungToggle(b.id, !(b.in_ausstellung !== false))}
                      title={b.in_ausstellung !== false ? "In Ausstellung — klicken für Online-only" : "Nur Online — klicken für Ausstellung"}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        b.in_ausstellung !== false
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}>
                      {b.in_ausstellung !== false ? "Ausst." : "Online"}
                    </button>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right text-gray-500 whitespace-nowrap">
                  <div>{b.einlieferungspreis ? `${b.einlieferungspreis} €` : "—"}</div>
                  <div className="text-gray-400">{b.verkaufspreis_vorschlag ? `${b.verkaufspreis_vorschlag} €` : "—"}</div>
                </td>
                <td className="px-2 py-1.5 text-right" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    value={preise[b.id] ?? b.verkaufspreis ?? ""}
                    onChange={e => setPreise({ ...preise, [b.id]: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handlePreis(b.id)}
                    className="w-16 border rounded px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-lions-blue"
                    placeholder="€"
                    title="Enter zum Speichern"
                  />
                </td>
                <td className="px-2 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); handleFreigabeToggle(b.id, !!b.freigegeben); }}
                    title={b.freigegeben ? "Freigabe zurückziehen" : "Freigeben"}
                    className={`text-xs px-2 py-1 rounded transition-colors whitespace-nowrap ${
                      b.freigegeben
                        ? "text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700"
                        : "bg-lions-blue text-white hover:bg-blue-900"
                    }`}>
                    {b.freigegeben ? "✓ Freigegeben" : "Freigeben"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sichtbar.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            Keine Einträge für diesen Filter.
          </p>
        )}
      </div>
    </div>
  );
}

```

### app/admin/datenschutz/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDatenschutzPage() {
  const [text, setText] = useState("");
  const [laden, setLaden] = useState(true);
  const [speichern, setSpeichern] = useState(false);
  const [gespeichert, setGespeichert] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    fetch(`${API}/einstellungen/datenschutz`)
      .then(r => r.json())
      .then(d => { setText(d.text); setLaden(false); })
      .catch(() => setLaden(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSpeichern(true); setFehler(""); setGespeichert(false);
    try {
      const r = await fetch(`${API}/admin/einstellungen/datenschutz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error(await r.text());
      setGespeichert(true);
      setTimeout(() => setGespeichert(false), 3000);
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setSpeichern(false);
    }
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-lions-blue">Datenschutzerklärung</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Öffentlich sichtbar unter{" "}
            <a href="/datenschutz" target="_blank" className="text-lions-blue hover:underline">
              /datenschutz
            </a>
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
        Bitte ersetzen Sie alle Stellen in <strong>[eckigen Klammern]</strong> mit den tatsächlichen Angaben des Vereins.
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-white rounded-xl shadow-sm p-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={36}
            className="w-full px-4 py-3 text-sm font-mono text-gray-700 leading-relaxed resize-none focus:outline-none rounded-xl"
            placeholder="Datenschutzerklärung eingeben…"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={speichern}
            className="px-5 py-2 bg-lions-blue text-white text-sm font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {speichern ? "Wird gespeichert…" : "Speichern"}
          </button>
          {gespeichert && <span className="text-green-600 text-sm">✓ Gespeichert</span>}
          {fehler && <span className="text-red-600 text-sm">{fehler}</span>}
          <a
            href="/datenschutz"
            target="_blank"
            className="text-sm text-gray-500 hover:text-lions-blue ml-auto"
          >
            Vorschau öffnen →
          </a>
        </div>
      </form>
    </div>
  );
}

```

### app/admin/export/page.tsx

```tsx
"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ExportPage() {
  const [berater, setBerater] = useState("");
  const [mandant, setMandant] = useState("1");
  const [wjBeginn, setWjBeginn] = useState("20260101");
  const [nurBezahlt, setNurBezahlt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fehler, setFehler] = useState("");

  async function exportieren() {
    if (!berater.trim()) {
      setFehler("Bitte Beraternummer eingeben.");
      return;
    }
    setFehler("");
    setLoading(true);
    try {
      const params = new URLSearchParams({
        berater: berater.trim(),
        mandant: mandant.trim(),
        wj_beginn: wjBeginn.trim(),
        nur_bezahlt: String(nurBezahlt),
      });
      const resp = await fetch(`${API}/admin/export/datev?${params}`);
      if (!resp.ok) throw new Error(`Fehler: ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DATEV_Kunsttage_${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setFehler(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-lions-blue mb-1">DATEV-Export</h1>
      <p className="text-gray-500 mb-8">
        Buchungsstapel, Debitoren- und Kreditoren-Stammdaten als DATEV EXTF ZIP
      </p>

      <div className="bg-white rounded-lg shadow p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beraternummer <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={berater}
              onChange={e => setBerater(e.target.value)}
              placeholder="z. B. 12345"
              className="w-full border rounded-md px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Vom Steuerberater</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mandantennummer
            </label>
            <input
              type="number"
              value={mandant}
              onChange={e => setMandant(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wirtschaftsjahr-Beginn
          </label>
          <input
            type="text"
            value={wjBeginn}
            onChange={e => setWjBeginn(e.target.value)}
            placeholder="YYYYMMDD"
            className="w-full border rounded-md px-3 py-2 text-sm font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Format YYYYMMDD · z. B. 20260101</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="nurBezahlt"
            checked={nurBezahlt}
            onChange={e => setNurBezahlt(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <label htmlFor="nurBezahlt" className="text-sm text-gray-700">
            Nur bezahlte Käufe exportieren (empfohlen)
          </label>
        </div>

        {fehler && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {fehler}
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
          <p className="font-medium text-blue-800 mb-2">ZIP-Inhalt:</p>
          <ul className="space-y-1 text-blue-700 text-xs font-mono">
            <li>EXTF_Buchungsstapel_2026.csv</li>
            <li>EXTF_Debitoren_2026.csv</li>
            <li>EXTF_Kreditoren_2026.csv</li>
            <li>Artikel_Bilder_2026.csv</li>
          </ul>
        </div>

        <button
          onClick={exportieren}
          disabled={loading}
          className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
        >
          {loading ? "Exportiere…" : "DATEV-Export herunterladen"}
        </button>
      </div>

      <div className="mt-6 bg-gray-50 border rounded-md p-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">Verwendete Konten (SKR03):</p>
        <div className="grid grid-cols-2 gap-x-4 mt-1">
          <span>1000 · Kasse (Bar)</span>
          <span>8400 · Erlöse</span>
          <span>1200 · Bank (Überweisung)</span>
          <span>10001+ · Debitoren (Käufer)</span>
          <span>1361 · Kreditkarte</span>
          <span>70001+ · Kreditoren (Künstler)</span>
          <span>1362 · PayPal</span>
        </div>
        <p className="mt-2">Kontenplan bitte mit Steuerberater abstimmen.</p>
      </div>
    </div>
  );
}

```

### app/admin/import/page.tsx

```tsx
"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ergebnis, setErgebnis] = useState<{ importiert: number; fehler: any[] } | null>(null);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLaden(true);
    setFehler("");
    setErgebnis(null);
    const fd = new FormData();
    fd.append("file", file);
    const endpoint = file.name.endsWith(".csv") ? "csv" : "excel";
    try {
      const res = await fetch(`${API}/admin/import/${endpoint}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setErgebnis(await res.json());
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-lions-blue mb-6">CSV / Excel Import</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-5">
        <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-600 space-y-3">
          <div>
            <p className="font-medium mb-1">Pflichtfelder:</p>
            <code className="text-xs block leading-relaxed text-gray-700">
              bild_nr, kuenstler_name, kuenstler_vorname, bildtitel,<br />
              bildtechnik, genre, hoehe_rahmen_cm, breite_rahmen_cm
            </code>
          </div>
          <div>
            <p className="font-medium mb-1">Optional — Maße &amp; Gewicht:</p>
            <code className="text-xs block leading-relaxed text-gray-700">
              hoehe_cm, breite_cm, tiefe_cm, gewicht_kg
            </code>
          </div>
          <div>
            <p className="font-medium mb-1">Optional — Sonstiges:</p>
            <code className="text-xs block leading-relaxed text-gray-700">
              anmerkung_bild, einlieferungspreis, verkaufspreis,<br />
              abrechnungsempf, bild_dateiname, galerist_name, galerist_vorname
            </code>
          </div>
          <p className="text-xs text-gray-400">Bei abrechnungsempf=Galerist werden galerist_name + galerist_vorname zur Zuordnung verwendet. Archiv-CSVs (mit Käufer-Spalten) können direkt reimportiert werden — die Käufer-Spalten werden ignoriert.</p>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">CSV- oder Excel-Datei</label>
            <input type="file" accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600" required />
          </div>
          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
          <button type="submit" disabled={laden || !file}
            className="w-full bg-lions-blue text-white py-2 rounded-md font-medium hover:bg-blue-900 transition-colors disabled:opacity-50">
            {laden ? "Importiere…" : "Import starten"}
          </button>
        </form>

        {ergebnis && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-green-700 font-medium">{ergebnis.importiert} Datensätze erfolgreich importiert</p>
            {ergebnis.fehler.length > 0 && (
              <div>
                <p className="text-red-600 text-sm font-medium mb-1">{ergebnis.fehler.length} Fehler:</p>
                <ul className="text-xs text-red-500 space-y-1 max-h-40 overflow-y-auto">
                  {ergebnis.fehler.map((f, i) => (
                    <li key={i}>Zeile {f.zeile}: {f.fehler}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

```

### app/admin/impressum/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminImpressumPage() {
  const [text, setText] = useState("");
  const [laden, setLaden] = useState(true);
  const [speichern, setSpeichern] = useState(false);
  const [gespeichert, setGespeichert] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    fetch(`${API}/einstellungen/impressum`)
      .then(r => r.json())
      .then(d => { setText(d.text); setLaden(false); })
      .catch(() => setLaden(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSpeichern(true); setFehler(""); setGespeichert(false);
    try {
      const r = await fetch(`${API}/admin/einstellungen/impressum`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error(await r.text());
      setGespeichert(true);
      setTimeout(() => setGespeichert(false), 3000);
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setSpeichern(false);
    }
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-lions-blue">Impressum</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Öffentlich sichtbar unter{" "}
            <a href="/impressum" target="_blank" className="text-lions-blue hover:underline">
              /impressum
            </a>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-white rounded-xl shadow-sm p-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={28}
            className="w-full px-4 py-3 text-sm font-mono text-gray-700 leading-relaxed resize-none focus:outline-none rounded-xl"
            placeholder="Impressum-Text eingeben…"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={speichern}
            className="px-5 py-2 bg-lions-blue text-white text-sm font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {speichern ? "Wird gespeichert…" : "Speichern"}
          </button>
          {gespeichert && <span className="text-green-600 text-sm">✓ Gespeichert</span>}
          {fehler && <span className="text-red-600 text-sm">{fehler}</span>}
          <a
            href="/impressum"
            target="_blank"
            className="text-sm text-gray-500 hover:text-lions-blue ml-auto"
          >
            Vorschau öffnen →
          </a>
        </div>
      </form>
    </div>
  );
}

```

### app/admin/kaeufer/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { getAlleKaeufer } from "@/lib/api";
import { KaeuferEintrag, KaeuferKauf } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

export default function KaeuferPage() {
  const [kaeufer, setKaeufer] = useState<KaeuferEintrag[]>([]);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState("");
  const [offen, setOffen] = useState<string | null>(null);

  useEffect(() => {
    getAlleKaeufer().then(setKaeufer).finally(() => setLaden(false));
  }, []);

  const gefiltert = kaeufer.filter(k => {
    const s = suche.toLowerCase();
    return !s ||
      k.name.toLowerCase().includes(s) ||
      k.vorname.toLowerCase().includes(s) ||
      k.email.toLowerCase().includes(s) ||
      k.ort.toLowerCase().includes(s);
  });

  const gesamtUmsatz = kaeufer.reduce((s, k) => s + k.gesamt, 0);

  if (laden) return <p className="p-8 text-gray-400">Laden…</p>;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b sticky top-0 z-10">
        <div className="flex-1">
          <h1 className="font-bold text-lions-blue">Käufer</h1>
          <p className="text-xs text-gray-400">
            {kaeufer.length} Käufer · {gesamtUmsatz.toLocaleString("de-DE")} € Gesamtumsatz
          </p>
        </div>
        <input
          type="search"
          placeholder="Name, E-Mail oder Ort…"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue w-64"
        />
      </div>

      <div className="p-6">
        {gefiltert.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            {kaeufer.length === 0 ? "Noch keine Käufer erfasst." : `Keine Treffer für „${suche}"`}
          </p>
        ) : (
          <div className="space-y-2">
            {gefiltert.map(k => {
              const key = k.email;
              const istOffen = offen === key;
              const name = [k.titel, k.vorname, k.name].filter(Boolean).join(" ");
              return (
                <div key={key} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Kopfzeile */}
                  <button
                    onClick={() => setOffen(istOffen ? null : key)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="font-semibold text-gray-800">{name}</span>
                        <span className="text-sm text-gray-400">{k.email}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {k.strasse} · {k.plz} {k.ort}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-lions-blue">
                        {k.gesamt.toLocaleString("de-DE")} €
                      </div>
                      <div className="text-xs text-gray-400">
                        {k.kaeufe.length} {k.kaeufe.length === 1 ? "Kauf" : "Käufe"}
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm ml-2">
                      {istOffen ? "▲" : "▼"}
                    </div>
                  </button>

                  {/* Detail */}
                  {istOffen && (
                    <div className="border-t bg-gray-50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase tracking-wide border-b">
                            <th className="px-5 py-2 text-left font-medium">Datum</th>
                            <th className="px-5 py-2 text-left font-medium">Bild</th>
                            <th className="px-5 py-2 text-left font-medium">Künstler</th>
                            <th className="px-5 py-2 text-left font-medium">Zahlung</th>
                            <th className="px-5 py-2 text-right font-medium">Preis</th>
                            <th className="px-5 py-2 text-left font-medium">Status</th>
                            <th className="px-5 py-2 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {k.kaeufe.map((kauf: KaeuferKauf) => (
                            <tr key={kauf.kauf_id} className="hover:bg-white">
                              <td className="px-5 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                                {new Date(kauf.datum).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                              </td>
                              <td className="px-5 py-3">
                                <div className="font-medium text-gray-800 leading-tight">{kauf.bildtitel ?? "—"}</div>
                                {kauf.bild_nr && (
                                  <div className="font-mono text-xs text-gray-400">{formatBildNr(kauf.bild_nr)}</div>
                                )}
                              </td>
                              <td className="px-5 py-3 text-gray-600 text-sm">{kauf.kuenstler ?? "—"}</td>
                              <td className="px-5 py-3 text-gray-500">{kauf.zahlungsart}</td>
                              <td className="px-5 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                                {kauf.verkaufspreis ? `${kauf.verkaufspreis.toLocaleString("de-DE")} €` : "—"}
                              </td>
                              <td className="px-5 py-3">
                                {kauf.bezahlt
                                  ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Bezahlt</span>
                                  : <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">Ausstehend</span>
                                }
                              </td>
                              <td className="px-5 py-3">
                                <button
                                  onClick={() => window.open(`/admin/kaufuebersicht/${kauf.kauf_id}/quittung`, "_blank")}
                                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                                >
                                  Quittung
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200">
                            <td colSpan={4} className="px-5 py-2 text-xs text-gray-400">Gesamt</td>
                            <td className="px-5 py-2 text-right font-bold text-lions-blue">
                              {k.gesamt.toLocaleString("de-DE")} €
                            </td>
                            <td colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

```

### app/admin/kasse/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getAlleBilder, kaufErfassen, alsBezahltMarkieren } from "@/lib/api";
import { Bild, KaufCreate } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

const leerForm = (): Omit<KaufCreate, "bild_id"> => ({
  kaeufer_titel: "",
  kaeufer_vorname: "",
  kaeufer_name: "",
  kaeufer_strasse: "",
  kaeufer_plz: "",
  kaeufer_ort: "",
  kaeufer_email: "",
  zahlungsart: "Bar",
});

// ── PayPal-Bestätigungsblock ──────────────────────────────────────────────────
function PayPalZahlung({
  betrag,
  beschreibung,
  onErfolg,
  onFehler,
}: {
  betrag: number;
  beschreibung: string;
  onErfolg: () => void;
  onFehler: (msg: string) => void;
}) {
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">PayPal nicht konfiguriert</p>
        <p>
          Bitte <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in{" "}
          <code className="bg-yellow-100 px-1 rounded">frontend/.env.local</code> eintragen.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "EUR",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
        createOrder={(_data, actions) =>
          actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: { value: betrag.toFixed(2), currency_code: "EUR" },
                description: beschreibung.slice(0, 127),
              },
            ],
          })
        }
        onApprove={async (_data, actions) => {
          await actions.order!.capture();
          onErfolg();
        }}
        onError={() => onFehler("PayPal-Zahlung fehlgeschlagen. Bitte erneut versuchen oder manuell bestätigen.")}
        onCancel={() => onFehler("Zahlung abgebrochen.")}
      />
    </PayPalScriptProvider>
  );
}

// ── Hauptseite ────────────────────────────────────────────────────────────────
export default function KassePage() {
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [suche, setSuche] = useState("");
  const [gewaehlt, setGewaehlt] = useState<Bild | null>(null);
  const [form, setForm] = useState(leerForm());
  const [kaufId, setKaufId] = useState<number | null>(null);
  const [fehler, setFehler] = useState("");
  const [paypalFehler, setPaypalFehler] = useState("");
  const [abgeschlossen, setAbgeschlossen] = useState(false);

  useEffect(() => {
    getAlleBilder().then(setBilder);
  }, []);

  const gefunden = bilder.filter(
    (b) =>
      b.verfuegbarkeit !== "Verkauft" &&
      (b.bild_nr.toLowerCase().includes(suche.toLowerCase()) ||
        b.bildtitel.toLowerCase().includes(suche.toLowerCase()))
  );

  async function handleKauf(e: React.FormEvent) {
    e.preventDefault();
    if (!gewaehlt) return;
    setFehler("");
    try {
      const res = await kaufErfassen({ ...form, bild_id: gewaehlt.id });
      setKaufId(res.id);
    } catch (err: any) {
      setFehler(err.message);
    }
  }

  async function handleBezahlt() {
    if (!kaufId) return;
    await alsBezahltMarkieren(kaufId);
    setAbgeschlossen(true);
    getAlleBilder().then(setBilder);
  }

  function reset() {
    setGewaehlt(null);
    setKaufId(null);
    setForm(leerForm());
    setFehler("");
    setPaypalFehler("");
    setAbgeschlossen(false);
  }

  // ── Abschlussmeldung ─────────────────────────────────────────────────────
  if (abgeschlossen) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-lions-blue mb-6">Vor-Ort-Kasse</h1>
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">✓</div>
          <p className="font-semibold text-green-800 text-lg">Zahlung abgeschlossen</p>
          <p className="text-sm text-green-700">
            {gewaehlt?.bildtitel} · {form.zahlungsart} · {gewaehlt?.verkaufspreis?.toFixed(2)} €
          </p>
          <p className="text-xs text-green-600">Bestätigungs-E-Mail wurde an {form.kaeufer_email} gesendet.</p>
          <button onClick={reset}
            className="mt-4 bg-lions-blue text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium">
            Nächsten Kauf erfassen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-lions-blue mb-6">Vor-Ort-Kasse</h1>

      {/* ── Schritt 1: Bild wählen ── */}
      {!gewaehlt ? (
        <div>
          <input
            placeholder="Bild-Nr. oder Titel suchen…"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            autoFocus
            className="w-full border rounded-md px-4 py-2 mb-4 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue"
          />
          <div className="space-y-2">
            {gefunden.slice(0, 20).map((b) => (
              <button key={b.id} onClick={() => setGewaehlt(b)}
                className="w-full text-left bg-white border rounded-md px-4 py-3 hover:border-lions-blue transition-colors flex justify-between items-center">
                <span>
                  <span className="font-mono text-xs text-gray-400 mr-2">{formatBildNr(b.bild_nr)}</span>
                  <span className="font-medium">{b.bildtitel}</span>
                  {b.kuenstler && (
                    <span className="text-xs text-gray-400 ml-2">
                      {b.kuenstler.db_vorname} {b.kuenstler.db_name}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  {b.verkaufspreis && (
                    <span className="text-sm font-semibold text-lions-blue">{b.verkaufspreis.toFixed(2)} €</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.verfuegbarkeit === "Verfügbar" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {b.verfuegbarkeit}
                  </span>
                </span>
              </button>
            ))}
            {gefunden.length === 0 && suche && (
              <p className="text-center text-gray-400 text-sm py-8">Keine verfügbaren Bilder gefunden.</p>
            )}
          </div>
        </div>

      /* ── Schritt 3: PayPal-Zahlung ── */
      ) : kaufId && form.zahlungsart === "PayPal" ? (
        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-lg">{gewaehlt.bildtitel}</p>
              <p className="text-sm text-gray-500">{formatBildNr(gewaehlt.bild_nr)} · {form.kaeufer_vorname} {form.kaeufer_name}</p>
            </div>
            <p className="text-2xl font-bold text-lions-blue">{gewaehlt.verkaufspreis?.toFixed(2)} €</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-3">
              Gerät dem Käufer zeigen oder QR-Code scannen lassen:
            </p>
            <PayPalZahlung
              betrag={gewaehlt.verkaufspreis ?? 0}
              beschreibung={`Kunstkauf: ${gewaehlt.bildtitel} (${formatBildNr(gewaehlt.bild_nr)})`}
              onErfolg={handleBezahlt}
              onFehler={setPaypalFehler}
            />
            {paypalFehler && (
              <p className="text-red-600 text-sm mt-2">{paypalFehler}</p>
            )}
          </div>

          <div className="border-t pt-3">
            <button onClick={handleBezahlt}
              className="text-sm text-gray-400 hover:text-gray-600 underline">
              Zahlung manuell als erhalten bestätigen
            </button>
          </div>
        </div>

      /* ── Schritt 3b: Bestätigung (Bar / Kreditkarte / Überweisung) ── */
      ) : kaufId ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
          <div>
            <p className="font-semibold text-green-800 text-lg">{gewaehlt.bildtitel}</p>
            <p className="text-sm text-gray-600">Zahlungsart: {form.zahlungsart}</p>
          </div>
          {form.zahlungsart !== "Überweisung" ? (
            <button onClick={handleBezahlt}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Zahlung bestätigen & abschließen
            </button>
          ) : (
            <div className="text-sm text-gray-600 space-y-2">
              <p>Bankverbindung wurde per E-Mail mitgeteilt. Nach Zahlungseingang:</p>
              <button onClick={handleBezahlt}
                className="bg-lions-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors">
                Als bezahlt markieren
              </button>
            </div>
          )}
        </div>

      /* ── Schritt 2: Käufer-Daten ── */
      ) : (
        <form onSubmit={handleKauf} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg">{gewaehlt.bildtitel}</h2>
              <p className="text-gray-500 text-sm">
                {formatBildNr(gewaehlt.bild_nr)}
                {gewaehlt.verkaufspreis && ` · ${gewaehlt.verkaufspreis.toFixed(2)} €`}
              </p>
            </div>
            <button type="button" onClick={() => setGewaehlt(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Titel" value={form.kaeufer_titel}
              onChange={(e) => setForm({ ...form, kaeufer_titel: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
            <input required placeholder="Vorname" value={form.kaeufer_vorname}
              onChange={(e) => setForm({ ...form, kaeufer_vorname: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
            <input required placeholder="Nachname" value={form.kaeufer_name}
              onChange={(e) => setForm({ ...form, kaeufer_name: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
          <input required placeholder="Straße und Hausnummer" value={form.kaeufer_strasse}
            onChange={(e) => setForm({ ...form, kaeufer_strasse: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          <div className="grid grid-cols-3 gap-3">
            <input required placeholder="PLZ" value={form.kaeufer_plz}
              onChange={(e) => setForm({ ...form, kaeufer_plz: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
            <input required placeholder="Ort" value={form.kaeufer_ort}
              onChange={(e) => setForm({ ...form, kaeufer_ort: e.target.value })}
              className="col-span-2 border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
          <input required type="email" placeholder="E-Mail" value={form.kaeufer_email}
            onChange={(e) => setForm({ ...form, kaeufer_email: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />

          <div>
            <label className="block text-sm text-gray-600 mb-2">Zahlungsart</label>
            <div className="flex gap-3">
              {(["Bar", "Kreditkarte", "PayPal", "Überweisung"] as const).map((z) => (
                <label key={z} className={`flex-1 border rounded-lg p-3 text-center cursor-pointer text-sm transition-colors ${
                  form.zahlungsart === z
                    ? "border-lions-blue bg-lions-blue/5 font-semibold text-lions-blue"
                    : "hover:border-gray-400"
                }`}>
                  <input type="radio" name="zahlungsart" value={z} checked={form.zahlungsart === z}
                    onChange={() => setForm({ ...form, zahlungsart: z })} className="hidden" />
                  {z === "PayPal" ? "🅿 PayPal" : z}
                </label>
              ))}
            </div>
            {form.zahlungsart === "PayPal" && (
              <p className="text-xs text-gray-400 mt-1.5">
                Nach dem Erfassen erscheint der PayPal-Button — Gerät dem Käufer zeigen.
              </p>
            )}
          </div>

          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
          <button type="submit"
            className="w-full bg-lions-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
            Kauf erfassen
          </button>
        </form>
      )}
    </div>
  );
}

```

### app/admin/kaufuebersicht/[id]/quittung/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getKauf } from "@/lib/api";
import { KaufDetail } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

export default function QuittungPage() {
  const { id } = useParams<{ id: string }>();
  const [kauf, setKauf] = useState<KaufDetail | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    getKauf(Number(id)).then(setKauf).finally(() => setLaden(false));
  }, [id]);

  useEffect(() => {
    if (!laden && kauf) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [laden, kauf]);

  if (laden) return <p style={{ padding: "2rem", fontFamily: "Georgia, serif" }}>Laden…</p>;
  if (!kauf) return <p style={{ padding: "2rem" }}>Kauf nicht gefunden.</p>;

  const kaeufer = [kauf.kaeufer_titel, kauf.kaeufer_vorname, kauf.kaeufer_name].filter(Boolean).join(" ");
  const datum = new Date(kauf.erstellt_am).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const abmessungen = (() => {
    const hatRahmen = kauf.breite_rahmen_cm && kauf.hoehe_rahmen_cm;
    const hatOhne = kauf.breite_cm && kauf.hoehe_cm;
    const unterschiedlich = hatRahmen && hatOhne &&
      (kauf.breite_rahmen_cm !== kauf.breite_cm || kauf.hoehe_rahmen_cm !== kauf.hoehe_cm);
    if (unterschiedlich)
      return `${kauf.breite_rahmen_cm} × ${kauf.hoehe_rahmen_cm} cm (mit Rahmen) · ${kauf.breite_cm} × ${kauf.hoehe_cm} cm ohne Rahmen`;
    if (hatRahmen) return `${kauf.breite_rahmen_cm} × ${kauf.hoehe_rahmen_cm} cm`;
    if (hatOhne) return `${kauf.breite_cm} × ${kauf.hoehe_cm} cm`;
    return null;
  })();

  return (
    <>
      <style>{`
        @media print {
          html, body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
        body { font-family: Georgia, 'Times New Roman', serif; background: #fff; }
      `}</style>

      {/* Drucken-Button — nur am Bildschirm */}
      <div className="no-print flex gap-3 p-4 bg-gray-50 border-b">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900"
        >
          Drucken / PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
        >
          Schließen
        </button>
      </div>

      {/* Quittung */}
      <div style={{
        maxWidth: "180mm",
        margin: "0 auto",
        padding: "15mm 15mm",
        minHeight: "240mm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ borderBottom: "2px solid #0f2d5e", paddingBottom: "6mm", marginBottom: "8mm" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "8pt", color: "#888", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2mm" }}>
                Lions Club Edenkoben · Kunsttage auf der Ludwigshöhe 2026
              </div>
              <div style={{ fontSize: "22pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1 }}>
                Quittung
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "8pt", color: "#888" }}>Nr. {kauf.id}</div>
              <div style={{ fontSize: "9pt", color: "#333", marginTop: "1mm" }}>{datum}</div>
              {kauf.bezahlt && (
                <div style={{ fontSize: "8pt", color: "#16a34a", marginTop: "2mm", fontWeight: "bold" }}>
                  ✓ Bezahlt · {kauf.zahlungsart}
                </div>
              )}
              {!kauf.bezahlt && (
                <div style={{ fontSize: "8pt", color: "#b45309", marginTop: "2mm" }}>
                  Zahlung ausstehend · {kauf.zahlungsart}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kunstwerk */}
        <div style={{ marginBottom: "8mm" }}>
          <div style={{ fontSize: "7.5pt", color: "#888", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "3mm" }}>
            Kunstwerk
          </div>
          <div style={{ fontSize: "16pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1.2, marginBottom: "2mm" }}>
            {kauf.bildtitel ?? "—"}
          </div>
          {kauf.kuenstler && (
            <div style={{ fontSize: "11pt", color: "#333", marginBottom: "1.5mm" }}>
              {kauf.kuenstler}
              {kauf.kuenstler_beruf && (
                <span style={{ fontSize: "9pt", color: "#888", marginLeft: "6px" }}>{kauf.kuenstler_beruf}</span>
              )}
            </div>
          )}
          <div style={{ fontSize: "9pt", color: "#555", lineHeight: 1.6 }}>
            {kauf.bildtechnik && <span>{kauf.bildtechnik}</span>}
            {abmessungen && <span style={{ marginLeft: "8px", color: "#888" }}>· {abmessungen}</span>}
            {kauf.bild_nr && (
              <span style={{ marginLeft: "8px", color: "#aaa", fontFamily: "monospace" }}>
                · {formatBildNr(kauf.bild_nr)}
              </span>
            )}
          </div>
        </div>

        <div style={{ borderTop: "0.5px solid #eee", marginBottom: "8mm" }} />

        {/* Käufer */}
        <div style={{ marginBottom: "8mm" }}>
          <div style={{ fontSize: "7.5pt", color: "#888", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "3mm" }}>
            Käufer
          </div>
          <div style={{ fontSize: "11pt", color: "#333", lineHeight: 1.7 }}>
            <div style={{ fontWeight: "bold" }}>{kaeufer}</div>
            <div>{kauf.kaeufer_strasse}</div>
            <div>{kauf.kaeufer_plz} {kauf.kaeufer_ort}</div>
            <div style={{ color: "#888", fontSize: "9pt" }}>{kauf.kaeufer_email}</div>
          </div>
        </div>

        <div style={{ borderTop: "0.5px solid #eee", marginBottom: "8mm" }} />

        {/* Preis */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8mm" }}>
          <div style={{ fontSize: "11pt", color: "#555" }}>Kaufpreis</div>
          <div style={{ fontSize: "28pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1 }}>
            {kauf.verkaufspreis ? `${kauf.verkaufspreis.toLocaleString("de-DE")} €` : "auf Anfrage"}
          </div>
        </div>

        {/* Hinweis */}
        <div style={{ fontSize: "7.5pt", color: "#aaa", lineHeight: 1.5, marginBottom: "8mm" }}>
          Der Erlös dient gemeinnützigen Zwecken des Lions Club Edenkoben e. V. ·
          Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
        </div>

        {/* Unterschriften */}
        <div style={{ marginTop: "auto", display: "flex", gap: "20mm" }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderTop: "0.5px solid #ccc", paddingTop: "2mm", fontSize: "7.5pt", color: "#aaa" }}>
              Datum / Unterschrift Käufer
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ borderTop: "0.5px solid #ccc", paddingTop: "2mm", fontSize: "7.5pt", color: "#aaa" }}>
              Datum / Unterschrift Lions Club
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

```

### app/admin/kaufuebersicht/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { getAlleKaeufe, alsBezahltMarkieren } from "@/lib/api";
import { Kauf } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

export default function KaufuebersichtPage() {
  const [kaeufe, setKaeufe] = useState<Kauf[]>([]);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState("");

  function laden_() {
    setLaden(true);
    getAlleKaeufe().then(setKaeufe).finally(() => setLaden(false));
  }

  useEffect(laden_, []);

  async function handleBezahlt(k: Kauf) {
    await alsBezahltMarkieren(k.id);
    laden_();
  }

  const gefiltert = kaeufe.filter(k => {
    const s = suche.toLowerCase();
    return (
      !s ||
      k.kaeufer_name.toLowerCase().includes(s) ||
      k.kaeufer_vorname.toLowerCase().includes(s) ||
      k.kaeufer_email.toLowerCase().includes(s) ||
      (k.bild_nr ?? "").toLowerCase().includes(s) ||
      (k.bildtitel ?? "").toLowerCase().includes(s) ||
      (k.kuenstler ?? "").toLowerCase().includes(s)
    );
  });

  const gesamtErloese = kaeufe.reduce((s, k) => s + (k.verkaufspreis ?? 0), 0);
  const bezahltErloese = kaeufe.filter(k => k.bezahlt).reduce((s, k) => s + (k.verkaufspreis ?? 0), 0);

  if (laden) return <p className="p-8 text-gray-400">Laden…</p>;

  return (
    <div>
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b sticky top-0 z-10">
        <div className="flex-1">
          <h1 className="font-bold text-lions-blue">Kaufübersicht</h1>
          <p className="text-xs text-gray-400">
            {kaeufe.length} Verkäufe · {bezahltErloese.toLocaleString("de-DE")} € bezahlt
            {bezahltErloese < gesamtErloese && ` · ${(gesamtErloese - bezahltErloese).toLocaleString("de-DE")} € ausstehend`}
          </p>
        </div>
        <input
          type="search"
          placeholder="Käufer, Titel oder Bild-Nr.…"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue w-64"
        />
      </div>

      <div className="p-6">
        {gefiltert.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            {kaeufe.length === 0 ? "Noch keine Verkäufe erfasst." : `Keine Treffer für „${suche}"`}
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-2 pr-4 font-medium">Datum</th>
                <th className="pb-2 pr-4 font-medium">Bild</th>
                <th className="pb-2 pr-4 font-medium">Künstler</th>
                <th className="pb-2 pr-4 font-medium">Käufer</th>
                <th className="pb-2 pr-4 font-medium">Zahlung</th>
                <th className="pb-2 pr-4 font-medium text-right">Preis</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gefiltert.map(k => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-400 whitespace-nowrap font-mono text-xs">
                    {new Date(k.erstellt_am).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    <br />
                    <span className="text-gray-300">{new Date(k.erstellt_am).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-800 leading-tight">{k.bildtitel ?? "—"}</div>
                    <div className="font-mono text-xs text-gray-400 mt-0.5">{k.bild_nr ? formatBildNr(k.bild_nr) : "—"}</div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{k.kuenstler ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <div className="text-gray-800">
                      {[k.kaeufer_titel, k.kaeufer_vorname, k.kaeufer_name].filter(Boolean).join(" ")}
                    </div>
                    <div className="text-xs text-gray-400">{k.kaeufer_email}</div>
                    <div className="text-xs text-gray-400">{k.kaeufer_strasse}, {k.kaeufer_plz} {k.kaeufer_ort}</div>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{k.zahlungsart}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                    {k.verkaufspreis ? `${k.verkaufspreis.toLocaleString("de-DE")} €` : "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-1.5 items-start">
                      {k.bezahlt ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                          ✓ Bezahlt
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBezahlt(k)}
                          className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-medium transition-colors whitespace-nowrap"
                        >
                          Ausstehend
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`/admin/kaufuebersicht/${k.id}/quittung`, "_blank")}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors whitespace-nowrap"
                      >
                        Quittung
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={5} className="pt-3 text-sm text-gray-500">Gesamt ({gefiltert.length} Verkäufe)</td>
                <td className="pt-3 text-right font-bold text-lions-blue">
                  {gefiltert.reduce((s, k) => s + (k.verkaufspreis ?? 0), 0).toLocaleString("de-DE")} €
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

```

### app/admin/kuenstler/[id]/drucken/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Kuenstler } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function DruckenPage() {
  const { id } = useParams<{ id: string }>();
  const [kuenstler, setKuenstler] = useState<Kuenstler | null>(null);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    fetch(`${API}/admin/kuenstler/${id}`)
      .then(r => r.json())
      .then(setKuenstler)
      .catch(() => setFehler("Fehler beim Laden."));
  }, [id]);

  // App-Chrome ausblenden
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "drucken-override";
    style.textContent = `
      header { display: none !important; }
      body > footer, body > div > footer { display: none !important; }
      main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("drucken-override")?.remove();
  }, []);

  useEffect(() => {
    if (kuenstler) {
      const name = [kuenstler.db_vorname, kuenstler.db_name].filter(Boolean).join(" ");
      document.title = `Vita – ${name}`;
    }
  }, [kuenstler]);

  if (fehler) return <p style={{ padding: 32, color: "red" }}>{fehler}</p>;
  if (!kuenstler) return <p style={{ padding: 32, color: "#888" }}>Laden…</p>;

  const name = [kuenstler.db_vorname, kuenstler.db_name].filter(Boolean).join(" ");
  const portrait = kuenstler.portrait_foto ? `${API}${kuenstler.portrait_foto}` : null;

  const adresse = [
    kuenstler.db_adresse,
    [kuenstler.db_plz, kuenstler.db_ort].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ");

  function textLines(text: string) {
    return text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  }

  function ausstellungLines(text: string) {
    return text.trim().split("\n")
      .map(l => l.trim().replace(/^[•·\-]\s*/, ""))
      .filter(Boolean);
  }

return (
    <>
      <div id="no-print-bar">
        <button onClick={() => window.print()}>Drucken / Als PDF</button>
        <button onClick={() => window.close()}>Schließen</button>
      </div>

      <div id="vita">

        {/* ── Header ── */}
        <div id="header">
          <div id="portrait">
            {portrait
              ? <img src={portrait} alt={name} />
              : <div id="portrait-placeholder">{name[0]}</div>}
          </div>
          <div id="name-col">
            <h1>{name}</h1>
            <hr className="olive" />
            {kuenstler.db_beruf && <div id="beruf">{kuenstler.db_beruf}</div>}
          </div>
        </div>

        <hr className="olive thick" />

        {/* ── Body ── */}
        <div id="body">

          {/* Linke Spalte */}
          <div id="col-left">
            {kuenstler.db_inspiration && (
              <section>
                <h2>Inspiration</h2>
                <div className="box">
                  {textLines(kuenstler.db_inspiration).map((l, i) => <p key={i}>{l}</p>)}
                </div>
              </section>
            )}

            {(kuenstler.db_lebenstext || kuenstler.db_kommentar) && (
              <section>
                <h2>{kuenstler.db_lebenstext ? "Leben/Ausbildung" : "Kurzbiografie"}</h2>
                <div className="box">
                  {textLines(kuenstler.db_lebenstext || kuenstler.db_kommentar || "")
                    .map((l, i) => <p key={i}>{l}</p>)}
                </div>
              </section>
            )}

          </div>

          {/* Rechte Spalte */}
          <div id="col-right">
            {kuenstler.db_ausstellungen && (
              <section>
                <h2>Ausstellungen / Auszeichnungen</h2>
                <div className="box">
                  <ul>
                    {ausstellungLines(kuenstler.db_ausstellungen).map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Kontakt immer am unteren Ende der rechten Spalte */}
            <div id="kontakt-push" />
            <section id="kontakt">
              <h2>Kontakt</h2>
              <div className="box kontakt-grid">
                {[
                  ["Adr.",   adresse],
                  ["Web",    kuenstler.db_webseite || ""],
                  ["Tel.",   kuenstler.db_telefon || ""],
                  ["E-Mail", kuenstler.db_email || ""],
                  ["Insta",  kuenstler.db_instagram || ""],
                  ["FB",     kuenstler.db_facebook || ""],
                ].filter(([, val]) => val).map(([label, val]) => (
                  <div key={label} className="krow">
                    <span className="klabel">{label}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer>
          <hr className="olive" />
          <div id="footer-text">
            Kunsttage auf der Ludwigshöhe · Eine Benefizveranstaltung der Lions Clubs der Südpfalz · Alle Erlöse für gemeinnützige Zwecke
          </div>
        </footer>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff;
               -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        #no-print-bar {
          position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; z-index: 999;
        }
        #no-print-bar button {
          padding: 6px 14px; font-size: 13px; border-radius: 4px; cursor: pointer; border: 1px solid #ccc;
        }
        #no-print-bar button:first-child { background: #1a3a6b; color: #fff; border-color: #1a3a6b; }

        #vita {
          width: 210mm; padding: 16mm 18mm; margin: 0 auto;
          min-height: 297mm; display: flex; flex-direction: column;
        }

        /* Header */
        #header { display: grid; grid-template-columns: 58mm 1fr; gap: 8mm; align-items: start; }
        #portrait img { width: 54mm; height: 54mm; object-fit: cover; display: block; }
        #portrait-placeholder {
          width: 54mm; height: 54mm; background: #ddd;
          display: flex; align-items: center; justify-content: center; font-size: 26pt; color: #888;
        }
        #name-col { padding-top: 2mm; }
        h1 { font-size: 26pt; font-weight: bold; line-height: 1.2; margin-bottom: 3mm; text-align: center; }
        hr.olive { border: none; border-top: 1px solid #7a8c50; margin: 2mm 0; }
        hr.thick { border-top-width: 1.5px; margin: 3mm 0 4mm; }
        #beruf {
          background: #888888; color: #fff; text-align: center;
          padding: 5px 10px; font-size: 14pt; margin-top: 3mm;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }

        /* Body */
        #body { display: grid; grid-template-columns: 44% 56%; flex: 1; margin-top: 2mm; }
        #col-left { padding-right: 6mm; }
        #col-right { padding-left: 2mm; display: flex; flex-direction: column; }
        #kontakt-push { flex: 1; min-height: 4mm; }

        section { margin-top: 5mm; }
        h2 { font-size: 11pt; font-weight: bold; margin-bottom: 2mm; }

        .box {
          background: #f4f4f2; border: 0.5px solid #d0d0c8;
          padding: 5px 8px; font-size: 8.5pt; line-height: 1.5;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .box p { margin: 1px 0; }
        .box ul { list-style: none; padding: 0; }
        .box ul li { padding-left: 10px; position: relative; margin: 1px 0; }
        .box ul li::before { content: "•"; position: absolute; left: 0; }

        /* Kontakt */
        .kontakt-grid { display: flex; flex-direction: column; gap: 0; }
        .krow { display: grid; grid-template-columns: 38px 1fr; gap: 4px; line-height: 1.7; }
        .klabel { font-weight: bold; }

        /* Footer */
        footer { margin-top: auto; padding-top: 3mm; }
        #footer-text {
          text-align: center;
          font-size: 10pt; color: #7a8c50; padding-top: 2mm;
        }

        @media print {
          #no-print-bar { display: none !important; }
          body { margin: 0; }
          #vita { width: 100%; padding: 12mm 15mm 28mm; min-height: auto; }
          footer { position: fixed; bottom: 0; left: 15mm; right: 15mm; background: white;
                   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </>
  );
}

```

### app/admin/kuenstler/page.tsx

```tsx
"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { getAlleKuenstler, getAlleBilder, kuenstlerAktualisieren, kuenstlerEinladen, kuenstlerLoeschen } from "@/lib/api";
import { authHeaders } from "@/lib/auth";
import { Kuenstler, Bild } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL;

// --- Edit Modal ---
type EditTab = "stamm" | "vita" | "kontakt" | "orga";

function EditModal({ k, onClose, onSaved, onDeleted }: { k: Kuenstler; onClose: () => void; onSaved: (k: Kuenstler) => void; onDeleted: (id: number) => void }) {
  const [tab, setTab] = useState<EditTab>("stamm");
  const [form, setForm] = useState({
    db_vorname: k.db_vorname ?? "",
    db_name: k.db_name,
    kuenstler_nr: k.kuenstler_nr ?? "",
    db_beruf: k.db_beruf ?? "",
    db_leben: (k as any).db_leben ?? "",
    db_lebenstext: k.db_lebenstext ?? "",
    db_kommentar: k.db_kommentar ?? "",
    db_inspiration: k.db_inspiration ?? "",
    db_ausstellungen: (k as any).db_ausstellungen ?? "",
    db_email: k.db_email ?? "",
    db_telefon: (k as any).db_telefon ?? "",
    db_adresse: k.db_adresse ?? "",
    db_plz: k.db_plz ?? "",
    db_ort: k.db_ort ?? "",
    db_webseite: k.db_webseite ?? "",
    db_instagram: k.db_instagram ?? "",
    db_facebook: k.db_facebook ?? "",
    aktiv: k.aktiv !== false,
    vor_ort_anwesend: k.vor_ort_anwesend ?? false,
    ist_galerist: k.ist_galerist ?? false,
    abrechnungsempf: (k as any).abrechnungsempf ?? "Künstler",
    galerist_id: String((k as any).galerist_id ?? ""),
    kuenstlertyp: (k as any).kuenstlertyp ?? "vor_ort",
  });
  const [alleKuenstler, setAlleKuenstler] = useState<Kuenstler[]>([]);
  useEffect(() => { getAlleKuenstler().then(setAlleKuenstler).catch(() => {}); }, []);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [portalLink, setPortalLink] = useState("");
  const [portalLaden, setPortalLaden] = useState(false);
  const [loeschenLaden, setLoeschenLaden] = useState(false);
  const [loeschenBestaetigung, setLoeschenBestaetigung] = useState(false);

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue/30 focus:border-lions-blue bg-white";
  const lbl = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";
  const hint = "text-xs text-gray-400 mt-1";

  function handlePortraitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPortraitFile(file);
    if (file) setPortraitPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const updated = await kuenstlerAktualisieren(k.id, {
        db_vorname: form.db_vorname || undefined,
        db_name: form.db_name,
        kuenstler_nr: form.kuenstler_nr || undefined,
        db_beruf: form.db_beruf || undefined,
        db_leben: form.db_leben || undefined,
        db_lebenstext: form.db_lebenstext || undefined,
        db_kommentar: form.db_kommentar || undefined,
        db_inspiration: form.db_inspiration || undefined,
        db_ausstellungen: form.db_ausstellungen || undefined,
        db_email: form.db_email || undefined,
        db_adresse: form.db_adresse || undefined,
        db_plz: form.db_plz || undefined,
        db_ort: form.db_ort || undefined,
        db_webseite: form.db_webseite || undefined,
        db_instagram: form.db_instagram || undefined,
        db_facebook: form.db_facebook || undefined,
        aktiv: form.aktiv,
        vor_ort_anwesend: form.vor_ort_anwesend,
        ist_galerist: form.ist_galerist,
        abrechnungsempf: form.abrechnungsempf,
        galerist_id: form.abrechnungsempf === "Galerist" && form.galerist_id ? Number(form.galerist_id) : null,
        kuenstlertyp: form.kuenstlertyp,
        ...(form.db_telefon ? { db_telefon: form.db_telefon } : {}),
      } as any);
      if (portraitFile) {
        const fd = new FormData();
        fd.append("file", portraitFile);
        await fetch(`${API}/kuenstler/${k.id}/portrait`, { method: "POST", body: fd });
      }
      onSaved(updated);
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  async function handleEinladen() {
    setPortalLaden(true);
    try {
      const { portal_url } = await kuenstlerEinladen(k.id);
      setPortalLink(`${window.location.origin}${portal_url}`);
    } catch (err: any) { setFehler(err.message); }
    finally { setPortalLaden(false); }
  }

  const TABS: { id: EditTab; label: string }[] = [
    { id: "stamm",   label: "Stammdaten" },
    { id: "vita",    label: "Vita & Profil" },
    { id: "kontakt", label: "Kontakt & Web" },
    { id: "orga",    label: "Organisation" },
  ];

  const avatarSrc = portraitPreview ?? (k.portrait_foto ? `${API}${k.portrait_foto}` : null);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b">
          <div className="relative">
            {avatarSrc
              ? <img src={avatarSrc} alt="Portrait" className="w-11 h-11 rounded-full object-cover shadow" />
              : <div className="w-11 h-11 rounded-full bg-lions-blue/10 flex items-center justify-center text-lions-blue font-bold text-base">
                  {(k.db_vorname?.[0] ?? "") + k.db_name[0]}
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-800 truncate">
              {form.db_vorname ? `${form.db_vorname} ${form.db_name}` : form.db_name}
            </h2>
            <p className="text-xs text-gray-400">{form.db_beruf || "Künstler·in"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-2">×</button>
        </div>

        {/* ── Tab-Nav ── */}
        <div className="flex border-b px-6 gap-1">
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? "border-lions-blue text-lions-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab-Inhalte (scrollbar) ── */}
        <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ─── Tab: Stammdaten ─── */}
            {tab === "stamm" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Vorname</label>
                    <input value={form.db_vorname} onChange={e => setForm({...form, db_vorname: e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Nachname *</label>
                    <input required value={form.db_name} onChange={e => setForm({...form, db_name: e.target.value})} className={inp} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Lebensdaten</label>
                  <input value={form.db_leben} onChange={e => setForm({...form, db_leben: e.target.value})}
                    placeholder="z.B. *1981 oder 1902–1967" className={inp} />
                  <p className={hint}>Erscheint im Katalog neben dem Namen</p>
                </div>

                <div>
                  <label className={lbl}>Künstlernummer <span className="font-mono normal-case">(KKK)</span></label>
                  <div className="flex items-center gap-3">
                    <input
                      value={form.kuenstler_nr}
                      onChange={e => setForm({...form, kuenstler_nr: e.target.value.replace(/\D/g, "").slice(0, 3)})}
                      placeholder="z.B. 105"
                      maxLength={3}
                      className={`w-24 border rounded-lg px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 ${
                        form.kuenstler_nr.length === 3 ? "border-green-400 focus:ring-green-400/30 bg-green-50" :
                        form.kuenstler_nr.length > 0   ? "border-yellow-400 focus:ring-yellow-400/30" :
                                                          "border-red-300 focus:ring-red-300/30"
                      }`}
                    />
                    {form.kuenstler_nr.length === 3
                      ? <span className="text-xs text-green-600">→ Bildnr. {formatBildNr(`26${form.kuenstler_nr}01`)}, {formatBildNr(`26${form.kuenstler_nr}02`)} …</span>
                      : <span className="text-xs text-red-500">3 Stellen erforderlich für Bildnummern</span>
                    }
                  </div>
                </div>

                <div>
                  <label className={lbl}>Kurzbiografie</label>
                  <textarea rows={2} value={form.db_kommentar} onChange={e => setForm({...form, db_kommentar: e.target.value})}
                    placeholder="Kurzer Begleittext für Bildbeschriftungen und Katalog…" className={inp} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>E-Mail</label>
                    <input type="email" value={form.db_email} onChange={e => setForm({...form, db_email: e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Telefon</label>
                    <input value={form.db_telefon} onChange={e => setForm({...form, db_telefon: e.target.value})} className={inp} />
                  </div>
                </div>
              </>
            )}

            {/* ─── Tab: Vita & Profil ─── */}
            {tab === "vita" && (
              <>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="relative group cursor-pointer">
                    {avatarSrc
                      ? <img src={avatarSrc} alt="Portrait" className="w-16 h-16 rounded-full object-cover shadow" />
                      : <div className="w-16 h-16 rounded-full bg-lions-blue/10 flex items-center justify-center text-lions-blue font-bold text-xl">
                          {(k.db_vorname?.[0] ?? "") + k.db_name[0]}
                        </div>
                    }
                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">ändern</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handlePortraitChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Portrait-Foto</p>
                    <p className="text-xs text-gray-400 mt-0.5">Quadratisch, min. 300 × 300 px</p>
                    {portraitFile && <p className="text-xs text-green-600 mt-0.5">✓ {portraitFile.name}</p>}
                  </div>
                </div>

                <div>
                  <label className={lbl}>Berufsbezeichnung</label>
                  <input value={form.db_beruf} onChange={e => setForm({...form, db_beruf: e.target.value})}
                    placeholder="z.B. Malerin, Bildhauer, Fotografin…" className={inp} />
                  <p className={hint}>Erscheint unter dem Namen auf der Vita</p>
                </div>

                <div>
                  <label className={lbl}>Künstlerische Aussage / Inspiration</label>
                  <textarea rows={4} value={form.db_inspiration} onChange={e => setForm({...form, db_inspiration: e.target.value})}
                    placeholder="Was bewegt diese Künstlerin / diesen Künstler? Was möchte sie / er ausdrücken?"
                    className={inp} />
                </div>

                <div>
                  <label className={lbl}>Leben & Ausbildung</label>
                  <textarea rows={4} value={form.db_lebenstext} onChange={e => setForm({...form, db_lebenstext: e.target.value})}
                    placeholder={"Geburtsort, Ausbildung, Werdegang…"} className={inp} />
                </div>

                <div>
                  <label className={lbl}>Ausstellungen & Auszeichnungen</label>
                  <textarea rows={4} value={form.db_ausstellungen} onChange={e => setForm({...form, db_ausstellungen: e.target.value})}
                    placeholder={"2023 Kunsttage auf der Ludwigshöhe\n2022 Galerie Musterstadt"} className={inp} />
                  <p className={hint}>Eine Zeile pro Eintrag — wird als Aufzählung dargestellt</p>
                </div>

                {k.vor_ort_anwesend && (
                  <a href={`/admin/kuenstler/${k.id}/drucken`} target="_blank"
                    className="inline-flex items-center gap-1.5 text-sm text-lions-blue hover:text-blue-900">
                    ⎙ Vita als A4 drucken
                  </a>
                )}
              </>
            )}

            {/* ─── Tab: Kontakt & Web ─── */}
            {tab === "kontakt" && (
              <>
                <div>
                  <label className={lbl}>Straße</label>
                  <input value={form.db_adresse} onChange={e => setForm({...form, db_adresse: e.target.value})} className={inp} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>PLZ</label>
                    <input value={form.db_plz} onChange={e => setForm({...form, db_plz: e.target.value})} className={inp} />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Ort</label>
                    <input value={form.db_ort} onChange={e => setForm({...form, db_ort: e.target.value})} className={inp} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className={lbl}>Webseite</label>
                  <input value={form.db_webseite} onChange={e => setForm({...form, db_webseite: e.target.value})}
                    placeholder="https://www.beispiel.de" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Instagram</label>
                  <input value={form.db_instagram} onChange={e => setForm({...form, db_instagram: e.target.value})}
                    placeholder="https://instagram.com/…" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Facebook</label>
                  <input value={form.db_facebook} onChange={e => setForm({...form, db_facebook: e.target.value})}
                    placeholder="https://facebook.com/…" className={inp} />
                </div>
              </>
            )}

            {/* ─── Tab: Organisation ─── */}
            {tab === "orga" && (
              <>
                <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.aktiv} onChange={e => setForm({...form, aktiv: e.target.checked})}
                      className="w-4 h-4 rounded accent-lions-blue" />
                    <span className="text-sm font-medium text-gray-700">Aktiv</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.vor_ort_anwesend} onChange={e => setForm({...form, vor_ort_anwesend: e.target.checked})}
                      className="w-4 h-4 rounded accent-lions-blue" />
                    <span className={`text-sm font-medium ${form.vor_ort_anwesend ? "text-lions-blue" : "text-gray-700"}`}>
                      Vor Ort anwesend
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.ist_galerist} onChange={e => setForm({...form, ist_galerist: e.target.checked})}
                      className="w-4 h-4 rounded accent-lions-blue" />
                    <span className={`text-sm font-medium ${form.ist_galerist ? "text-lions-blue" : "text-gray-700"}`}>
                      Ist Galerist·in
                    </span>
                  </label>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className={lbl}>Typ</label>
                  <select value={form.kuenstlertyp} onChange={e => setForm({...form, kuenstlertyp: e.target.value})} className={inp}>
                    <option value="vor_ort">Künstler·in vor Ort</option>
                    <option value="galerie">Galerie / Händler</option>
                    <option value="eigenbestand">Eigenbestand</option>
                  </select>
                </div>

                <div>
                  <label className={lbl}>Abrechnung über</label>
                  <select value={form.abrechnungsempf} onChange={e => setForm({...form, abrechnungsempf: e.target.value, galerist_id: ""})} className={inp}>
                    <option value="Künstler">Direkt an Künstler·in</option>
                    <option value="Galerist">Über Galerist / Sammler</option>
                  </select>
                </div>
                {form.abrechnungsempf === "Galerist" && (
                  <div>
                    <label className={lbl}>Galerist / Sammler</label>
                    <select value={form.galerist_id} onChange={e => setForm({...form, galerist_id: e.target.value})} className={inp}>
                      <option value="">— bitte wählen —</option>
                      {alleKuenstler.filter(a => a.id !== k.id && a.ist_galerist).sort((a, b) => a.db_name.localeCompare(b.db_name)).map(a => (
                        <option key={a.id} value={a.id}>{a.db_name}, {a.db_vorname}</option>
                      ))}
                    </select>
                  </div>
                )}

                <hr className="border-gray-100" />

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Künstler-Portal</p>
                  <button type="button" onClick={handleEinladen} disabled={portalLaden}
                    className="px-4 py-2 text-sm border border-lions-blue text-lions-blue rounded-lg hover:bg-lions-blue hover:text-white transition-colors disabled:opacity-50">
                    {portalLaden ? "Wird generiert…" : "Login-Link generieren (48 h)"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">Link per E-Mail oder WhatsApp weitergeben. Gültig 48 Stunden.</p>
                  {portalLink && (
                    <div className="mt-3 flex gap-2">
                      <input readOnly value={portalLink}
                        className="flex-1 border rounded-lg px-3 py-1.5 text-xs font-mono text-gray-600 bg-gray-50 focus:outline-none" />
                      <button type="button" onClick={() => navigator.clipboard.writeText(portalLink)}
                        className="px-3 py-1.5 text-xs bg-lions-blue text-white rounded-lg hover:bg-blue-900">
                        Kopieren
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center gap-3">
            <div>
              {!loeschenBestaetigung
                ? <button type="button" onClick={() => setLoeschenBestaetigung(true)}
                    className="text-sm text-red-400 hover:text-red-600">
                    Löschen
                  </button>
                : <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-medium">Wirklich löschen?</span>
                    <button type="button" disabled={loeschenLaden} onClick={async () => {
                      setLoeschenLaden(true); setFehler("");
                      try { await kuenstlerLoeschen(k.id); onDeleted(k.id); }
                      catch (err: any) { setFehler(err.message); setLoeschenBestaetigung(false); }
                      finally { setLoeschenLaden(false); }
                    }} className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                      {loeschenLaden ? "…" : "Ja, löschen"}
                    </button>
                    <button type="button" onClick={() => setLoeschenBestaetigung(false)}
                      className="px-3 py-1 text-xs border rounded-lg hover:bg-white">
                      Abbrechen
                    </button>
                  </div>
              }
              {fehler && <p className="text-red-600 text-xs mt-1">{fehler}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-white">Abbrechen</button>
              <button type="submit" disabled={laden} className="px-5 py-2 text-sm bg-lions-blue text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 font-medium">
                {laden ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Neu-Modal ---
function NeuModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ db_vorname: "", db_name: "", db_email: "", db_telefon: "" });
  const [laden, setLaden] = useState(false);
  const [ergebnis, setErgebnis] = useState<{ portalLink: string } | null>(null);
  const [fehler, setFehler] = useState("");
  const inp = "w-full border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-1 focus:ring-lions-blue";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const res = await fetch(`${API}/admin/kuenstler`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...form, db_ident: "" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      const einRes = await fetch(`${API}/admin/kuenstler/${id}/einladen`, { method: "POST", headers: authHeaders() });
      if (!einRes.ok) throw new Error(await einRes.text());
      const { portal_url } = await einRes.json();
      setErgebnis({ portalLink: `${window.location.origin}${portal_url}` });
      onCreated();
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Künstler anlegen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        {!ergebnis ? (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vorname *</label>
                <input required value={form.db_vorname} onChange={e => setForm({...form, db_vorname: e.target.value})} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nachname *</label>
                <input required value={form.db_name} onChange={e => setForm({...form, db_name: e.target.value})} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
              <input type="email" value={form.db_email} onChange={e => setForm({...form, db_email: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
              <input value={form.db_telefon} onChange={e => setForm({...form, db_telefon: e.target.value})} className={inp} />
            </div>
            {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
            <button type="submit" disabled={laden}
              className="w-full bg-lions-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-900 disabled:opacity-50">
              {laden ? "Wird angelegt…" : "Anlegen & Portal-Link generieren"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-green-700 font-medium">Künstler angelegt ✓</p>
            <p className="text-xs text-gray-500">Portal-Link (48h gültig):</p>
            <div className="flex gap-2">
              <input readOnly value={ergebnis.portalLink}
                className="flex-1 border rounded px-2 py-1.5 text-xs font-mono text-gray-600 bg-gray-50 focus:outline-none" />
              <button onClick={() => navigator.clipboard.writeText(ergebnis.portalLink)}
                className="px-3 py-1.5 text-xs bg-lions-blue text-white rounded hover:bg-blue-900">
                Kopieren
              </button>
            </div>
            <button onClick={onClose} className="w-full py-2 text-sm border rounded-md hover:bg-gray-50">Schließen</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Hauptseite ---
export default function AdminKuenstlerPage() {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState("");
  const [editK, setEditK] = useState<Kuenstler | null>(null);
  const [showNeu, setShowNeu] = useState(false);
  const [nurMitEmail, setNurMitEmail] = useState(false);
  const [nurAnwesend, setNurAnwesend] = useState(false);
  const [nurMitBildern, setNurMitBildern] = useState(false);
  const [mitInaktiven, setMitInaktiven] = useState(false);
  const [editNrId, setEditNrId] = useState<number | null>(null);
  const [editNrWert, setEditNrWert] = useState("");
  const [sortNr, setSortNr] = useState<"name" | "nr">("name");
  const [bilderByKuenstler, setBilderByKuenstler] = useState<Record<number, Bild[]>>({});
  const [popover, setPopover] = useState<{ id: number; x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState<{ bilder: Bild[]; index: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLaden(true);
    Promise.all([
      getAlleKuenstler(mitInaktiven),
      getAlleBilder(),
    ]).then(([ks, bilder]) => {
      setKuenstler(ks);
      const grouped: Record<number, Bild[]> = {};
      for (const b of bilder) {
        if (!grouped[b.kuenstler_id]) grouped[b.kuenstler_id] = [];
        grouped[b.kuenstler_id].push(b);
      }
      setBilderByKuenstler(grouped);
    }).finally(() => setLaden(false));
  }, [mitInaktiven]);

  const sichtbar = useMemo(() => {
    return kuenstler
      .filter(k => !nurMitEmail || !!k.db_email)
      .filter(k => !nurAnwesend || !!k.vor_ort_anwesend)
      .filter(k => !nurMitBildern || (bilderByKuenstler[k.id]?.length ?? 0) > 0)
      .filter(k => {
        if (!suche) return true;
        const s = suche.toLowerCase();
        return `${k.db_name} ${k.db_vorname}`.toLowerCase().includes(s)
          || (k.db_email ?? "").toLowerCase().includes(s);
      })
      .sort((a, b) => {
        if (sortNr === "nr") {
          const na = a.kuenstler_nr ?? "￿";
          const nb = b.kuenstler_nr ?? "￿";
          return na.localeCompare(nb) || `${a.db_name}${a.db_vorname}`.localeCompare(`${b.db_name}${b.db_vorname}`);
        }
        return `${a.db_name}${a.db_vorname}`.localeCompare(`${b.db_name}${b.db_vorname}`);
      });
  }, [kuenstler, suche, nurMitEmail, nurAnwesend, nurMitBildern, bilderByKuenstler, sortNr]);

  function handleSaved(updated: Kuenstler) {
    setKuenstler(prev => prev.map(k => k.id === updated.id ? { ...k, ...updated } : k));
    setEditK(null);
  }

  function handleDeleted(id: number) {
    setKuenstler(prev => prev.filter(k => k.id !== id));
    setEditK(null);
  }

  async function saveNr(k: Kuenstler) {
    const nr = editNrWert.trim();
    if (nr === (k.kuenstler_nr ?? "")) { setEditNrId(null); return; }
    setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, kuenstler_nr: nr || undefined } : x));
    setEditNrId(null);
    try {
      await kuenstlerAktualisieren(k.id, { kuenstler_nr: nr || undefined } as any);
    } catch {
      setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, kuenstler_nr: k.kuenstler_nr } : x));
    }
  }

  async function toggleFeld(k: Kuenstler, feld: "vor_ort_anwesend" | "aktiv", e: React.MouseEvent) {
    e.stopPropagation();
    const neuerWert = !k[feld];
    setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, [feld]: neuerWert } : x));
    try {
      await kuenstlerAktualisieren(k.id, { [feld]: neuerWert } as any);
    } catch {
      setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, [feld]: k[feld] } : x));
    }
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="space-y-4">
      {editK && <EditModal k={editK} onClose={() => setEditK(null)} onSaved={handleSaved} onDeleted={handleDeleted} />}

      {/* Lightbox */}
      {lightbox && (() => {
        const b = lightbox.bilder[lightbox.index];
        const total = lightbox.bilder.length;
        const go = (delta: number) =>
          setLightbox({ ...lightbox, index: (lightbox.index + delta + total) % total });
        return (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            onKeyDown={e => {
              if (e.key === "ArrowLeft")  { e.stopPropagation(); go(-1); }
              if (e.key === "ArrowRight") { e.stopPropagation(); go(+1); }
              if (e.key === "Escape")     setLightbox(null);
            }}
            tabIndex={-1}
            ref={el => el?.focus()}
          >
            {/* Prev */}
            {total > 1 && (
              <button
                onClick={e => { e.stopPropagation(); go(-1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-xl flex items-center justify-center transition-colors"
              >‹</button>
            )}

            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
                 onClick={e => e.stopPropagation()}>
              {/* Zähler */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-xs text-gray-400 font-mono">{lightbox.index + 1} / {total}</span>
                <button onClick={() => setLightbox(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>

              {b.bild_url_web
                ? <img src={`${API}${b.bild_url_web}`} alt={b.bildtitel}
                       className="w-full max-h-[65vh] object-contain bg-gray-50" />
                : <div className="h-64 flex items-center justify-center text-gray-300 text-5xl bg-gray-50">🖼</div>
              }
              <div className="p-4">
                <p className="font-semibold text-gray-800">{b.bildtitel}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{formatBildNr(b.bild_nr)} · {b.bildtechnik} · {b.genre}</p>
                {b.verkaufspreis && (
                  <p className="text-sm text-lions-blue font-medium mt-1">€ {b.verkaufspreis.toLocaleString("de-DE")}</p>
                )}
              </div>
            </div>

            {/* Next */}
            {total > 1 && (
              <button
                onClick={e => { e.stopPropagation(); go(+1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-xl flex items-center justify-center transition-colors"
              >›</button>
            )}
          </div>
        );
      })()}
      {showNeu && <NeuModal onClose={() => setShowNeu(false)} onCreated={() => {
        setShowNeu(false);
        getAlleKuenstler().then(setKuenstler);
      }} />}

      {/* Kopfzeile */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-lions-blue">Künstler</h1>
        <button onClick={() => setShowNeu(true)}
          className="px-4 py-1.5 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 transition-colors">
          + Künstler anlegen
        </button>
      </div>

      {/* Filter & Suche */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={suche}
          onChange={e => setSuche(e.target.value)}
          placeholder="Name oder E-Mail suchen…"
          className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-lions-blue w-64"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurMitEmail}
            onChange={e => setNurMitEmail(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Nur mit E-Mail
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurAnwesend}
            onChange={e => setNurAnwesend(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Nur Anwesende
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurMitBildern}
            onChange={e => setNurMitBildern(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Nur mit Bildern
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mitInaktiven}
            onChange={e => setMitInaktiven(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Auch Inaktive
        </label>
        <span className="text-sm text-gray-400">{sichtbar.length} von {kuenstler.length}</span>
      </div>

      {/* Bilder-Popover */}
      {popover && (() => {
        const bilder = bilderByKuenstler[popover.id] ?? [];
        return (
          <div
            ref={popoverRef}
            style={{ position: "absolute", top: popover.y, left: Math.min(popover.x, window.innerWidth - 340), zIndex: 100 }}
            className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-3"
            onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
            onMouseLeave={() => { hideTimer.current = setTimeout(() => setPopover(null), 150); }}
          >
            <p className="text-xs font-semibold text-gray-500 mb-2">{bilder.length} Bild{bilder.length !== 1 ? "er" : ""}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {bilder.slice(0, 12).map((b, i) => (
                <button
                  key={b.id}
                  className="aspect-square rounded overflow-hidden bg-gray-100 relative group cursor-pointer"
                  onClick={() => { setPopover(null); setLightbox({ bilder, index: i }); }}
                  title={b.bildtitel}
                >
                  {b.bild_url_web
                    ? <img src={`${API}${b.bild_url_web}`} alt={b.bildtitel}
                        className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🖼</div>
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-white text-[9px] leading-tight font-mono">{formatBildNr(b.bild_nr)}</span>
                  </div>
                </button>
              ))}
            </div>
            {bilder.length > 12 && (
              <p className="text-xs text-gray-400 mt-2 text-center">+{bilder.length - 12} weitere</p>
            )}
          </div>
        );
      })()}

      {/* Tabelle */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap cursor-pointer select-none hover:text-gray-700"
                  onClick={() => setSortNr(s => s === "nr" ? "name" : "nr")}>
                Nr. {sortNr === "nr" ? "▲" : <span className="text-gray-300">⇅</span>}
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap cursor-pointer select-none hover:text-gray-700"
                  onClick={() => setSortNr(s => s === "name" ? "nr" : "name")}>
                Name {sortNr === "name" ? "▲" : ""}
              </th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Bilder</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">E-Mail</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Telefon</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Beruf</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Webseite</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Anwesend</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Aktiv</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sichtbar.map(k => (
              <tr key={k.id} onClick={() => setEditK(k)}
                className={`cursor-pointer transition-colors ${k.aktiv === false ? "opacity-50 bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50"}`}>
                <td className="px-2 py-1 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {editNrId === k.id ? (
                    <input
                      autoFocus
                      value={editNrWert}
                      onChange={e => setEditNrWert(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      onBlur={() => saveNr(k)}
                      onKeyDown={e => { if (e.key === "Enter") saveNr(k); if (e.key === "Escape") setEditNrId(null); }}
                      className="w-12 border rounded px-1.5 py-0.5 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-lions-blue"
                    />
                  ) : (
                    <button
                      onClick={() => { setEditNrId(k.id); setEditNrWert(k.kuenstler_nr ?? ""); }}
                      className={`w-12 rounded px-1.5 py-0.5 text-xs font-mono text-center border transition-colors ${
                        k.kuenstler_nr
                          ? "font-semibold text-gray-700 border-gray-200 hover:border-lions-blue hover:text-lions-blue"
                          : "text-red-400 border-red-200 hover:border-red-400"
                      }`}
                      title="Klicken zum Bearbeiten"
                    >
                      {k.kuenstler_nr ?? "!"}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {k.db_name}{k.db_vorname ? `, ${k.db_vorname}` : ""}
                  {(k as any).db_leben && <span className="ml-1.5 text-xs font-normal text-gray-400">{(k as any).db_leben}</span>}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {(() => {
                    const bilder = bilderByKuenstler[k.id] ?? [];
                    if (bilder.length === 0) return <span className="text-gray-300 text-xs">—</span>;
                    return (
                      <button
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-lions-blue/10 text-lions-blue hover:bg-lions-blue/20 transition-colors"
                        onMouseEnter={e => {
                          if (hideTimer.current) clearTimeout(hideTimer.current);
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setPopover({ id: k.id, x: rect.left, y: rect.bottom + window.scrollY + 6 });
                        }}
                        onMouseLeave={() => {
                          hideTimer.current = setTimeout(() => setPopover(null), 200);
                        }}
                      >
                        {bilder.length} Bild{bilder.length !== 1 ? "er" : ""}
                      </button>
                    );
                  })()}
                </td>
                <td className="px-3 py-2 text-gray-500 text-xs">{k.db_email ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{(k as any).db_telefon ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{k.db_beruf ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {k.db_webseite
                    ? <a href={k.db_webseite} target="_blank" onClick={e => e.stopPropagation()}
                        className="text-lions-blue hover:underline truncate max-w-32 inline-block">{k.db_webseite}</a>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2 text-center" onClick={e => toggleFeld(k, "vor_ort_anwesend", e)}>
                  <span className={`text-base cursor-pointer select-none ${k.vor_ort_anwesend ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-500"}`}>
                    {k.vor_ort_anwesend ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center" onClick={e => toggleFeld(k, "aktiv", e)}>
                  <span className={`text-base cursor-pointer select-none ${k.aktiv !== false ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-500"}`}>
                    {k.aktiv !== false ? "✓" : "✗"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sichtbar.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Keine Einträge.</p>
        )}
      </div>
    </div>
  );
}

```

### app/admin/layout.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRolle, logout } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [rolle, setRolle] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setRolle(getRolle());
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  function abmelden() {
    logout();
    router.push("/admin/login");
  }

  return (
    <div>
      <div className="bg-lions-blue text-white text-xs px-4 py-1.5 flex justify-between items-center no-print">
        <span className="opacity-75">
          {rolle === "admin" ? "Admin" : rolle === "orga" ? "Orga-Team" : ""}
        </span>
        <button
          onClick={abmelden}
          className="opacity-75 hover:opacity-100 hover:underline transition-opacity"
        >
          Abmelden
        </button>
      </div>
      {children}
    </div>
  );
}

```

### app/admin/login/page.tsx

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LoginPage() {
  const [rolle, setRolle] = useState<"admin" | "orga">("admin");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function einloggen(e: React.FormEvent) {
    e.preventDefault();
    if (!passwort) return;
    setFehler("");
    setLoading(true);
    try {
      const resp = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolle, passwort }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setFehler(err.detail ?? "Anmeldung fehlgeschlagen");
        return;
      }
      const { token, stunden } = await resp.json();
      setToken(token, stunden);
      router.push(rolle === "orga" ? "/admin/kasse" : "/admin");
    } catch {
      setFehler("Server nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-lions-blue">Kunsttage 2026</h1>
          <p className="text-gray-500 text-sm mt-1">Verwaltung · Anmeldung</p>
        </div>

        <form onSubmit={einloggen} className="bg-white rounded-lg shadow p-6 space-y-5">

          {/* Rolle */}
          <div className="grid grid-cols-2 gap-2">
            {(["admin", "orga"] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRolle(r)}
                className={`py-2 rounded-md text-sm font-medium border transition-colors ${
                  rolle === r
                    ? "bg-lions-blue text-white border-lions-blue"
                    : "bg-white text-gray-600 border-gray-300 hover:border-lions-blue"
                }`}
              >
                {r === "admin" ? "Admin" : "Orga-Team"}
              </button>
            ))}
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={passwort}
              onChange={e => setPasswort(e.target.value)}
              autoFocus
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
            />
          </div>

          {fehler && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {fehler}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passwort}
            className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>

        {rolle === "orga" && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Orga-Team: Zugriff auf Kasse, Kaufübersicht, Käufer und Bildaufsteller
          </p>
        )}
      </div>
    </div>
  );
}

```

### app/admin/merklisten/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { Bild } from "@/lib/types";
import { merkliste_admin_zusenden, merklisten_nachfassen } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

interface BesucherMerkliste {
  id: number;
  email: string | null;
  telefon: string | null;
  erstellt_am: string;
  anzahl: number;
  bilder: Bild[];
}

export default function AdminMerklistenPage() {
  const [daten, setDaten] = useState<BesucherMerkliste[]>([]);
  const [laden, setLaden] = useState(true);
  const [offen, setOffen] = useState<Set<number>>(new Set());
  const [senden, setSenden] = useState<Record<number, "laden" | "ok" | "fehler">>({});
  const [nachfass, setNachfass] = useState({ betreff: "", text: "" });
  const [nachfassStatus, setNachfassStatus] = useState<"" | "laden" | "ok" | "fehler">("");

  useEffect(() => {
    fetch(`${API}/admin/merklisten`)
      .then(r => r.json())
      .then(setDaten)
      .finally(() => setLaden(false));
  }, []);

  const empfaengerMitMerkliste = daten.filter(b => b.email && b.anzahl > 0).length;

  async function nachfassSenden(e: React.FormEvent) {
    e.preventDefault();
    setNachfassStatus("laden");
    try {
      await merklisten_nachfassen(nachfass.betreff, nachfass.text);
      setNachfassStatus("ok");
    } catch {
      setNachfassStatus("fehler");
    }
  }

  async function emailSenden(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setSenden(prev => ({ ...prev, [id]: "laden" }));
    try {
      await merkliste_admin_zusenden(id);
      setSenden(prev => ({ ...prev, [id]: "ok" }));
      setTimeout(() => setSenden(prev => { const n = { ...prev }; delete n[id]; return n; }), 3000);
    } catch {
      setSenden(prev => ({ ...prev, [id]: "fehler" }));
      setTimeout(() => setSenden(prev => { const n = { ...prev }; delete n[id]; return n; }), 3000);
    }
  }

  function toggle(id: number) {
    setOffen(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const gesamtFavoriten = daten.reduce((s, b) => s + b.anzahl, 0);

  // Beliebteste Bilder ermitteln
  const bildHits: Record<number, { bild: Bild; count: number }> = {};
  for (const b of daten) {
    for (const bild of b.bilder) {
      if (!bildHits[bild.id]) bildHits[bild.id] = { bild, count: 0 };
      bildHits[bild.id].count++;
    }
  }
  const top = Object.values(bildHits)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-lions-blue">Besucher-Merklisten</h1>

      {/* Kennzahlen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Besucher registriert", wert: daten.length },
          { label: "Favoriten gesamt", wert: gesamtFavoriten },
          { label: "Ø Werke je Besucher", wert: daten.length ? (gesamtFavoriten / daten.length).toFixed(1) : "—" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-3xl font-bold text-lions-blue">{k.wert}</div>
            <div className="text-sm text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Nachfass-Email */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="font-semibold text-gray-800 mb-1">Nachfass-Email</h2>
        <p className="text-xs text-gray-400 mb-4">
          Geht an <strong>{empfaengerMitMerkliste} Empfänger</strong> mit Merkliste (per BCC)
        </p>
        {nachfassStatus === "ok" ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800 text-sm text-center">
            ✓ Email an {empfaengerMitMerkliste} Empfänger gesendet.
            <button onClick={() => setNachfassStatus("")} className="ml-3 underline text-xs">Neue Email</button>
          </div>
        ) : (
          <form onSubmit={nachfassSenden} className="space-y-3">
            <input
              type="text" required placeholder="Betreff"
              value={nachfass.betreff}
              onChange={e => setNachfass(p => ({ ...p, betreff: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
            />
            <textarea
              required placeholder="Emailtext…" rows={6}
              value={nachfass.text}
              onChange={e => setNachfass(p => ({ ...p, text: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue resize-y"
            />
            {nachfassStatus === "fehler" && (
              <p className="text-red-600 text-xs">Fehler beim Senden — bitte erneut versuchen.</p>
            )}
            <button type="submit" disabled={nachfassStatus === "laden" || empfaengerMitMerkliste === 0}
              className="bg-lions-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-900 disabled:opacity-50">
              {nachfassStatus === "laden" ? "Wird gesendet…" : `✉ An ${empfaengerMitMerkliste} Empfänger senden`}
            </button>
          </form>
        )}
      </div>

      {/* Top-Werke */}
      {top.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Beliebteste Werke</h2>
          <div className="space-y-2">
            {top.map(({ bild, count }) => (
              <div key={bild.id} className="flex items-center gap-3">
                {bild.bild_url_web && (
                  <img src={`${API}${bild.bild_url_web}`} alt=""
                    className="w-10 h-10 object-cover rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{bild.bildtitel}</span>
                  {bild.kuenstler && (
                    <span className="text-xs text-gray-400 ml-2">
                      {bild.kuenstler.db_vorname} {bild.kuenstler.db_name}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-lions-blue flex-shrink-0">
                  {count}× gemerkt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Besucher-Tabelle */}
      {daten.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">Noch keine Merklisten angelegt.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Kontakt</th>
                <th className="px-4 py-3 text-left">Registriert</th>
                <th className="px-4 py-3 text-center">Werke</th>
                <th className="px-4 py-3 text-center">Aktion</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {daten.map(b => (
                <>
                  <tr key={b.id}
                    onClick={() => b.anzahl > 0 && toggle(b.id)}
                    className={`transition-colors ${b.anzahl > 0 ? "cursor-pointer hover:bg-gray-50" : ""}`}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        {b.email ?? b.telefon ?? "—"}
                      </span>
                      {b.email && b.telefon && (
                        <span className="text-xs text-gray-400 ml-2">{b.telefon}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(b.erstellt_am).toLocaleDateString("de-DE", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.anzahl > 0 ? "bg-lions-blue/10 text-lions-blue" : "bg-gray-100 text-gray-400"
                      }`}>
                        {b.anzahl}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      {b.email && b.anzahl > 0 && (
                        <button
                          onClick={e => emailSenden(e, b.id)}
                          disabled={senden[b.id] === "laden"}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            senden[b.id] === "ok"
                              ? "bg-green-100 text-green-700"
                              : senden[b.id] === "fehler"
                              ? "bg-red-100 text-red-700"
                              : "bg-lions-blue/10 text-lions-blue hover:bg-lions-blue hover:text-white disabled:opacity-50"
                          }`}
                        >
                          {senden[b.id] === "laden" ? "Wird gesendet…"
                            : senden[b.id] === "ok" ? "✓ Gesendet"
                            : senden[b.id] === "fehler" ? "Fehler"
                            : "✉ Senden"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-center">
                      {b.anzahl > 0 && (
                        <span className="text-xs">{offen.has(b.id) ? "▲" : "▼"}</span>
                      )}
                    </td>
                  </tr>
                  {offen.has(b.id) && (
                    <tr key={`${b.id}-detail`}>
                      <td colSpan={5} className="bg-gray-50 px-4 py-3">
                        <div className="space-y-2">
                          {b.bilder.map(bild => (
                            <div key={bild.id} className="flex items-center gap-3">
                              {bild.bild_url_web ? (
                                <img src={`${API}${bild.bild_url_web}`} alt=""
                                  className="w-10 h-10 object-cover rounded flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <a href={`/bilder/${bild.id}`} target="_blank"
                                  className="text-sm font-medium text-gray-800 hover:text-lions-blue">
                                  {bild.bildtitel}
                                </a>
                                {bild.kuenstler && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    {bild.kuenstler.db_vorname} {bild.kuenstler.db_name}
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                bild.verfuegbarkeit === "Verfügbar" ? "bg-green-100 text-green-700" :
                                bild.verfuegbarkeit === "Reserviert" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              }`}>{bild.verfuegbarkeit}</span>
                              {bild.verkaufspreis && (
                                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                  {bild.verkaufspreis.toFixed(0)} €
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

```

### app/admin/nachrichten/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import {
  besucher_newsletter_senden, nachricht_senden,
  getAlleNachrichten, getNachrichtUngelesen,
} from "@/lib/api";

type Nachricht = { id: number; betreff: string; text: string; erstellt_am: string; gelesen: number; gesamt: number };
type Ungelesen = { id: number; name: string; email: string };

function EmailForm({
  titel, hint, onSend,
}: {
  titel: string;
  hint: string;
  onSend: (betreff: string, text: string) => Promise<{ anzahl: number }>;
}) {
  const [form, setForm] = useState({ betreff: "", text: "" });
  const [status, setStatus] = useState<"" | "laden" | "ok" | "fehler">("");
  const [anzahl, setAnzahl] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("laden");
    try {
      const r = await onSend(form.betreff, form.text);
      setAnzahl(r.anzahl);
      setStatus("ok");
    } catch {
      setStatus("fehler");
    }
  }

  if (status === "ok")
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800 text-sm text-center">
        ✓ Gesendet an {anzahl} Empfänger.
        <button onClick={() => { setStatus(""); setForm({ betreff: "", text: "" }); }}
          className="ml-3 underline text-xs">Neue Email</button>
      </div>
    );

  return (
    <div>
      <h2 className="font-semibold text-gray-800 mb-1">{titel}</h2>
      <p className="text-xs text-gray-400 mb-3">{hint}</p>
      <form onSubmit={submit} className="space-y-3">
        <input type="text" required placeholder="Betreff"
          value={form.betreff} onChange={e => setForm(p => ({ ...p, betreff: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue" />
        <textarea required placeholder="Emailtext…" rows={6}
          value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue resize-y" />
        {status === "fehler" && <p className="text-red-600 text-xs">Fehler beim Senden.</p>}
        <button type="submit" disabled={status === "laden"}
          className="bg-lions-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-900 disabled:opacity-50">
          {status === "laden" ? "Wird gesendet…" : "✉ Senden"}
        </button>
      </form>
    </div>
  );
}

export default function AdminNachrichtenPage() {
  const [nachrichten, setNachrichten] = useState<Nachricht[]>([]);
  const [ungelesen, setUngelesen] = useState<Record<number, Ungelesen[]>>({});
  const [offen, setOffen] = useState<number | null>(null);

  useEffect(() => {
    getAlleNachrichten().then(setNachrichten).catch(() => {});
  }, []);

  async function handleKuenstlerSenden(betreff: string, text: string) {
    const r = await nachricht_senden(betreff, text);
    const neu = await getAlleNachrichten();
    setNachrichten(neu);
    return { anzahl: r.anzahl };
  }

  async function toggleUngelesen(id: number) {
    if (offen === id) { setOffen(null); return; }
    setOffen(id);
    if (!ungelesen[id]) {
      const liste = await getNachrichtUngelesen(id);
      setUngelesen(prev => ({ ...prev, [id]: liste }));
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-lions-blue">Kommunikation</h1>

      {/* Besucher-Newsletter */}
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <EmailForm
          titel="Besucher-Newsletter"
          hint="BCC an alle registrierten Besucher mit E-Mail-Adresse"
          onSend={(b, t) => besucher_newsletter_senden(b, t)}
        />
      </div>

      {/* Künstler-Infos */}
      <div className="bg-white rounded-lg shadow-sm border p-5 space-y-5">
        <EmailForm
          titel="Info an ausstellende Künstler"
          hint="BCC an alle vor Ort anwesenden Künstler mit E-Mail — wird gespeichert und ist im Portal sichtbar"
          onSend={handleKuenstlerSenden}
        />

        {/* Gesendete Nachrichten */}
        {nachrichten.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-3 border-t pt-4">Gesendete Nachrichten</h3>
            <div className="space-y-2">
              {nachrichten.map(n => (
                <div key={n.id} className="border rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleUngelesen(n.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{n.betreff}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(n.erstellt_am).toLocaleDateString("de-DE", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        n.gelesen === n.gesamt && n.gesamt > 0
                          ? "bg-green-100 text-green-700"
                          : n.gelesen > 0
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {n.gelesen}/{n.gesamt} gelesen
                      </span>
                      <span className="text-gray-400 text-xs">{offen === n.id ? "▲" : "▼"}</span>
                    </div>
                  </button>
                  {offen === n.id && (
                    <div className="bg-gray-50 border-t px-4 py-3 space-y-3">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.text}</p>
                      {ungelesen[n.id] !== undefined && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Noch nicht gelesen ({ungelesen[n.id].length}):
                          </p>
                          {ungelesen[n.id].length === 0 ? (
                            <p className="text-xs text-green-600">Alle haben gelesen.</p>
                          ) : (
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              {ungelesen[n.id].map(k => (
                                <li key={k.id}>{k.name} · {k.email}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

```

### app/admin/page.tsx

```tsx
import Link from "next/link";

const kacheln = [
  { href: "/admin/bilder", titel: "Bildverwaltung", beschreibung: "Bilder freigeben, Preise bestätigen", icon: "🖼️" },
  { href: "/admin/bilder/aufsteller", titel: "Bildaufsteller", beschreibung: "Druckfertige Aufsteller für alle Bilder", icon: "🏷️" },
  { href: "/admin/import", titel: "CSV / Excel Import", beschreibung: "Galerie-Bilder importieren", icon: "📥" },
  { href: "/admin/kasse", titel: "Vor-Ort-Kasse", beschreibung: "Käufe erfassen & Zahlungen verwalten", icon: "🧾" },
  { href: "/admin/kaufuebersicht", titel: "Kaufübersicht", beschreibung: "Alle Verkäufe & Zahlungsstatus", icon: "📋" },
  { href: "/admin/kaeufer", titel: "Käufer", beschreibung: "Käuferverwaltung & Kaufhistorie", icon: "👤" },
  { href: "/admin/archiv", titel: "Archivierung", beschreibung: "Nummernkreis exportieren & archivieren", icon: "🗄️" },
  { href: "/admin/merklisten", titel: "Besucher-Merklisten", beschreibung: "Favoriten & Interesse der Besucher", icon: "♡" },
  { href: "/admin/nachrichten", titel: "Kommunikation", beschreibung: "Newsletter & Infos an Künstler", icon: "✉" },
  { href: "/admin/kuenstler", titel: "Künstler anlegen", beschreibung: "Künstler registrieren & einladen", icon: "🎨" },
  { href: "/admin/export", titel: "DATEV-Export", beschreibung: "Buchungsstapel, Debitoren, Kreditoren", icon: "📊" },
  { href: "/admin/impressum", titel: "Impressum", beschreibung: "Impressum bearbeiten", icon: "📄" },
  { href: "/admin/datenschutz", titel: "Datenschutz", beschreibung: "Datenschutzerklärung bearbeiten", icon: "🔒" },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lions-blue mb-2">Admin-Dashboard</h1>
      <p className="text-gray-500 mb-8">Kunsttage auf der Ludwigshöhe 2026 · Verwaltung</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {kacheln.map((k) => (
          <Link key={k.href} href={k.href}>
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="text-3xl mb-3">{k.icon}</div>
              <h2 className="font-semibold text-gray-900">{k.titel}</h2>
              <p className="text-sm text-gray-500 mt-1">{k.beschreibung}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/admin/druckliste`}
          className="inline-block bg-lions-gold text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors"
        >
          Druckliste als CSV herunterladen
        </a>
      </div>

      <div className="mt-10 bg-white rounded-lg shadow p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tastaturkürzel</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {[
            { key: "Ctrl+A", ziel: "Admin-Dashboard" },
            { key: "Ctrl+B", ziel: "Bildverwaltung" },
            { key: "Ctrl+K", ziel: "Vor-Ort-Kasse" },
            { key: "Ctrl+U", ziel: "Kaufübersicht" },
          ].map(({ key, ziel }) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 font-mono text-xs text-gray-700 whitespace-nowrap">{key}</kbd>
              <span className="text-gray-600">{ziel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

```

### Frontend — App — Künstler-Bereich


### app/kuenstler/[id]/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getKuenstlerById, getBilder } from "@/lib/api";
import { Kuenstler, Bild } from "@/lib/types";
import BildCard from "@/components/BildCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function KuenstlerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [kuenstler, setKuenstler] = useState<Kuenstler | null>(null);
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    const kid = Number(id);
    getKuenstlerById(kid)
      .then((k) => {
        setKuenstler(k);
        return getBilder({ kuenstler_id: kid, nur_verfuegbar: false });
      })
      .then(setBilder)
      .catch(() => setFehler("Künstler nicht gefunden."));
  }, [id]);

  if (fehler) return <p className="text-red-600">{fehler}</p>;
  if (!kuenstler) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Kopfbereich */}
      <div className="flex gap-6 items-start">
        {kuenstler.portrait_foto ? (
          <img
            src={`${API}${kuenstler.portrait_foto}`}
            alt={`${kuenstler.db_vorname} ${kuenstler.db_name}`}
            className="w-28 h-28 rounded-full object-cover flex-shrink-0 shadow"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-lions-blue/10 flex items-center justify-center flex-shrink-0 shadow">
            <span className="text-lions-blue font-bold text-3xl">
              {kuenstler.db_vorname[0]}{kuenstler.db_name[0]}
            </span>
          </div>
        )}
        <div className="pt-1">
          <h1 className="text-3xl font-bold text-lions-blue">
            {kuenstler.db_vorname} {kuenstler.db_name}
          </h1>
          <div className="flex gap-4 mt-3">
            {kuenstler.db_instagram && (
              <a href={kuenstler.db_instagram} target="_blank" rel="noopener noreferrer"
                className="text-sm text-lions-blue hover:underline">
                Instagram
              </a>
            )}
            {kuenstler.db_webseite && (
              <a href={kuenstler.db_webseite} target="_blank" rel="noopener noreferrer"
                className="text-sm text-lions-blue hover:underline">
                Webseite
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Textabschnitte */}
      {(kuenstler.db_leben || kuenstler.db_kommentar || kuenstler.db_ausstellungen) && (
        <div className="grid md:grid-cols-2 gap-6">
          {kuenstler.db_leben && (
            <div className="bg-white rounded-lg shadow p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Biografie
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {kuenstler.db_leben}
              </p>
            </div>
          )}
          {kuenstler.db_kommentar && (
            <div className="bg-white rounded-lg shadow p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Künstlerische Aussage
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {kuenstler.db_kommentar}
              </p>
            </div>
          )}
          {kuenstler.db_ausstellungen && (
            <div className="bg-white rounded-lg shadow p-5 md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Ausstellungen & Auszeichnungen
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {kuenstler.db_ausstellungen}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Werke */}
      <div>
        <h2 className="text-xl font-bold text-lions-blue mb-4">
          Werke {bilder.length > 0 && <span className="text-gray-400 font-normal text-base">({bilder.length})</span>}
        </h2>
        {bilder.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Werke veröffentlicht.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bilder.map((b) => <BildCard key={b.id} bild={b} />)}
          </div>
        )}
      </div>

    </div>
  );
}

```

### app/kuenstler/aufsteller/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKuenstlerById, getKuenstlerBilder } from "@/lib/api";
import { Bild, Kuenstler } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function KuenstlerAufstellerPage() {
  const router = useRouter();
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [kuenstler, setKuenstler] = useState<Kuenstler | null>(null);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState("");
  const [vorschau, setVorschau] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("kuenstler_id");
    if (!id) { router.push("/kuenstler/login"); return; }
    const params = new URLSearchParams(window.location.search);
    const s = params.get("suche");
    if (s) setSuche(s);
    if (params.get("vorschau") === "1") setVorschau(true);

    Promise.all([
      getKuenstlerById(Number(id)),
      getKuenstlerBilder(Number(id)),
    ]).then(([k, b]) => {
      setKuenstler(k);
      // Künstler-Objekt in Bilder einbetten falls nicht vorhanden
      setBilder(b.map(bild => ({ ...bild, kuenstler: bild.kuenstler ?? k })));
    }).finally(() => setLaden(false));
  }, [router]);

  useEffect(() => {
    if (vorschau && !laden && bilder.length > 0) {
      const t = setTimeout(() => window.print(), 800);
      return () => clearTimeout(t);
    }
  }, [vorschau, laden, bilder]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "aufsteller-print";
    style.textContent = `
      @media print {
        header, footer, nav, .no-print { display: none !important; }
        body { margin: 0; }
        main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("aufsteller-print")?.remove();
  }, []);

  function abmessungen(b: Bild): string {
    const hatRahmen = b.breite_rahmen_cm && b.hoehe_rahmen_cm;
    const hatOhne = b.breite_cm && b.hoehe_cm;
    const unterschiedlich = hatRahmen && hatOhne &&
      (b.breite_rahmen_cm !== b.breite_cm || b.hoehe_rahmen_cm !== b.hoehe_cm);
    if (unterschiedlich)
      return `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm} cm (mit Rahmen) · ${b.breite_cm} × ${b.hoehe_cm} cm ohne Rahmen`;
    if (hatRahmen) return `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm} cm`;
    if (hatOhne) return `${b.breite_cm} × ${b.hoehe_cm} cm`;
    return "—";
  }

  const terme = suche.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const sichtbar = terme.length
    ? bilder.filter(b =>
        terme.some(t =>
          b.bild_nr.toLowerCase().includes(t) ||
          b.bildtitel.toLowerCase().includes(t)
        )
      )
    : bilder;

  if (laden) return <p className="p-8 text-gray-400">Laden…</p>;

  return (
    <div>
      {/* Toolbar */}
      <div className={`no-print flex items-center gap-4 px-6 py-3 bg-white border-b sticky top-0 z-10${vorschau ? " hidden" : ""}`}>
        <div className="flex-1">
          <h1 className="font-bold text-lions-blue">Bildaufsteller</h1>
          <p className="text-xs text-gray-400">
            {kuenstler && `${kuenstler.db_vorname} ${kuenstler.db_name} · `}
            {terme.length ? `${sichtbar.length} von ${bilder.length}` : bilder.length} Aufsteller
          </p>
        </div>
        <input
          type="search"
          placeholder="Bild-Nr. oder Titel…"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue w-56"
        />
        {terme.length > 0 && (
          <button onClick={() => setSuche("")} className="text-sm text-gray-400 hover:text-gray-700 px-2">
            Alle anzeigen
          </button>
        )}
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (suche.trim()) params.set("suche", suche.trim());
            params.set("vorschau", "1");
            window.open(`/kuenstler/aufsteller?${params.toString()}`, "_blank");
          }}
          className="px-4 py-2 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 whitespace-nowrap"
        >
          {terme.length ? `${sichtbar.length} drucken` : "Alle drucken"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border rounded-md"
        >
          ← Zurück
        </button>
      </div>

      {/* Aufsteller-Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2mm",
        padding: "0",
      }}>
        {sichtbar.map(b => (
          <Aufsteller key={b.id} bild={b} abmessungen={abmessungen(b)} />
        ))}
      </div>

      {bilder.length === 0 && (
        <p className="no-print text-center text-gray-400 py-16">Noch keine Bilder eingereicht.</p>
      )}
      {bilder.length > 0 && sichtbar.length === 0 && (
        <p className="no-print text-center text-gray-400 py-16">Keine Treffer für „{suche}"</p>
      )}
    </div>
  );
}

function Aufsteller({ bild: b, abmessungen }: { bild: Bild; abmessungen: string }) {
  const kuenstler = b.kuenstler
    ? `${b.kuenstler.db_vorname} ${b.kuenstler.db_name}`.trim()
    : "—";
  const beruf = b.kuenstler?.db_beruf ?? "";
  const leben = b.kuenstler?.db_leben ?? "";

  return (
    <div style={{
      width: "148mm",
      height: "105mm",
      boxSizing: "border-box",
      padding: "8mm 10mm",
      border: "0.4px solid #aaa",
      pageBreakInside: "avoid",
      breakInside: "avoid",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Georgia, 'Times New Roman', serif",
      backgroundColor: "#fff",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3mm" }}>
        <div style={{ fontSize: "7pt", color: "#888", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Kunsttage auf der Ludwigshöhe 2026
        </div>
        <div style={{ fontSize: "15pt", fontWeight: "bold", color: "#0f2d5e", fontFamily: "monospace" }}>
          {formatBildNr(b.bild_nr)}
        </div>
      </div>

      <div style={{ borderTop: "1.5px solid #0f2d5e", marginBottom: "4mm" }} />

      {/* Zweispaltiger Inhalt */}
      <div style={{ display: "flex", gap: "6mm", flex: 1, minHeight: 0 }}>

        {/* Linke Spalte: Text */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ fontSize: "15pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1.15, marginBottom: "3mm", flexShrink: 0 }}>
            {b.bildtitel}
          </div>
          <div style={{ fontSize: "10pt", color: "#333", marginBottom: "1mm" }}>
            {kuenstler}
            {(beruf || leben) && (
              <span style={{ fontSize: "8pt", color: "#888", marginLeft: "4px" }}>
                {[beruf, leben].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          <div style={{ fontSize: "8.5pt", color: "#555", lineHeight: 1.5 }}>
            {b.bildtechnik}
            {abmessungen !== "—" && (
              <span style={{ marginLeft: "8px", color: "#888" }}>· {abmessungen}</span>
            )}
          </div>

          {/* Anmerkung */}
          <div style={{ fontSize: "7.5pt", color: "#777", fontStyle: "italic", marginTop: "1.5mm", marginBottom: "auto" }}>
            {b.anmerkung_bild ?? ""}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "0.5px solid #eee", paddingTop: "3mm" }}>
            <div style={{ fontSize: "7.5pt", color: "#aaa" }}>{b.genre}</div>
            <div style={{ fontSize: "20pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1 }}>
              {b.verkaufspreis ? `${b.verkaufspreis.toLocaleString("de-DE")} €` : "auf Anfrage"}
            </div>
          </div>
        </div>

        {/* Rechte Spalte: Bild */}
        {b.bild_url_web && (
          <div style={{
            width: "42mm",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f8f8",
            borderRadius: "1mm",
            overflow: "hidden",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API}${b.bild_url_web}`}
              alt={b.bildtitel}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

```

### app/kuenstler/login/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyToken, loginLinkAnfordern } from "@/lib/api";
import { Suspense } from "react";

function LinkAnfordern() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"" | "laden" | "ok" | "fehler">("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("laden");
    try {
      await loginLinkAnfordern(email);
      setStatus("ok");
    } catch {
      setStatus("fehler");
    }
  }

  if (status === "ok")
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800 text-sm text-center">
        Falls Ihre E-Mail im System hinterlegt ist, erhalten Sie gleich einen neuen Link.
      </div>
    );

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <p className="text-sm text-gray-600 font-medium">Neuen Link anfordern</p>
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Ihre E-Mail-Adresse"
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
        autoFocus
      />
      {status === "fehler" && <p className="text-red-600 text-xs">Fehler beim Senden — bitte versuchen Sie es erneut.</p>}
      <button type="submit" disabled={status === "laden"}
        className="w-full bg-lions-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-900 disabled:opacity-50">
        {status === "laden" ? "Wird gesendet…" : "Login-Link zusenden"}
      </button>
    </form>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"pruefen" | "ok" | "kein_token" | "fehler">("pruefen");

  useEffect(() => {
    if (!token) { setStatus("kein_token"); return; }
    verifyToken(token)
      .then(({ kuenstler_id, name }) => {
        localStorage.setItem("kuenstler_id", String(kuenstler_id));
        localStorage.setItem("kuenstler_name", name);
        setStatus("ok");
        setTimeout(() => router.push("/kuenstler/portal"), 1500);
      })
      .catch(() => setStatus("fehler"));
  }, [token]);

  if (status === "pruefen")
    return <p className="text-gray-500 animate-pulse">Login wird geprüft…</p>;

  if (status === "ok")
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center text-green-800">
        Login erfolgreich. Sie werden weitergeleitet…
      </div>
    );

  if (status === "kein_token")
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-5 text-blue-800 space-y-1">
          <p className="font-semibold">Künstler-Portal</p>
          <p className="text-sm">Der Zugang erfolgt über Ihren persönlichen Einladungslink (48h gültig).</p>
          <p className="text-sm">Haben Sie bereits ein Konto? Fordern Sie hier einen neuen Link an:</p>
        </div>
        <LinkAnfordern />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-md p-5 text-red-800 space-y-1">
        <p className="font-semibold">Link abgelaufen.</p>
        <p className="text-sm">Einladungslinks sind 48 Stunden gültig. Fordern Sie hier einen neuen an:</p>
      </div>
      <LinkAnfordern />
    </div>
  );
}

export default function KuenstlerLoginPage() {
  return (
    <div className="max-w-md mx-auto pt-16">
      <h1 className="text-2xl font-bold text-lions-blue mb-8 text-center">Künstler-Portal</h1>
      <Suspense fallback={<p className="text-gray-400 animate-pulse">Laden…</p>}>
        <LoginInner />
      </Suspense>
    </div>
  );
}

```

### app/kuenstler/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getKuenstler } from "@/lib/api";
import { Kuenstler } from "@/lib/types";

export default function KuenstlerListePage() {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    getKuenstler()
      .then((data) => {
        const sichtbar = data
          .sort((a, b) => a.db_name.localeCompare(b.db_name, "de"));
        setKuenstler(sichtbar);
      })
      .finally(() => setLaden(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-lions-blue">Künstlerinnen & Künstler</h1>
        <Link
          href="/kuenstler/portal"
          className="text-sm text-lions-blue border border-lions-blue rounded-md px-4 py-2 hover:bg-lions-blue hover:text-white transition-colors"
        >
          Künstler-Login
        </Link>
      </div>
      {laden ? (
        <p className="text-gray-400 animate-pulse">Laden…</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {kuenstler.map((k) => (
            <Link key={k.id} href={`/kuenstler/${k.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 flex gap-4 items-start">
                {k.portrait_foto ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${k.portrait_foto}`}
                    alt={k.db_name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-lions-blue/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lions-blue font-bold text-xl">
                      {k.db_vorname[0]}{k.db_name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{k.db_vorname} {k.db_name}</p>
                  {k.db_leben && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{k.db_leben}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

```

### app/kuenstler/portal/page.tsx

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKuenstlerById, getKuenstler, updateProfil, dsgvoEinwilligung, getKuenstlerBilder, kuenstlerBildEinreichen, kuenstlerBildLoeschen, kuenstlerBildFotoHochladen, getKuenstlerNachrichten, nachrichtAlsGelesen } from "@/lib/api";
import { Kuenstler, Bild, Genre } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL;

type FormData = {
  db_beruf: string;
  db_kommentar: string;
  db_ausstellungen: string;
  db_leben: string;
  db_adresse: string;
  db_email: string;
  db_instagram: string;
  db_webseite: string;
};

// ---------------------------------------------------------------------------
// A4-Vorschau-Komponente
// ---------------------------------------------------------------------------
function VitaVorschau({ kuenstler, form }: { kuenstler: Kuenstler; form: FormData }) {
  const ausstellungszeilen = form.db_ausstellungen
    ? form.db_ausstellungen.split("\n").filter(Boolean)
    : [];

  return (
    <div
      id="vita-preview"
      style={{
        background: "white",
        padding: "18mm 16mm 14mm",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "10.5pt",
        lineHeight: "1.45",
        color: "#1a1a1a",
        minHeight: "257mm",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7mm" }}>
        <div>
          <div style={{ fontSize: "22pt", fontWeight: "bold", color: "#0f2d5e", lineHeight: 1.1 }}>
            {kuenstler.db_vorname} {kuenstler.db_name}
          </div>
          {form.db_beruf && (
            <div style={{ fontSize: "11pt", color: "#555", marginTop: "2mm", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {form.db_beruf}
            </div>
          )}
        </div>
        {kuenstler.portrait_foto && (
          <img
            src={`${API}${kuenstler.portrait_foto}`}
            alt="Portrait"
            style={{ width: "26mm", height: "26mm", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        )}
      </div>

      <div style={{ borderTop: "2.5px solid #0f2d5e", marginBottom: "6mm" }} />

      {/* Inspiration | Ausstellungen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8mm", marginBottom: "5mm" }}>
        <div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginBottom: "3mm" }}>
            Inspiration
          </div>
          <div style={{ fontSize: "10pt", whiteSpace: "pre-wrap", color: form.db_kommentar ? "#222" : "#ccc" }}>
            {form.db_kommentar || "Noch keine künstlerische Aussage eingetragen."}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginBottom: "3mm" }}>
            Ausstellungen & Auszeichnungen
          </div>
          {ausstellungszeilen.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {ausstellungszeilen.map((z, i) => (
                <li key={i} style={{ fontSize: "10pt", marginBottom: "1.5mm", paddingLeft: "3mm" }}>
                  {z.startsWith("•") ? z : `• ${z}`}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: "10pt", color: "#ccc" }}>Noch keine Ausstellungen eingetragen.</div>
          )}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #ddd", marginBottom: "5mm" }} />

      {/* Leben | Kontakt */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8mm" }}>
        <div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginBottom: "3mm" }}>
            Leben / Ausbildung
          </div>
          <div style={{ fontSize: "10pt", whiteSpace: "pre-wrap", color: form.db_leben ? "#222" : "#ccc" }}>
            {form.db_leben || "Noch keine Angaben eingetragen."}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginBottom: "3mm" }}>
            Kontakt
          </div>
          <div style={{ fontSize: "10pt", lineHeight: "1.7", color: "#222" }}>
            {form.db_adresse && <div style={{ whiteSpace: "pre-wrap" }}>{form.db_adresse}</div>}
            {form.db_email && <div>{form.db_email}</div>}
            {form.db_webseite && <div>{form.db_webseite}</div>}
            {form.db_instagram && <div>{form.db_instagram}</div>}
            {!form.db_adresse && !form.db_email && !form.db_webseite && (
              <div style={{ color: "#ccc" }}>Noch keine Kontaktdaten eingetragen.</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", paddingTop: "8mm", borderTop: "1px solid #eee", textAlign: "center", fontSize: "8pt", color: "#aaa" }}>
        Kunsttage auf der Ludwigshöhe · Eine Benefizveranstaltung der Lions Clubs der Südpfalz
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hauptseite
// ---------------------------------------------------------------------------
export default function KuenstlerPortalPage() {
  const router = useRouter();
  const [kuenstler, setKuenstler] = useState<Kuenstler | null>(null);
  const [form, setForm] = useState<FormData>({
    db_beruf: "", db_kommentar: "", db_ausstellungen: "",
    db_leben: "", db_adresse: "", db_email: "",
    db_instagram: "", db_webseite: "",
  });
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [gespeichert, setGespeichert] = useState(false);
  const [fehler, setFehler] = useState("");
  const [tab, setTab] = useState<"formular" | "vorschau">("formular");

  // Nachrichten-State
  type Nachricht = { id: number; betreff: string; text: string; erstellt_am: string; gelesen: boolean };
  const [nachrichten, setNachrichten] = useState<Nachricht[]>([]);
  const [offeneNachricht, setOffeneNachricht] = useState<number | null>(null);

  // Bilder-State
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [alleKuenstler, setAlleKuenstler] = useState<Kuenstler[]>([]);
  const [showBildForm, setShowBildForm] = useState(false);
  const [bildForm, setBildForm] = useState({ bildtitel: "", bildtechnik: "", genre: "Landschaft" as Genre, breite_rahmen_cm: "", hoehe_rahmen_cm: "", einlieferungspreis: "", anmerkung_bild: "", abrechnungsempf: "Künstler", galerist_id: "" });
  const [bildFehler, setBildFehler] = useState("");
  const [bildLaden, setBildLaden] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("kuenstler_id");
    if (!id) { router.push("/kuenstler/login"); return; }
    getKuenstlerBilder(Number(id)).then(setBilder).catch(() => {});
    getKuenstlerNachrichten(Number(id)).then(setNachrichten).catch(() => {});
    getKuenstler().then(setAlleKuenstler).catch(() => {});
    getKuenstlerById(Number(id)).then((k) => {
      setKuenstler(k);
      setForm({
        db_beruf:         k.db_beruf         ?? "",
        db_kommentar:     k.db_kommentar     ?? "",
        db_ausstellungen: k.db_ausstellungen ?? "",
        db_leben:         k.db_leben         ?? "",
        db_adresse:       k.db_adresse       ?? "",
        db_email:         k.db_email         ?? "",
        db_instagram:     k.db_instagram     ?? "",
        db_webseite:      k.db_webseite      ?? "",
      });
    });
  }, []);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSpeichern(e: React.FormEvent) {
    e.preventDefault();
    if (!kuenstler) return;
    setFehler("");
    try {
      await updateProfil(kuenstler.id, form);
      if (portraitFile) {
        const fd = new FormData();
        fd.append("file", portraitFile);
        const res = await fetch(`${API}/kuenstler/${kuenstler.id}/portrait`, { method: "POST", body: fd });
        const data = await res.json();
        setKuenstler(k => k ? { ...k, portrait_foto: data.portrait_foto } : k);
      }
      setGespeichert(true);
      setTimeout(() => setGespeichert(false), 3000);
    } catch (err: any) {
      setFehler(err.message);
    }
  }

  async function handleBildEinreichen(e: React.FormEvent) {
    e.preventDefault();
    if (!kuenstler) return;
    setBildFehler(""); setBildLaden(true);
    try {
      const neuesBild = await kuenstlerBildEinreichen(kuenstler.id, {
        bildtitel: bildForm.bildtitel,
        bildtechnik: bildForm.bildtechnik,
        genre: bildForm.genre,
        breite_rahmen_cm: Number(bildForm.breite_rahmen_cm) || 0,
        hoehe_rahmen_cm: Number(bildForm.hoehe_rahmen_cm) || 0,
        einlieferungspreis: bildForm.einlieferungspreis ? Number(bildForm.einlieferungspreis) : undefined,
        anmerkung_bild: bildForm.anmerkung_bild || undefined,
        abrechnungsempf: bildForm.abrechnungsempf,
        galerist_id: bildForm.abrechnungsempf === "Galerist" && bildForm.galerist_id ? Number(bildForm.galerist_id) : undefined,
      });
      setBilder(prev => [...prev, neuesBild]);
      setBildForm({ bildtitel: "", bildtechnik: "", genre: "Landschaft", breite_rahmen_cm: "", hoehe_rahmen_cm: "", einlieferungspreis: "", anmerkung_bild: "", abrechnungsempf: "Künstler", galerist_id: "" });
      setShowBildForm(false);
    } catch (err: any) { setBildFehler(err.message); }
    finally { setBildLaden(false); }
  }

  async function handleBildFoto(bild: Bild, file: File) {
    if (!kuenstler) return;
    try {
      const { bild_url_web } = await kuenstlerBildFotoHochladen(kuenstler.id, bild.id, file);
      setBilder(prev => prev.map(b => b.id === bild.id ? { ...b, bild_url_web } : b));
    } catch {}
  }

  async function handleBildLoeschen(bildId: number) {
    if (!kuenstler) return;
    try {
      await kuenstlerBildLoeschen(kuenstler.id, bildId);
      setBilder(prev => prev.filter(b => b.id !== bildId));
    } catch {}
  }

  async function handleDsgvo() {
    if (!kuenstler) return;
    await dsgvoEinwilligung(kuenstler.id);
    alert("Einwilligung erteilt. Vielen Dank.");
  }

  function handleDrucken() {
    window.print();
  }

  if (!kuenstler) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <>
      {/* Print-Styles: nur #vita-preview drucken */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #__next > * { display: none !important; }
          #vita-print-wrapper { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          #vita-print-wrapper #vita-preview { box-shadow: none !important; }
          header, footer, nav { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Seitenkopf */}
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-md px-4 py-2.5 flex items-center justify-between gap-4 print:hidden">
          <p className="text-xs text-blue-700">
            💡 Speichern Sie diese Seite als <strong>Lesezeichen</strong> — so können Sie jederzeit ohne neuen Link zurückkehren.
          </p>
          <button onClick={() => window.location.href = "/kuenstler/login"}
            className="text-xs text-blue-500 hover:underline whitespace-nowrap flex-shrink-0">
            Abmelden
          </button>
        </div>

        {/* Nachrichten */}
        {nachrichten.length > 0 && (() => {
          const ungelesen = nachrichten.filter(n => !n.gelesen);
          return (
            <div className={`mb-6 rounded-lg border ${ungelesen.length > 0 ? "border-lions-blue/40 bg-blue-50" : "border-gray-200 bg-white"} overflow-hidden`}>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">Mitteilungen</span>
                  {ungelesen.length > 0 && (
                    <span className="bg-lions-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {ungelesen.length} neu
                    </span>
                  )}
                </div>
              </div>
              <div className="divide-y">
                {nachrichten.map(n => (
                  <div key={n.id}>
                    <button
                      onClick={async () => {
                        const id = Number(localStorage.getItem("kuenstler_id"));
                        if (!n.gelesen) {
                          await nachrichtAlsGelesen(id, n.id).catch(() => {});
                          setNachrichten(prev => prev.map(x => x.id === n.id ? { ...x, gelesen: true } : x));
                        }
                        setOffeneNachricht(prev => prev === n.id ? null : n.id);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {!n.gelesen && <span className="w-2 h-2 rounded-full bg-lions-blue flex-shrink-0" />}
                        <span className={`text-sm truncate ${!n.gelesen ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                          {n.betreff}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-3">
                        {new Date(n.erstellt_am).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        {" "}{offeneNachricht === n.id ? "▲" : "▼"}
                      </span>
                    </button>
                    {offeneNachricht === n.id && (
                      <div className="px-4 pb-3 pt-1 bg-white/80 text-sm text-gray-700 whitespace-pre-wrap border-t">
                        {n.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-lions-blue">Ihr Künstler-Portal</h1>
            <p className="text-gray-500">{kuenstler.db_vorname} {kuenstler.db_name}</p>
          </div>
          <button onClick={handleDrucken}
            className="flex items-center gap-2 px-4 py-2 border border-lions-blue text-lions-blue rounded-md text-sm hover:bg-lions-blue hover:text-white transition-colors">
            ⎙ Vita drucken / als PDF
          </button>
        </div>

        {/* Mobile Tab-Umschalter */}
        <div className="flex gap-2 mb-4 lg:hidden">
          {(["formular", "vorschau"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t ? "bg-lions-blue text-white" : "bg-white border text-gray-600"
              }`}>
              {t === "formular" ? "Formular" : "Vorschau"}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          {/* ---- Formular ---- */}
          <div className={`flex-1 min-w-0 ${tab === "vorschau" ? "hidden lg:block" : ""}`}>
            <form onSubmit={handleSpeichern} className="space-y-5">

              {/* Portrait */}
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="font-semibold text-gray-700 border-b pb-2 mb-4">Portrait-Foto</h2>
                <div className="flex items-center gap-4">
                  {kuenstler.portrait_foto ? (
                    <img src={`${API}${kuenstler.portrait_foto}`} alt="Portrait"
                      className="w-20 h-20 rounded-full object-cover shadow" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-lions-blue/10 flex items-center justify-center text-lions-blue font-bold text-2xl">
                      {kuenstler.db_vorname[0]}{kuenstler.db_name[0]}
                    </div>
                  )}
                  <input type="file" accept="image/*"
                    onChange={e => setPortraitFile(e.target.files?.[0] ?? null)}
                    className="text-sm text-gray-600" />
                </div>
              </div>

              {/* Vita-Felder */}
              <div className="bg-white rounded-lg shadow p-5 space-y-4">
                <h2 className="font-semibold text-gray-700 border-b pb-2">Vita</h2>

                <Field label="Berufsbezeichnung / Technik"
                  hint="z.B. »Malerin«, »Maler und Grafiker«, »BetonGestalten«">
                  <input value={form.db_beruf} onChange={set("db_beruf")}
                    placeholder="Malerin"
                    className="input" />
                </Field>

                <Field label="Inspiration / Künstlerische Aussage"
                  hint="Kurzer persönlicher Text — erscheint links auf der Vita">
                  <textarea rows={5} value={form.db_kommentar} onChange={set("db_kommentar")}
                    placeholder="Was inspiriert Sie? Was möchten Sie mit Ihrer Kunst ausdrücken?"
                    className="input" />
                </Field>

                <Field label="Ausstellungen & Auszeichnungen"
                  hint="Eine Ausstellung pro Zeile — wird als Aufzählung dargestellt">
                  <textarea rows={6} value={form.db_ausstellungen} onChange={set("db_ausstellungen")}
                    placeholder={"2023 Kunsttage auf der Ludwigshöhe\n2022 Galerie Musterstadt\n2020 Gruppenausstellung Neustadt"}
                    className="input" />
                </Field>

                <Field label="Leben / Ausbildung"
                  hint="Geburtsort, Ausbildung, künstlerischer Werdegang">
                  <textarea rows={5} value={form.db_leben} onChange={set("db_leben")}
                    placeholder={"geboren 1970 in Landau\nAusbildung …\nSeit 2010 als freie Künstlerin tätig"}
                    className="input" />
                </Field>
              </div>

              {/* Kontakt */}
              <div className="bg-white rounded-lg shadow p-5 space-y-4">
                <h2 className="font-semibold text-gray-700 border-b pb-2">Kontakt</h2>

                <Field label="Adresse" hint="Erscheint auf der Vita — nur wenn gewünscht">
                  <textarea rows={2} value={form.db_adresse} onChange={set("db_adresse")}
                    placeholder={"Musterstraße 1, 76829 Landau"} className="input" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="E-Mail">
                    <input type="email" value={form.db_email} onChange={set("db_email")}
                      placeholder="ihre@email.de" className="input" />
                  </Field>
                  <Field label="Webseite">
                    <input value={form.db_webseite} onChange={set("db_webseite")}
                      placeholder="https://…" className="input" />
                  </Field>
                  <Field label="Instagram">
                    <input value={form.db_instagram} onChange={set("db_instagram")}
                      placeholder="https://instagram.com/…" className="input" />
                  </Field>
                </div>
              </div>

              {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
              {gespeichert && <p className="text-green-600 text-sm font-medium">✓ Gespeichert</p>}

              <button type="submit"
                className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 transition-colors">
                Vita speichern
              </button>

              {/* DSGVO */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-semibold text-yellow-800 mb-1 text-sm">Einwilligung zur Veröffentlichung</h3>
                <p className="text-xs text-yellow-700 mb-1">
                  Ich willige ein, dass mein Name, mein Portrait-Foto, meine Vita und die Abbildungen meiner Werke für die
                  Kunsttage auf der Ludwigshöhe 2026 veröffentlicht werden (Webseite, Katalog, Druckmaterialien).
                </p>
                <p className="text-xs text-yellow-600 mb-3">
                  Die Einwilligung kann jederzeit widerrufen werden.{" "}
                  <a href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</a>
                </p>
                <button type="button" onClick={handleDsgvo}
                  className="bg-yellow-600 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-700 transition-colors">
                  Einwilligung erteilen
                </button>
              </div>
            </form>
          </div>

          {/* ---- A4-Vorschau ---- */}
          <div id="vita-print-wrapper"
            className={`w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 ${tab === "formular" ? "hidden lg:block" : ""}`}>
            <div className="sticky top-6">
              <p className="text-xs text-gray-400 text-center mb-2">
                Vorschau · aktualisiert live beim Tippen
              </p>
              <div className="shadow-xl rounded overflow-hidden border border-gray-200">
                {kuenstler && <VitaVorschau kuenstler={kuenstler} form={form} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Bilder-Sektion ---- */}
      <div className="max-w-7xl mx-auto mt-10 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-lions-blue">Meine Bilder</h2>
            <p className="text-sm text-gray-500">{bilder.length} {bilder.length === 1 ? "Werk" : "Werke"} eingereicht</p>
          </div>
          <div className="flex items-center gap-2">
            {bilder.length > 0 && (
              <button
                onClick={() => window.open("/kuenstler/aufsteller", "_blank")}
                className="px-4 py-2 border border-lions-blue text-lions-blue text-sm font-medium rounded-md hover:bg-lions-blue hover:text-white transition-colors whitespace-nowrap">
                ⎙ Aufsteller drucken
              </button>
            )}
            <button onClick={() => setShowBildForm(v => !v)}
              className="px-4 py-2 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 transition-colors">
              {showBildForm ? "Abbrechen" : "+ Bild einreichen"}
            </button>
          </div>
        </div>

        {/* Neues-Bild-Formular */}
        {showBildForm && (
          <form onSubmit={handleBildEinreichen}
            className="bg-white rounded-lg shadow p-5 mb-6 space-y-4 border-l-4 border-lions-blue">
            <h3 className="font-semibold text-gray-700">Neues Bild einreichen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bildtitel *</label>
                <input required value={bildForm.bildtitel} onChange={e => setBildForm(f => ({...f, bildtitel: e.target.value}))}
                  placeholder="Titel des Werks" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technik *</label>
                <input required value={bildForm.bildtechnik} onChange={e => setBildForm(f => ({...f, bildtechnik: e.target.value}))}
                  placeholder="z.B. Öl auf Leinwand" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
                <select required value={bildForm.genre} onChange={e => setBildForm(f => ({...f, genre: e.target.value as Genre}))}
                  className="input">
                  {(["Abstrakt","Akt","Landschaft","Menschen","Pfalz","Portrait","Städte","Stilleben","Sonstiges"] as Genre[]).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breite mit Rahmen (cm)</label>
                <input type="number" min="0" value={bildForm.breite_rahmen_cm} onChange={e => setBildForm(f => ({...f, breite_rahmen_cm: e.target.value}))}
                  placeholder="70" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Höhe mit Rahmen (cm)</label>
                <input type="number" min="0" value={bildForm.hoehe_rahmen_cm} onChange={e => setBildForm(f => ({...f, hoehe_rahmen_cm: e.target.value}))}
                  placeholder="50" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Einlieferungspreis (€)</label>
                <input type="number" min="0" value={bildForm.einlieferungspreis} onChange={e => setBildForm(f => ({...f, einlieferungspreis: e.target.value}))}
                  placeholder="500" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anmerkung</label>
                <input value={bildForm.anmerkung_bild} onChange={e => setBildForm(f => ({...f, anmerkung_bild: e.target.value}))}
                  placeholder="Optionale Anmerkung" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abrechnung über</label>
                <select value={bildForm.abrechnungsempf} onChange={e => setBildForm(f => ({...f, abrechnungsempf: e.target.value, galerist_id: ""}))} className="input">
                  <option value="Künstler">Künstler</option>
                  <option value="Galerist">Galerist / Sammler</option>
                </select>
              </div>
              {bildForm.abrechnungsempf === "Galerist" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Galerist / Sammler auswählen</label>
                  <select required value={bildForm.galerist_id} onChange={e => setBildForm(f => ({...f, galerist_id: e.target.value}))} className="input">
                    <option value="">— bitte wählen —</option>
                    {alleKuenstler.sort((a, b) => a.db_name.localeCompare(b.db_name)).map(k => (
                      <option key={k.id} value={k.id}>{k.db_name}, {k.db_vorname}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {bildFehler && <p className="text-red-600 text-sm">{bildFehler}</p>}
            <button type="submit" disabled={bildLaden}
              className="bg-lions-blue text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-900 disabled:opacity-50">
              {bildLaden ? "Wird eingereicht…" : "Bild einreichen"}
            </button>
            <p className="text-xs text-gray-400">Das Foto können Sie nach dem Einreichen hochladen. Das Bild wird erst nach Freigabe durch die Veranstaltungsleitung sichtbar.</p>
          </form>
        )}

        {/* Bilder-Liste */}
        {bilder.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Noch keine Bilder eingereicht.</p>
        ) : (
          <div className="space-y-3">
            {bilder.map(b => (
              <div key={b.id} className="bg-white rounded-lg shadow-sm border p-4 flex gap-4 items-start">
                {/* Thumbnail / Foto-Upload */}
                <label className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100 cursor-pointer relative group">
                  {b.bild_url_web
                    ? <img src={`${API}${b.bild_url_web}`} alt={b.bildtitel} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 text-xs text-center p-1">
                        <span className="text-2xl">+</span>Foto
                      </div>
                  }
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                    {b.bild_url_web ? "Ersetzen" : "Hochladen"}
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleBildFoto(b, e.target.files[0])} />
                </label>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{b.bildtitel}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{b.bildtechnik} · {b.genre} · {b.breite_rahmen_cm > 0 ? `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm} cm` : "Maße fehlen"}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">Nr. {formatBildNr(b.bild_nr)}</p>
                      {b.einlieferungspreis && (
                        <p className="text-xs text-gray-500">Einlieferungspreis: {b.einlieferungspreis} € → Vorschlag: {b.verkaufspreis_vorschlag?.toFixed(0)} €</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.freigegeben ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {b.freigegeben ? "✓ Freigegeben" : "Ausstehend"}
                      </span>
                      <button
                        onClick={() => window.open(`/kuenstler/aufsteller?suche=${encodeURIComponent(b.bild_nr)}&vorschau=1`, "_blank")}
                        className="text-xs px-2 py-1 rounded border text-gray-500 hover:text-lions-blue hover:border-lions-blue transition-colors"
                        title="Aufsteller drucken">
                        ⎙
                      </button>
                      {!b.freigegeben && (
                        <button onClick={() => handleBildLoeschen(b.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                          title="Zurückziehen">×</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Globale Input-Styles */}
      <style>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.875rem;
          outline: none;
          resize: vertical;
        }
        .input:focus { border-color: #0f2d5e; box-shadow: 0 0 0 2px rgba(15,45,94,0.15); }
      `}</style>
    </>
  );
}

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

```

### Frontend — Komponenten


### components/AnmeldeModal.tsx

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useMerkliste } from "@/lib/MerklisteContext";

export default function AnmeldeModal() {
  const { showModal, closeModal, anmelden } = useMerkliste();
  const [mode, setMode] = useState<"email" | "telefon">("email");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  if (!showModal) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");
    try {
      await anmelden(
        mode === "email" ? email : undefined,
        mode === "telefon" ? telefon : undefined,
      );
    } catch (err: any) {
      setFehler(err.message || "Fehler beim Anmelden");
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={closeModal}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Merkliste</h2>
            <p className="text-sm text-gray-500 mt-1">
              Speichern Sie Ihre Favoriten und drucken Sie die Liste für die Ausstellung aus.
            </p>
          </div>
          <button onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 ml-4 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["email", "telefon"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
                mode === m
                  ? "bg-lions-blue text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {m === "email" ? "E-Mail" : "Telefon"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "email" ? (
            <input type="email" required placeholder="ihre@email.de"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
              autoFocus />
          ) : (
            <input type="tel" required placeholder="0611 12345"
              value={telefon} onChange={e => setTelefon(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
              autoFocus />
          )}
          {fehler && <p className="text-red-600 text-xs">{fehler}</p>}
          <button type="submit" disabled={laden}
            className="w-full bg-lions-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-900 transition-colors disabled:opacity-50">
            {laden ? "Wird gespeichert…" : "Merkliste starten / anmelden"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Mit der gleichen E-Mail oder Telefonnummer können Sie Ihre Liste jederzeit wiederherstellen.
        </p>
        <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed">
          Mit der Anmeldung stimmen Sie zu, dass wir Ihre Kontaktdaten für die Merkliste und Benachrichtigungen speichern.{" "}
          <Link href="/datenschutz" target="_blank" className="underline hover:text-gray-600">
            Datenschutzerklärung
          </Link>
        </p>
      </div>
    </div>
  );
}

```

### components/BildCard.tsx

```tsx
"use client";
import Link from "next/link";
import { Bild } from "@/lib/types";
import MerklistenButton from "./MerklistenButton";
import { bildAlt } from "@/lib/utils";

const statusColors: Record<string, string> = {
  "Verfügbar": "bg-green-100 text-green-800",
  "Reserviert": "bg-yellow-100 text-yellow-800",
  "Verkauft": "bg-red-100 text-red-800",
};

export default function BildCard({ bild }: { bild: Bild }) {
  const imgSrc = bild.bild_url_web
    ? `${process.env.NEXT_PUBLIC_API_URL}${bild.bild_url_web}`
    : "/placeholder.jpg";

  return (
    <Link href={`/bilder/${bild.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden group relative">
        <div className="relative aspect-[4/3] bg-gray-100">
          <img
            src={imgSrc}
            alt={bildAlt(bild)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
          />
          <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${statusColors[bild.verfuegbarkeit]}`}>
            {bild.verfuegbarkeit}
          </span>
          {bild.in_ausstellung === false && (
            <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
              Online-Katalog
            </span>
          )}
        </div>
        <div className="p-4 pb-3">
          <p className="font-semibold text-gray-900 truncate">{bild.bildtitel}</p>
          {bild.kuenstler && (
            <p className="text-sm text-gray-500 mt-0.5">
              {bild.kuenstler.db_vorname} {bild.kuenstler.db_name}
            </p>
          )}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{bild.bildtechnik}</span>
            {bild.verkaufspreis && (
              <span className="font-bold text-lions-blue">{bild.verkaufspreis.toFixed(0)} €</span>
            )}
          </div>
          {(() => {
            const b = bild.breite_rahmen_cm > 0 ? bild.breite_rahmen_cm : bild.breite_cm;
            const h = bild.hoehe_rahmen_cm > 0 ? bild.hoehe_rahmen_cm : bild.hoehe_cm;
            return ((b ?? 0) > 0 || (h ?? 0) > 0) ? (
              <p className="text-xs text-gray-400 mt-1">{b} × {h} cm</p>
            ) : null;
          })()}
        </div>
        <div className="absolute bottom-3 right-3" onClick={e => e.stopPropagation()}>
          <MerklistenButton bildId={bild.id} />
        </div>
      </div>
    </Link>
  );
}

```

### components/FilterBar.tsx

```tsx
"use client";
import { Genre } from "@/lib/types";

const GENRES: Genre[] = [
  "Abstrakt", "Akt", "Landschaft", "Menschen",
  "Pfalz", "Portrait", "Städte", "Stilleben", "Sonstiges",
];

interface Props {
  genre: string;
  technik: string;
  onGenre: (v: string) => void;
  onTechnik: (v: string) => void;
  kuenstlerId: string;
  onKuenstler: (v: string) => void;
  kuenstlerOptionen: { id: number; name: string }[];
  sortierung: string;
  onSortierung: (v: string) => void;
}

export default function FilterBar({ genre, technik, onGenre, onTechnik, kuenstlerId, onKuenstler, kuenstlerOptionen, sortierung, onSortierung }: Props) {
  const sel = "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue";
  return (
    <div className="flex flex-wrap gap-3 items-center py-4">
      <select value={kuenstlerId} onChange={(e) => onKuenstler(e.target.value)} className={sel}>
        <option value="">Alle Künstler</option>
        {kuenstlerOptionen.map(({ id, name }) => (
          <option key={id} value={String(id)}>{name}</option>
        ))}
      </select>

      <select value={genre} onChange={(e) => onGenre(e.target.value)} className={sel}>
        <option value="">Alle Genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Technik suchen…"
        value={technik}
        onChange={(e) => onTechnik(e.target.value)}
        className={sel}
      />

      <select value={sortierung} onChange={(e) => onSortierung(e.target.value)} className={sel}>
        <option value="">Sortierung: Standard</option>
        <option value="zufall">Zufällig</option>
        <option value="preis_asc">Preis aufsteigend</option>
        <option value="preis_desc">Preis absteigend</option>
      </select>

      {(genre || technik || kuenstlerId || sortierung) && (
        <button
          onClick={() => { onGenre(""); onTechnik(""); onKuenstler(""); onSortierung(""); }}
          className="text-sm text-lions-blue underline"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}

```

### components/Header.tsx

```tsx
import Link from "next/link";
import MerklisteNavLink from "./MerklisteNavLink";

export default function Header() {
  return (
    <header className="bg-lions-blue text-white print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3" aria-label="Kunsttage auf der Ludwigshöhe">
          <span className="kunsttage-header">Kunsttage</span>
          <span className="text-white text-base tracking-widest uppercase font-bold">
            auf der Ludwigshöhe
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/veranstaltung" className="hover:text-lions-gold transition-colors">Veranstaltung</Link>
          <Link href="/" className="hover:text-lions-gold transition-colors">Galerie</Link>
          <Link href="/kuenstler" className="hover:text-lions-gold transition-colors">Künstler</Link>
          <MerklisteNavLink />
          <Link
            href="/admin"
            className="opacity-30 hover:opacity-70 transition-opacity text-xs border border-white/30 rounded px-2 py-1"
            title="Verwaltung"
          >
            ⚙
          </Link>
        </nav>
      </div>
    </header>
  );
}

```

### components/KeyboardShortcuts.tsx

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const editable = document.activeElement?.getAttribute("contenteditable");
      if (tag === "input" || tag === "textarea" || tag === "select" || editable === "true") return;

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        router.push("/admin");
      }
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        router.push("/admin/kasse");
      }
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        router.push("/admin/bilder");
      }
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        router.push("/admin/kaufuebersicht");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}

```

### components/MerklisteNavLink.tsx

```tsx
"use client";
import Link from "next/link";
import { useMerkliste } from "@/lib/MerklisteContext";

export default function MerklisteNavLink() {
  const { ids } = useMerkliste();
  return (
    <Link href="/merkliste"
      className="hover:text-lions-gold transition-colors flex items-center gap-1.5">
      Merkliste
      {ids.size > 0 && (
        <span className="bg-lions-gold text-lions-blue text-xs font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[1.2rem] text-center">
          {ids.size}
        </span>
      )}
    </Link>
  );
}

```

### components/MerklistenButton.tsx

```tsx
"use client";
import { useMerkliste } from "@/lib/MerklisteContext";

interface Props {
  bildId: number;
  size?: "sm" | "md";
  className?: string;
}

export default function MerklistenButton({ bildId, size = "sm", className = "" }: Props) {
  const { isInList, toggle } = useMerkliste();
  const inList = isInList(bildId);
  const sz = size === "md" ? "w-6 h-6" : "w-5 h-5";

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggle(bildId);
      }}
      title={inList ? "Von Merkliste entfernen" : "Zur Merkliste hinzufügen"}
      className={`transition-colors ${className}`}
    >
      {inList ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          className={`${sz} text-red-500`}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className={`${sz} text-gray-400 hover:text-red-400`}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
    </button>
  );
}

```

### Frontend — Lib


### lib/api.ts

```ts
import { Bild, Kuenstler, ReservierungCreate, KaufCreate } from "./types";
import { authHeaders } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers as Record<string, string> ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Galerie ---
export const getBilder = (params?: {
  genre?: string;
  technik?: string;
  kuenstler_id?: number;
  nur_verfuegbar?: boolean;
}) => {
  const q = new URLSearchParams();
  if (params?.genre) q.set("genre", params.genre);
  if (params?.technik) q.set("technik", params.technik);
  if (params?.kuenstler_id) q.set("kuenstler_id", String(params.kuenstler_id));
  if (params?.nur_verfuegbar !== undefined) q.set("nur_verfuegbar", String(params.nur_verfuegbar));
  return req<Bild[]>(`/bilder/?${q}`);
};

export const getBild = (id: number) => req<Bild>(`/bilder/${id}`);

// --- Künstler ---
export const getKuenstler = () => req<Kuenstler[]>("/kuenstler/");
export const getKuenstlerById = (id: number) => req<Kuenstler>(`/kuenstler/${id}`);
export const verifyToken = (token: string) =>
  req<{ kuenstler_id: number; name: string }>(`/kuenstler/login/verify?token=${token}`);

export const loginLinkAnfordern = (email: string) =>
  req<{ status: string }>("/kuenstler/login-link-anfordern", {
    method: "POST", body: JSON.stringify({ email }),
  });
export const updateProfil = (id: number, daten: Record<string, string>) =>
  req(`/kuenstler/${id}/profil`, { method: "PATCH", body: JSON.stringify(daten) });

export const getKuenstlerBilder = (id: number) =>
  req<Bild[]>(`/kuenstler/${id}/bilder`);

export const kuenstlerBildEinreichen = (id: number, data: {
  bildtitel: string; bildtechnik: string; genre: string;
  breite_rahmen_cm: number; hoehe_rahmen_cm: number;
  einlieferungspreis?: number; anmerkung_bild?: string;
  abrechnungsempf?: string; galerist_id?: number;
}) => req<Bild>(`/kuenstler/${id}/bilder`, { method: "POST", body: JSON.stringify(data) });

export const kuenstlerBildLoeschen = (kuenstlerId: number, bildId: number) =>
  req(`/kuenstler/${kuenstlerId}/bilder/${bildId}`, { method: "DELETE" });

export async function kuenstlerBildFotoHochladen(kuenstlerId: number, bildId: number, file: File): Promise<{ bild_url_web: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/kuenstler/${kuenstlerId}/bilder/${bildId}/foto`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export const dsgvoEinwilligung = (id: number) =>
  req(`/kuenstler/${id}/dsgvo`, { method: "PATCH" });

// --- Reservierung ---
export const reservieren = (data: ReservierungCreate) =>
  req<{ id: number; status: string }>("/reservierungen/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// --- Kasse ---
export const getAlleKaeufe = () => req<import("./types").Kauf[]>("/kaeufe/");
export const getKauf = (id: number) => req<import("./types").KaufDetail>(`/kaeufe/${id}`);
export const getAlleKaeufer = () => req<import("./types").KaeuferEintrag[]>("/kaeufe/kaeufer");

export const kaufErfassen = (data: KaufCreate) =>
  req<{ id: number; status: string }>("/kaeufe/", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const alsBezahltMarkieren = (kaufId: number) =>
  req(`/kaeufe/${kaufId}/bezahlt`, { method: "PATCH" });

// --- Admin ---
export const getAlleBilder = () => req<Bild[]>("/admin/bilder/alle");
export const bilderFreigeben = (id: number) =>
  req(`/admin/bilder/${id}/freigeben`, { method: "PATCH" });
export const massenFreigeben = (ids: number[], freigegeben: boolean = true) =>
  req<{ freigegeben: number }>("/admin/bilder/massenfreigabe", {
    method: "PATCH",
    body: JSON.stringify({ ids, freigegeben }),
  });
export const preisSetzen = (id: number, preis: number) =>
  req(`/admin/bilder/${id}/preis?verkaufspreis=${preis}`, { method: "PATCH" });
export const getAlleReservierungen = () => req("/admin/reservierungen");
export const getAlleKuenstler = (mitInaktiven = false) =>
  req<Kuenstler[]>(`/admin/kuenstler/alle${mitInaktiven ? "?mit_inaktiven=true" : ""}`);
export const kuenstlerAktualisieren = (id: number, data: Partial<Kuenstler>) =>
  req<Kuenstler>(`/admin/kuenstler/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const kuenstlerEinladen = (id: number) =>
  req<{ token: string; portal_url: string }>(`/admin/kuenstler/${id}/einladen`, { method: "POST" });
export const kuenstlerLoeschen = (id: number) =>
  req(`/admin/kuenstler/${id}`, { method: "DELETE" });
export const bildNeuAnlegen = (data: {
  kuenstler_id: number; bildtitel: string; bildtechnik: string; genre: string;
  breite_rahmen_cm: number; hoehe_rahmen_cm: number; einlieferungspreis?: number;
  in_ausstellung?: boolean; abrechnungsempf?: string; galerist_id?: number;
}) => req<Bild>("/admin/bilder/neu", { method: "POST", body: JSON.stringify(data) });

export const merkliste_admin_zusenden = (besucherId: number) =>
  req<{ status: string; email: string }>(`/admin/merklisten/${besucherId}/zusenden`, { method: "POST" });

export const merklisten_nachfassen = (betreff: string, text: string) =>
  req<{ status: string; anzahl: number }>("/admin/merklisten/nachfassen", {
    method: "POST", body: JSON.stringify({ betreff, text }),
  });

export const besucher_newsletter_senden = (betreff: string, text: string) =>
  req<{ status: string; anzahl: number }>("/admin/newsletter/besucher", {
    method: "POST", body: JSON.stringify({ betreff, text }),
  });

export const nachricht_senden = (betreff: string, text: string) =>
  req<{ id: number; anzahl: number }>("/admin/nachrichten", {
    method: "POST", body: JSON.stringify({ betreff, text }),
  });

export const getAlleNachrichten = () =>
  req<{ id: number; betreff: string; text: string; erstellt_am: string; gelesen: number; gesamt: number }[]>("/admin/nachrichten");

export const getNachrichtUngelesen = (id: number) =>
  req<{ id: number; name: string; email: string }[]>(`/admin/nachrichten/${id}/ungelesen`);

export const getKuenstlerNachrichten = (kuenstlerId: number) =>
  req<{ id: number; betreff: string; text: string; erstellt_am: string; gelesen: boolean }[]>(
    `/kuenstler/${kuenstlerId}/nachrichten`
  );

export const nachrichtAlsGelesen = (kuenstlerId: number, nachrichtId: number) =>
  req(`/kuenstler/${kuenstlerId}/nachrichten/${nachrichtId}/gelesen`, { method: "POST" });

export const ausstellungToggle = (id: number, inAusstellung: boolean) =>
  req(`/admin/bilder/${id}/ausstellung?in_ausstellung=${inAusstellung}`, { method: "PATCH" });

export const bildLoeschen = (id: number) =>
  req(`/admin/bilder/${id}`, { method: "DELETE" });

export const aiBeschreibungGenerieren = (id: number) =>
  req<{ beschreibung: string }>(`/admin/bilder/${id}/ai-beschreibung`, { method: "POST" });

export const getZusatzFotos = (id: number) =>
  req<import("./types").BildFoto[]>(`/admin/bilder/${id}/fotos`);

export const zusatzFotoLoeschen = (bildId: number, fotoId: number) =>
  req(`/admin/bilder/${bildId}/fotos/${fotoId}`, { method: "DELETE" });

export async function zusatzFotoHochladen(bildId: number, file: File): Promise<import("./types").BildFoto> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/admin/bilder/${bildId}/fotos`, { method: "POST", body: fd, headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const getBildFotosPublic = (id: number) =>
  req<import("./types").BildFoto[]>(`/bilder/${id}/fotos`);

export const bildAktualisieren = (id: number, data: Partial<{
  bildtitel: string; bildtechnik: string; genre: string;
  breite_rahmen_cm: number; hoehe_rahmen_cm: number;
  breite_cm: number; hoehe_cm: number; tiefe_cm: number; gewicht_kg: number;
  einlieferungspreis: number; verkaufspreis: number;
  anmerkung_bild: string; foto_nr: string;
  in_ausstellung: boolean; freigegeben: boolean;
  abrechnungsempf: string; galerist_id: number | null;
}>) => req<import("./types").Bild>(`/admin/bilder/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// --- Merkliste ---
export const merklisteAnmelden = (email?: string, telefon?: string) =>
  req<{ token: string; besucher_id: number }>("/merkliste/anmelden", {
    method: "POST",
    body: JSON.stringify({ email: email ?? null, telefon: telefon ?? null }),
  });

export const getMerkliste = (token: string) =>
  req<{ bilder: Bild[]; email: string | null; telefon: string | null }>(`/merkliste/?token=${encodeURIComponent(token)}`);

export const merklisteZusenden = (token: string) =>
  req<{ status: string; email: string }>(`/merkliste/zusenden?token=${encodeURIComponent(token)}`, { method: "POST" });

export const merklisteProfilAktualisieren = (token: string, data: { email?: string; telefon?: string }) =>
  req<{ email: string | null; telefon: string | null }>(`/merkliste/profil?token=${encodeURIComponent(token)}`, {
    method: "PATCH", body: JSON.stringify(data),
  });

export const merklisteHinzufuegen = (token: string, bildId: number) =>
  req(`/merkliste/${bildId}?token=${encodeURIComponent(token)}`, { method: "POST" });

export const merklisteEntfernen = (token: string, bildId: number) =>
  req(`/merkliste/${bildId}?token=${encodeURIComponent(token)}`, { method: "DELETE" });

export async function fotoHochladen(bildId: number, file: File): Promise<{ bild_url_web: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/admin/bilder/${bildId}/foto`, { method: "POST", body: fd, headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

```

### lib/auth.ts

```ts
const COOKIE = "kt_auth";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getRolle(): "admin" | "orga" | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp < Date.now() / 1000) return null;
    return payload.rolle ?? null;
  } catch {
    return null;
  }
}

export function setToken(token: string, stunden: number) {
  document.cookie =
    `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${stunden * 3600}; SameSite=Strict`;
}

export function logout() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

```

### lib/MerklisteContext.tsx

```tsx
"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { merklisteAnmelden, getMerkliste, merklisteHinzufuegen, merklisteEntfernen, merklisteProfilAktualisieren } from "./api";

interface MerklisteContextType {
  token: string | null;
  email: string | null;
  telefon: string | null;
  ids: Set<number>;
  anmelden: (email?: string, telefon?: string) => Promise<void>;
  updateProfil: (email?: string, telefon?: string) => Promise<void>;
  toggle: (bildId: number) => Promise<void>;
  isInList: (bildId: number) => boolean;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MerklisteContext = createContext<MerklisteContextType | null>(null);

export function MerklisteProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [telefon, setTelefon] = useState<string | null>(null);
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const pendingIdRef = useRef<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("merkliste_token");
    if (!t) return;
    setToken(t);
    setEmail(localStorage.getItem("merkliste_email"));
    setTelefon(localStorage.getItem("merkliste_telefon"));
    getMerkliste(t)
      .then(data => {
        setIds(new Set(data.bilder.map((b: any) => b.id)));
        if (data.email) { setEmail(data.email); localStorage.setItem("merkliste_email", data.email); }
        if (data.telefon) { setTelefon(data.telefon); localStorage.setItem("merkliste_telefon", data.telefon); }
      })
      .catch(() => {
        localStorage.removeItem("merkliste_token");
        setToken(null);
      });
  }, []);

  const anmelden = useCallback(async (email?: string, telefon?: string) => {
    const data = await merklisteAnmelden(email, telefon);
    localStorage.setItem("merkliste_token", data.token);
    if (email) localStorage.setItem("merkliste_email", email);
    if (telefon) localStorage.setItem("merkliste_telefon", telefon);
    setToken(data.token);
    setEmail(email ?? null);
    setTelefon(telefon ?? null);
    const list = await getMerkliste(data.token);
    const newIds = new Set<number>(list.bilder.map((b: any) => b.id));
    if (pendingIdRef.current !== null) {
      await merklisteHinzufuegen(data.token, pendingIdRef.current);
      newIds.add(pendingIdRef.current);
      pendingIdRef.current = null;
    }
    setIds(newIds);
    setShowModal(false);
  }, []);

  const toggle = useCallback(async (bildId: number) => {
    if (!token) {
      pendingIdRef.current = bildId;
      setShowModal(true);
      return;
    }
    if (ids.has(bildId)) {
      await merklisteEntfernen(token, bildId);
      setIds(prev => { const n = new Set(prev); n.delete(bildId); return n; });
    } else {
      await merklisteHinzufuegen(token, bildId);
      setIds(prev => new Set([...prev, bildId]));
    }
  }, [token, ids]);

  const updateProfil = useCallback(async (newEmail?: string, newTelefon?: string) => {
    if (!token) return;
    const result = await merklisteProfilAktualisieren(token, { email: newEmail, telefon: newTelefon });
    if (result.email !== undefined) { setEmail(result.email); if (result.email) localStorage.setItem("merkliste_email", result.email); }
    if (result.telefon !== undefined) { setTelefon(result.telefon); if (result.telefon) localStorage.setItem("merkliste_telefon", result.telefon); }
  }, [token]);

  const isInList = useCallback((bildId: number) => ids.has(bildId), [ids]);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => { setShowModal(false); pendingIdRef.current = null; }, []);

  return (
    <MerklisteContext.Provider value={{ token, email, telefon, ids, anmelden, updateProfil, toggle, isInList, showModal, openModal, closeModal }}>
      {children}
    </MerklisteContext.Provider>
  );
}

export function useMerkliste() {
  const ctx = useContext(MerklisteContext);
  if (!ctx) throw new Error("useMerkliste must be within MerklisteProvider");
  return ctx;
}

```

### lib/types.ts

```ts
export type Verfuegbarkeit = "Verfügbar" | "Reserviert" | "Verkauft";
export type Genre =
  | "Abstrakt" | "Akt" | "Landschaft" | "Menschen"
  | "Pfalz" | "Portrait" | "Städte" | "Stilleben" | "Sonstiges";

export interface Kuenstler {
  id: number;
  db_ident: string;
  db_name: string;
  db_vorname: string;
  kuenstler_nr?: string;
  db_beruf?: string;
  db_leben?: string;
  db_lebenstext?: string;
  db_kommentar?: string;
  db_inspiration?: string;
  db_ausstellungen?: string;
  db_email?: string;
  db_adresse?: string;
  db_plz?: string;
  db_ort?: string;
  db_instagram?: string;
  db_facebook?: string;
  db_webseite?: string;
  db_telefon?: string;
  portrait_foto?: string;
  aktiv?: boolean;
  vor_ort_anwesend?: boolean;
  ist_galerist?: boolean;
  kuenstlertyp?: "vor_ort" | "galerie" | "eigenbestand";
  abrechnungsempf?: string;
  galerist_id?: number;
}

export type Abrechnungsempfaenger = "Künstler" | "Galerist" | "Lions";

export interface Bild {
  id: number;
  bild_nr: string;
  bildtitel: string;
  anmerkung_bild?: string;
  bildtechnik: string;
  genre: Genre;
  anzahl: number;
  hoehe_rahmen_cm: number;
  breite_rahmen_cm: number;
  hoehe_cm?: number;
  breite_cm?: number;
  tiefe_cm?: number;
  gewicht_kg?: number;
  verkaufspreis?: number;
  bild_url_web?: string;
  verfuegbarkeit: Verfuegbarkeit;
  kuenstler_id: number;
  kuenstler?: Kuenstler;
  einlieferungspreis?: number;
  verkaufspreis_vorschlag?: number;
  freigegeben?: boolean;
  in_ausstellung?: boolean;
  abrechnungsempf?: Abrechnungsempfaenger;
  galerist_id?: number;
  galerist?: Kuenstler;
}

export interface BildFoto {
  id: number;
  bild_id: number;
  url: string;
  reihenfolge: number;
}

export interface ReservierungCreate {
  bild_id: number;
  vorname: string;
  name: string;
  email: string;
  telefon?: string;
}

export interface KaufDetail extends Kauf {
  bildtechnik?: string;
  genre?: string;
  breite_rahmen_cm?: number;
  hoehe_rahmen_cm?: number;
  breite_cm?: number;
  hoehe_cm?: number;
  kuenstler_beruf?: string;
}

export interface Kauf {
  id: number;
  erstellt_am: string;
  bezahlt: boolean;
  bezahlt_am?: string;
  zahlungsart: string;
  kaeufer_titel?: string;
  kaeufer_vorname: string;
  kaeufer_name: string;
  kaeufer_email: string;
  kaeufer_strasse: string;
  kaeufer_plz: string;
  kaeufer_ort: string;
  bild_id: number;
  bild_nr?: string;
  bildtitel?: string;
  verkaufspreis?: number;
  kuenstler?: string;
}

export interface KaeuferKauf {
  kauf_id: number;
  datum: string;
  bild_nr?: string;
  bildtitel?: string;
  kuenstler?: string;
  verkaufspreis: number;
  bezahlt: boolean;
  zahlungsart: string;
}

export interface KaeuferEintrag {
  email: string;
  titel?: string;
  vorname: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  kaeufe: KaeuferKauf[];
  gesamt: number;
}

export interface KaufCreate {
  bild_id: number;
  reservierung_id?: number;
  kaeufer_titel?: string;
  kaeufer_vorname: string;
  kaeufer_name: string;
  kaeufer_strasse: string;
  kaeufer_plz: string;
  kaeufer_ort: string;
  kaeufer_email: string;
  zahlungsart: "Bar" | "PayPal" | "Kreditkarte" | "Überweisung";
}

```

### lib/utils.ts

```ts
/** Formatiert eine 7-stellige Bild-Nr. als JJ.KKK.NN (z. B. "2540001" → "25.400.01"). */
export function formatBildNr(nr: string): string {
  const d = nr.replace(/\D/g, "");
  if (d.length === 7) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 7)}`;
  return nr;
}

/** Erzeugt einen aussagekräftigen alt-Text: "Bildtitel – Künstlername – Technik" */
export function bildAlt(bild: {
  bildtitel: string;
  kuenstler?: { db_vorname?: string | null; db_name?: string | null } | null;
  bildtechnik?: string | null;
}): string {
  const parts: string[] = [bild.bildtitel];
  if (bild.kuenstler) {
    const name = `${bild.kuenstler.db_vorname ?? ""} ${bild.kuenstler.db_name ?? ""}`.trim();
    if (name) parts.push(name);
  }
  if (bild.bildtechnik) parts.push(bild.bildtechnik);
  return parts.join(" – ");
}

```
