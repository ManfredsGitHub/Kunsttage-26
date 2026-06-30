from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from pydantic import BaseModel
from models import Reservierung, Kauf, Kuenstler, KuenstlerPublic, Platz, PlatzPublic, Raumzuteilung
from database import get_session
from services.import_service import import_csv, import_excel, import_kuenstler_csv, import_kuenstler_excel

router = APIRouter(prefix="/admin", tags=["Admin"])


# --- CSV/Excel-Import ---

@router.post("/import/csv")
async def import_csv_endpoint(file: UploadFile = File(...), session: Session = Depends(get_session)):
    data = await file.read()
    return import_csv(data, session)


@router.post("/import/excel")
async def import_excel_endpoint(file: UploadFile = File(...), session: Session = Depends(get_session)):
    data = await file.read()
    return import_excel(data, session)


@router.post("/import/kuenstler-csv")
async def import_kuenstler_csv_endpoint(file: UploadFile = File(...), session: Session = Depends(get_session)):
    data = await file.read()
    return import_kuenstler_csv(data, session)


@router.post("/import/kuenstler-excel")
async def import_kuenstler_excel_endpoint(file: UploadFile = File(...), session: Session = Depends(get_session)):
    data = await file.read()
    return import_kuenstler_excel(data, session)


# --- Reservierungen ---

@router.get("/reservierungen")
def alle_reservierungen(session: Session = Depends(get_session)):
    return session.exec(select(Reservierung).where(Reservierung.storniert == False)).all()


# --- Käufe ---

@router.get("/kaeufe")
def alle_kaeufe(session: Session = Depends(get_session)):
    return session.exec(select(Kauf)).all()


# --- Platzplan ---

@router.get("/plaetze", response_model=list[PlatzPublic])
def alle_plaetze(session: Session = Depends(get_session)):
    plaetze = session.exec(select(Platz).order_by(Platz.position_nr)).all()
    result = []
    for p in plaetze:
        item = PlatzPublic.model_validate(p)
        if p.kuenstler_id:
            k = session.get(Kuenstler, p.kuenstler_id)
            if k:
                item.kuenstler = KuenstlerPublic.model_validate(k)
        result.append(item)
    return result


class PlatzZuweisungIn(BaseModel):
    kuenstler_id: Optional[int] = None


@router.patch("/plaetze/{platz_id}", response_model=PlatzPublic)
def platz_zuweisen(
    platz_id: int,
    body: PlatzZuweisungIn,
    session: Session = Depends(get_session),
):
    platz = session.get(Platz, platz_id)
    if not platz:
        raise HTTPException(status_code=404, detail="Platz nicht gefunden")
    if body.kuenstler_id is not None:
        k = session.get(Kuenstler, body.kuenstler_id)
        if not k:
            raise HTTPException(status_code=404, detail="Künstler nicht gefunden")
    platz.kuenstler_id = body.kuenstler_id
    session.add(platz)
    session.commit()
    session.refresh(platz)
    item = PlatzPublic.model_validate(platz)
    if platz.kuenstler_id:
        k = session.get(Kuenstler, platz.kuenstler_id)
        if k:
            item.kuenstler = KuenstlerPublic.model_validate(k)
    return item


# --- Raumplan ---

class RaumzuteilungIn(BaseModel):
    belegt_durch: Optional[str] = None


@router.get("/raumplan", response_model=list[Raumzuteilung])
def get_raumplan(session: Session = Depends(get_session)):
    return session.exec(select(Raumzuteilung).order_by(Raumzuteilung.id)).all()


@router.patch("/raumplan/{raum_nr}", response_model=Raumzuteilung)
def raum_zuweisen(raum_nr: str, body: RaumzuteilungIn, session: Session = Depends(get_session)):
    raum = session.exec(select(Raumzuteilung).where(Raumzuteilung.raum_nr == raum_nr)).first()
    if not raum:
        raise HTTPException(status_code=404, detail="Raum nicht gefunden")
    raum.belegt_durch = body.belegt_durch or None
    session.add(raum)
    session.commit()
    session.refresh(raum)
    return raum
