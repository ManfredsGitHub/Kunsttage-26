import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from datetime import datetime
from models import Bild, Kauf, KaufCreate, Verfuegbarkeit
from database import get_session
from services import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kaeufe", tags=["Kasse"])


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
