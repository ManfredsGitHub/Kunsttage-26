import secrets
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional
from models import Besucher, MerklisteEintrag, Bild, BildPublic
from database import get_session

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
