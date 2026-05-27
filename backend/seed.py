"""Testdaten für Entwicklung/Demo."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import Session, create_engine, select
from models import (
    Kuenstler, Kuenstlertyp,
    Bild, BildCreate, Genre, Verfuegbarkeit, Abrechnungsempfaenger,
)
from services.price_service import berechne_verkaufspreis

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kunsttage.db")
engine = create_engine(DATABASE_URL)

KUENSTLER = [
    dict(db_ident="MH001", db_vorname="Maria", db_name="Hoffmann",
         db_email="maria.hoffmann@example.com",
         db_leben="*1968 in Speyer. Studium der Freien Kunst an der HBK Saar.",
         kuenstlertyp=Kuenstlertyp.vor_ort),
    dict(db_ident="TW002", db_vorname="Thomas", db_name="Weber",
         db_email="t.weber@example.com",
         db_leben="*1974 in Ludwigshafen. Autodidakt, lebt und arbeitet in der Pfalz.",
         kuenstlertyp=Kuenstlertyp.vor_ort),
    dict(db_ident="SK003", db_vorname="Sophie", db_name="Klein",
         db_email="s.klein@example.com",
         db_leben="*1985 in München. Meisterschülerin bei Prof. Armin Müller.",
         kuenstlertyp=Kuenstlertyp.galerie),
]

BILDER = [
    # Maria Hoffmann
    dict(kuenstler_ident="MH001", bild_nr="MH-001", bildtitel="Abendlicht über dem Rhein",
         bildtechnik="Öl auf Leinwand", genre=Genre.landschaft,
         hoehe_rahmen_cm=80, breite_rahmen_cm=120, einlieferungspreis=850),
    dict(kuenstler_ident="MH001", bild_nr="MH-002", bildtitel="Stilles Wasser",
         bildtechnik="Aquarell", genre=Genre.landschaft,
         hoehe_rahmen_cm=50, breite_rahmen_cm=70, einlieferungspreis=320),
    dict(kuenstler_ident="MH001", bild_nr="MH-003", bildtitel="Frühlingserwachen",
         bildtechnik="Acryl auf Karton", genre=Genre.abstrakt,
         hoehe_rahmen_cm=60, breite_rahmen_cm=60, einlieferungspreis=480),
    # Thomas Weber
    dict(kuenstler_ident="TW002", bild_nr="TW-001", bildtitel="Hambacher Schloss im Herbst",
         bildtechnik="Öl auf Leinwand", genre=Genre.pfalz,
         hoehe_rahmen_cm=70, breite_rahmen_cm=100, einlieferungspreis=1200),
    dict(kuenstler_ident="TW002", bild_nr="TW-002", bildtitel="Weinberge bei Deidesheim",
         bildtechnik="Pastell", genre=Genre.pfalz,
         hoehe_rahmen_cm=40, breite_rahmen_cm=60, einlieferungspreis=290),
    dict(kuenstler_ident="TW002", bild_nr="TW-003", bildtitel="Marktplatz Neustadt",
         bildtechnik="Federzeichnung koloriert", genre=Genre.staedte,
         hoehe_rahmen_cm=50, breite_rahmen_cm=50, einlieferungspreis=380),
    dict(kuenstler_ident="TW002", bild_nr="TW-004", bildtitel="Altes Gemäuer",
         bildtechnik="Öl auf Leinwand", genre=Genre.staedte,
         hoehe_rahmen_cm=90, breite_rahmen_cm=70, einlieferungspreis=950),
    # Sophie Klein
    dict(kuenstler_ident="SK003", bild_nr="SK-001", bildtitel="Gedankenfluss",
         bildtechnik="Mischtechnik auf Leinwand", genre=Genre.abstrakt,
         hoehe_rahmen_cm=100, breite_rahmen_cm=80, einlieferungspreis=1800),
    dict(kuenstler_ident="SK003", bild_nr="SK-002", bildtitel="Portrait einer Unbekannten",
         bildtechnik="Öl auf Holz", genre=Genre.portrait,
         hoehe_rahmen_cm=60, breite_rahmen_cm=45, einlieferungspreis=650),
    dict(kuenstler_ident="SK003", bild_nr="SK-003", bildtitel="Stillleben mit Orangen",
         bildtechnik="Öl auf Leinwand", genre=Genre.stilleben,
         hoehe_rahmen_cm=40, breite_rahmen_cm=55, einlieferungspreis=420),
]

def seed():
    with Session(engine) as session:
        # Künstler anlegen (falls noch nicht vorhanden)
        kuenstler_map = {}
        for kd in KUENSTLER:
            existing = session.exec(
                select(Kuenstler).where(Kuenstler.db_ident == kd["db_ident"])
            ).first()
            if existing:
                print(f"  Künstler {kd['db_ident']} bereits vorhanden.")
                kuenstler_map[kd["db_ident"]] = existing
                continue
            k = Kuenstler(**kd)
            session.add(k)
            session.flush()
            kuenstler_map[kd["db_ident"]] = k
            print(f"  + Künstler: {k.db_vorname} {k.db_name}")
        session.commit()

        # Bilder anlegen und direkt freigeben
        for bd in BILDER:
            ident = bd.pop("kuenstler_ident")
            kuenstler = kuenstler_map[ident]
            existing = session.exec(
                select(Bild).where(Bild.bild_nr == bd["bild_nr"])
            ).first()
            if existing:
                print(f"  Bild {bd['bild_nr']} bereits vorhanden.")
                bd["kuenstler_ident"] = ident
                continue
            preis = bd.pop("einlieferungspreis", None)
            vp = berechne_verkaufspreis(preis) if preis else None
            b = Bild(
                kuenstler_id=kuenstler.id,
                abrechnungsempf=Abrechnungsempfaenger.kuenstler,
                einlieferungspreis=preis,
                verkaufspreis_vorschlag=vp,
                verkaufspreis=vp,
                freigegeben=True,
                **bd,
            )
            session.add(b)
            print(f"  + Bild: {b.bild_nr} – {b.bildtitel} (€ {b.verkaufspreis})")
            bd["kuenstler_ident"] = ident
        session.commit()

    print("\nSeed abgeschlossen.")

if __name__ == "__main__":
    seed()
