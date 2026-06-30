from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from pydantic import BaseModel
from models import Bild, BildPublic, Kuenstler, Besucher, MerklisteEintrag, KuenstlerNachricht, KuenstlerNachrichtGelesen
from database import get_session
from services.email_service import send_merkliste, send_nachfass

router = APIRouter(prefix="/admin", tags=["Admin Kommunikation"])


# --- Merklisten ---

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
