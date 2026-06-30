import os
import csv
import io
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import Response, StreamingResponse
from sqlmodel import Session, select
from models import Bild, Kuenstler, KuenstlerCreate, KuenstlerPublic
from database import get_session
from services.vita_pdf_service import generate_vita_pdf

router = APIRouter(prefix="/admin", tags=["Admin Künstler"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


# --- Übersichten ---

@router.get("/kuenstler/alle", response_model=list[KuenstlerPublic])
def alle_kuenstler(mit_inaktiven: bool = False, nur_ansprechen: bool = False, session: Session = Depends(get_session)):
    q = select(Kuenstler).order_by(Kuenstler.db_name)
    if not mit_inaktiven:
        q = q.where(Kuenstler.aktiv == True)
    if nur_ansprechen:
        q = q.where(Kuenstler.zur_ausstellung_ansprechen == True)
    return session.exec(q).all()


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
              "db_instagram","db_facebook","db_pinterest","db_webseite","aktiv","vor_ort_anwesend","kuenstler_nr",
              "abrechnungsempf","galerist_id","kuenstlertyp","zur_ausstellung_ansprechen"]
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


# --- Druckliste ---

@router.get("/druckliste")
def druckliste(token: str | None = None, session: Session = Depends(get_session)):
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
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=druckliste.csv"},
    )
