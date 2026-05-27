import pandas as pd
from sqlmodel import Session, select
from models import Bild, Kuenstler, Kuenstlertyp, Genre, Abrechnungsempfaenger
from services.price_service import berechne_verkaufspreis
import io


PFLICHT_SPALTEN = {
    "bild_nr", "kuenstler_name", "kuenstler_vorname",
    "bildtitel", "bildtechnik", "genre",
    "hoehe_rahmen_cm", "breite_rahmen_cm",
}


def import_csv(data: bytes, session: Session) -> dict:
    df = pd.read_csv(io.BytesIO(data), dtype=str)
    return _process(df, session)


def import_excel(data: bytes, session: Session) -> dict:
    df = pd.read_excel(io.BytesIO(data), dtype=str)
    return _process(df, session)


def _process(df: pd.DataFrame, session: Session) -> dict:
    fehlend = PFLICHT_SPALTEN - set(df.columns)
    if fehlend:
        raise ValueError(f"Fehlende Pflichtspalten: {fehlend}")

    importiert, fehler = 0, []

    for i, row in df.iterrows():
        try:
            bild_nr = row["bild_nr"].strip()

            # Künstler suchen oder anlegen
            ident = f"{row['kuenstler_name'].strip()}_{row['kuenstler_vorname'].strip()}".lower()
            kuenstler = session.exec(
                select(Kuenstler).where(Kuenstler.db_ident == ident)
            ).first()
            if not kuenstler:
                kuenstler = Kuenstler(
                    db_ident=ident,
                    db_name=row["kuenstler_name"].strip(),
                    db_vorname=row["kuenstler_vorname"].strip(),
                    kuenstlertyp=Kuenstlertyp.galerie,
                )
                session.add(kuenstler)
                session.flush()

            einlieferungspreis = _float(row.get("einlieferungspreis"))
            verkaufspreis = _float(row.get("verkaufspreis"))
            if not verkaufspreis and einlieferungspreis:
                verkaufspreis = berechne_verkaufspreis(einlieferungspreis)

            genre_val = row["genre"].strip()
            genre = next(
                (g for g in Genre if g.value.lower() == genre_val.lower()),
                Genre.sonstiges,
            )

            abrech_raw = (row.get("abrechnungsempf") or "").strip().lower()
            abrech = Abrechnungsempfaenger.galerist if "galerist" in abrech_raw else Abrechnungsempfaenger.kuenstler

            bild = Bild(
                bild_nr=bild_nr,
                kuenstler_id=kuenstler.id,
                bildtitel=row["bildtitel"].strip(),
                bildtechnik=row["bildtechnik"].strip(),
                genre=genre,
                anzahl=int(_float(row.get("anzahl")) or 1),
                hoehe_rahmen_cm=float(row["hoehe_rahmen_cm"]),
                breite_rahmen_cm=float(row["breite_rahmen_cm"]),
                einlieferungspreis=einlieferungspreis,
                verkaufspreis_vorschlag=berechne_verkaufspreis(einlieferungspreis) if einlieferungspreis else None,
                verkaufspreis=verkaufspreis,
                abrechnungsempf=abrech,
                foto_nr=row.get("bild_dateiname", "").strip() or None,
            )
            session.add(bild)
            importiert += 1
        except Exception as e:
            fehler.append({"zeile": i + 2, "fehler": str(e)})

    session.commit()
    return {"importiert": importiert, "fehler": fehler}


def _float(val) -> float | None:
    try:
        return float(str(val).replace(",", "."))
    except (TypeError, ValueError):
        return None
