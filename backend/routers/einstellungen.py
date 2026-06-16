from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from models import Einstellung
from database import get_session

router = APIRouter(tags=["Einstellungen"])

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


@router.get("/einstellungen/impressum")
def impressum_lesen(session: Session = Depends(get_session)):
    eintrag = session.get(Einstellung, "impressum")
    return {"text": eintrag.wert if eintrag else IMPRESSUM_DEFAULT}


class EinstellungUpdate(BaseModel):
    text: str


@router.put("/admin/einstellungen/impressum")
def impressum_speichern(data: EinstellungUpdate, session: Session = Depends(get_session)):
    eintrag = session.get(Einstellung, "impressum")
    if eintrag:
        eintrag.wert = data.text
    else:
        eintrag = Einstellung(schluessel="impressum", wert=data.text)
    session.add(eintrag)
    session.commit()
    return {"status": "gespeichert"}
