from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from models import Nutzer, NutzerPublic, AuthToken
from database import get_session
from services.auth_service import generate_raw_token, hash_token
from services.email_service import send_konto_einrichten

router = APIRouter(prefix="/admin", tags=["Admin Nutzer"])

ERLAUBTE_ROLLEN = {"admin", "orga", "kasse", "kuenstler"}


# ── Nutzerverwaltung ──────────────────────────────────────────────────────────

@router.get("/users", response_model=list[NutzerPublic])
def alle_nutzer(session: Session = Depends(get_session)):
    return session.exec(select(Nutzer).order_by(Nutzer.rolle, Nutzer.email)).all()


class NutzerAnlegenData(BaseModel):
    email: str
    rolle: str
    kuenstler_id: Optional[int] = None


@router.post("/users", response_model=NutzerPublic)
def nutzer_anlegen(data: NutzerAnlegenData, session: Session = Depends(get_session)):
    if data.rolle not in ERLAUBTE_ROLLEN:
        raise HTTPException(status_code=400, detail="Unbekannte Rolle")
    email = data.email.lower().strip()
    existing = session.exec(select(Nutzer).where(Nutzer.email == email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="E-Mail bereits vergeben")

    nutzer = Nutzer(
        email=email,
        password_hash="",  # wird beim Setup gesetzt
        rolle=data.rolle,
        kuenstler_id=data.kuenstler_id,
        aktiv=False,  # erst aktiv nach Passwort-Setup
    )
    session.add(nutzer)
    session.commit()
    session.refresh(nutzer)

    _send_einladung(nutzer, session)
    return nutzer


@router.patch("/users/{nutzer_id}", response_model=NutzerPublic)
def nutzer_aktualisieren(
    nutzer_id: int,
    data: dict,
    session: Session = Depends(get_session),
):
    nutzer = session.get(Nutzer, nutzer_id)
    if not nutzer:
        raise HTTPException(status_code=404, detail="Nutzer nicht gefunden")
    if "rolle" in data and data["rolle"] not in ERLAUBTE_ROLLEN:
        raise HTTPException(status_code=400, detail="Unbekannte Rolle")
    for field in ("rolle", "aktiv"):
        if field in data:
            setattr(nutzer, field, data[field])
    session.add(nutzer)
    session.commit()
    session.refresh(nutzer)
    return nutzer


@router.post("/users/{nutzer_id}/einladen")
def nutzer_einladen(nutzer_id: int, session: Session = Depends(get_session)):
    nutzer = session.get(Nutzer, nutzer_id)
    if not nutzer:
        raise HTTPException(status_code=404, detail="Nutzer nicht gefunden")
    _send_einladung(nutzer, session)
    return {"ok": True}


def _send_einladung(nutzer: Nutzer, session: Session):
    raw = generate_raw_token()
    token_entry = AuthToken(
        nutzer_id=nutzer.id,
        token_hash=hash_token(raw),
        zweck="setup",
        expires_at=datetime.utcnow() + timedelta(hours=48),
    )
    session.add(token_entry)
    session.commit()
    try:
        send_konto_einrichten(nutzer.email, nutzer.rolle, raw)
    except Exception:
        pass
