import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import Bild, Kaufanfrage, KaufanfrageCreate, KaufanfrageStatus, Verfuegbarkeit, Kuenstler
from database import get_session
from services import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kaufanfragen", tags=["Kaufanfragen"])


@router.post("/")
def kaufanfrage_stellen(data: KaufanfrageCreate, session: Session = Depends(get_session)):
    bild = session.get(Bild, data.bild_id)
    if not bild:
        raise HTTPException(404, "Bild nicht gefunden")
    if bild.verfuegbarkeit == Verfuegbarkeit.verkauft:
        raise HTTPException(409, "Bild ist bereits verkauft")

    anfrage = Kaufanfrage.model_validate(data)
    session.add(anfrage)

    if bild.verfuegbarkeit == Verfuegbarkeit.verfuegbar:
        bild.verfuegbarkeit = Verfuegbarkeit.reserviert
        session.add(bild)

    session.commit()
    session.refresh(anfrage)

    kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild.kuenstler_id else None
    kuenstler_name = f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else "—"

    try:
        email_service.send_kaufanfrage_besucher(
            data.email,
            f"{data.vorname} {data.name}",
            bild.bildtitel,
        )
    except Exception as exc:
        logger.warning("Kaufanfrage Besucher-Mail fehlgeschlagen: %s", exc)

    try:
        email_service.send_kaufanfrage_admin(
            anfrage_id=anfrage.id,
            bild_nr=bild.bild_nr,
            bildtitel=bild.bildtitel,
            kuenstler=kuenstler_name,
            verkaufspreis=bild.verkaufspreis,
            anrede=data.anrede,
            vorname=data.vorname,
            name=data.name,
            email=data.email,
            telefon=data.telefon,
            strasse=data.strasse,
            plz=data.plz,
            ort=data.ort,
            land=data.land,
            anmerkung=data.anmerkung,
        )
    except Exception as exc:
        logger.warning("Kaufanfrage Admin-Mail fehlgeschlagen: %s", exc)

    return {"id": anfrage.id, "status": "eingegangen"}


@router.get("/")
def alle_kaufanfragen(session: Session = Depends(get_session)):
    anfragen = session.exec(
        select(Kaufanfrage).order_by(Kaufanfrage.erstellt_am.desc())
    ).all()
    result = []
    for a in anfragen:
        bild = session.get(Bild, a.bild_id)
        kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild and bild.kuenstler_id else None
        result.append({
            "id": a.id,
            "erstellt_am": a.erstellt_am,
            "status": a.status,
            "anrede": a.anrede,
            "vorname": a.vorname,
            "name": a.name,
            "email": a.email,
            "telefon": a.telefon,
            "strasse": a.strasse,
            "plz": a.plz,
            "ort": a.ort,
            "land": a.land,
            "anmerkung": a.anmerkung,
            "bild_id": a.bild_id,
            "bild_nr": bild.bild_nr if bild else None,
            "bildtitel": bild.bildtitel if bild else None,
            "verkaufspreis": bild.verkaufspreis if bild else None,
            "kuenstler": f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else None,
        })
    return result


@router.patch("/{anfrage_id}/status")
def status_setzen(anfrage_id: int, status: KaufanfrageStatus, session: Session = Depends(get_session)):
    anfrage = session.get(Kaufanfrage, anfrage_id)
    if not anfrage:
        raise HTTPException(404)
    anfrage.status = status
    session.add(anfrage)
    session.commit()
    return {"status": anfrage.status}
