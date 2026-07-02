import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models import Bild, BildPublic, BildFoto, Kuenstler, Genre, Verfuegbarkeit, Abrechnungsempfaenger
from database import get_session
from services.image_service import compress_image, save_image
from services.price_service import berechne_verkaufspreis

router = APIRouter(prefix="/admin", tags=["Admin Bilder"])

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
    ki_hook: Optional[str] = None
    foto_nr: Optional[str] = None
    in_ausstellung: Optional[bool] = None
    freigegeben: Optional[bool] = None
    abrechnungsempf: Optional[Abrechnungsempfaenger] = None
    galerist_id: Optional[int] = None
    verfuegbarkeit: Optional[Verfuegbarkeit] = None


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


# --- Ausstellung-Toggle ---

@router.patch("/bilder/{bild_id}/ausstellung")
def ausstellung_toggle(bild_id: int, in_ausstellung: bool, session: Session = Depends(get_session)):
    bild = session.get(Bild, bild_id)
    if not bild:
        raise HTTPException(404)
    bild.in_ausstellung = in_ausstellung
    session.add(bild)
    session.commit()
    return {"in_ausstellung": in_ausstellung}


# --- Neues Bild anlegen ---

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

    prompt = f"""Du bist ein erfahrener Kunstkritiker und Marketing-Texter für eine Benefiz-Kunstausstellung (Lions Club, Pfalz).

Erstelle für folgendes Kunstwerk zwei Texte:

1. HOOK: Ein einziger kurzer, rätselhafter oder poetischer Satz (max. 8 Wörter), der auf Instagram den Daumen stoppt. Er kann sich auf den Titel beziehen, auf das Motiv, auf eine Stimmung — aber er darf das Werk nicht erklären, nur neugierig machen.

2. BESCHREIBUNG: 2–3 einladende Sätze für die Ausstellungswebsite. Lebendig, atmosphärisch. Kein Verkaufsaufruf, kein Hinweis auf Kauf oder guten Zweck.

Kunstwerk:
- Titel: {bild.bildtitel}
- Künstler: {kuenstler_name}
- Technik: {bild.bildtechnik}
- Genre: {bild.genre}
- Maße: {abmasse}
{f"- Aussage des Künstlers: {kuenstler_aussage}" if kuenstler_aussage else ""}

Antworte ausschließlich in diesem JSON-Format (kein Markdown, keine Erklärungen):
{{"hook": "...", "beschreibung": "..."}}

Sprache: Deutsch."""

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

    import json as _json
    import logging as _logging
    _log = _logging.getLogger(__name__)

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": content}],
        )
        raw = response.content[0].text.strip()
    except anthropic.APIStatusError as exc:
        _log.error("Anthropic API-Fehler (Status %s): %s", exc.status_code, exc.message)
        raise HTTPException(502, f"KI-Dienst nicht verfügbar (HTTP {exc.status_code})")
    except anthropic.APIConnectionError as exc:
        _log.error("Anthropic Verbindungsfehler: %s", exc)
        raise HTTPException(502, "KI-Dienst nicht erreichbar — bitte später versuchen")
    except Exception as exc:
        _log.error("Unerwarteter Fehler beim KI-Aufruf: %s", exc)
        raise HTTPException(500, "Interner Fehler bei der KI-Beschreibung")

    try:
        parsed = _json.loads(raw)
        hook = parsed.get("hook", "").strip()
        beschreibung = parsed.get("beschreibung", "").strip()
    except _json.JSONDecodeError:
        hook = ""
        beschreibung = raw

    return {"hook": hook, "beschreibung": beschreibung}
