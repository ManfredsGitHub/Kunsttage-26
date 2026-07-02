"""
Canva Bulk Create CSV-Export für Instagram Reels
=================================================
Exportiert freigegebene Bilder aus der Datenbank als CSV für Canva Bulk Create.

Verwendung:
    python export_reel_csv.py                    # ohne KI-Beschreibung
    python export_reel_csv.py --mit-ki           # mit KI-Beschreibung (kostet API-Credits)
    python export_reel_csv.py --limit 12         # max. 12 Werke
    python export_reel_csv.py --output reels.csv # anderer Dateiname

Canva Bulk Create: Template-Platzhalter müssen exakt diese Spaltennamen haben:
    Werktitel, Hook, Kuenstler_Name, Technik, KI_Satz,
    KI_Beschreibung, Hashtags, Foto_URL_1, Foto_URL_2,
    Event_Zeile1, Event_Zeile2, Event_Zeile3, CTA
"""

import argparse
import csv
import os
import sys
from pathlib import Path
from typing import Optional

# Damit Imports aus dem backend-Verzeichnis funktionieren
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from sqlmodel import Session, create_engine, select

from models import Bild, BildFoto, Kuenstler

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kunsttage.db")
# Bilder werden vom Backend (8000) ausgeliefert — unabhängig von BASE_URL (Frontend)
IMAGE_BASE_URL = os.getenv("IMAGE_BASE_URL", "http://localhost:8000")

STANDARD_AUSSCHNITTE = [7, 14, 23]  # 5×5-Raster: Hook, zweiter Blick, Abschluss-Detail
REELS_DIR = "uploads/reels"

EVENT_ZEILE1 = "14. Kunsttage auf der Ludwigshöhe"
EVENT_ZEILE2 = "17. & 18. Oktober 2026"
EVENT_ZEILE3 = "Schloss Villa Ludwigshöhe · Edenkoben · Eintritt frei"
CTA = "Alle Werke → Link in Bio"
HASHTAGS_BASIS = "#Kunsttage2026 #Pfalzkunst #ContemporaryArt #Edenkoben #Benefizkunst"


def format_bild_nr(raw: str) -> str:
    """2540001 → 25.400.01"""
    if len(raw) == 7 and raw.isdigit():
        return f"{raw[:2]}.{raw[2:5]}.{raw[5:]}"
    return raw


def foto_url(pfad: str | None) -> str:
    if not pfad:
        return ""
    if pfad.startswith("http"):
        return pfad
    return f"{IMAGE_BASE_URL}{pfad}"


def ki_hook_und_beschreibung_generieren(bild: Bild, kuenstler: Kuenstler | None) -> tuple[str, str]:
    """Generiert Hook und Beschreibung in einem API-Call. Gibt (beschreibung, hook) zurück."""
    try:
        import anthropic
        import base64
        import json as _json
        import mimetypes

        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            print(f"  ⚠️  ANTHROPIC_API_KEY fehlt — KI übersprungen für {bild.bildtitel}")
            return "", ""

        kuenstler_name = (
            f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else "Unbekannt"
        )
        abmasse = (
            f"{bild.breite_rahmen_cm} × {bild.hoehe_rahmen_cm} cm"
            if bild.breite_rahmen_cm and bild.hoehe_rahmen_cm
            else "nicht angegeben"
        )
        kuenstler_aussage = kuenstler.db_kommentar if kuenstler else None

        prompt = f"""Du bist ein erfahrener Kunstkritiker und Marketing-Texter für eine Benefiz-Kunstausstellung (Lions Club, Pfalz).

Erstelle für folgendes Kunstwerk zwei Texte:

1. HOOK: Ein einziger kurzer, rätselhafter oder poetischer Satz (max. 8 Wörter), der auf Instagram den Daumen stoppt. Er kann sich auf den Titel beziehen, auf das Motiv, auf eine Stimmung — aber er darf das Werk nicht erklären, nur neugierig machen.

2. BESCHREIBUNG: 2–3 einladende Sätze für die Ausstellungswebsite. Lebendig, atmosphärisch. Kein Verkaufsaufruf.

Kunstwerk:
- Titel: {bild.bildtitel}
- Künstler: {kuenstler_name}
- Technik: {bild.bildtechnik}
- Genre: {bild.genre}
- Maße: {abmasse}
{f"- Aussage des Künstlers: {kuenstler_aussage}" if kuenstler_aussage else ""}

Antworte ausschließlich in diesem JSON-Format (kein Markdown):
{{"hook": "...", "beschreibung": "..."}}

Sprache: Deutsch."""

        content: list = []

        if bild.bild_url_web:
            img_path = "." + bild.bild_url_web
            if os.path.exists(img_path):
                with open(img_path, "rb") as f:
                    img_data = base64.standard_b64encode(f.read()).decode("utf-8")
                mime = mimetypes.guess_type(img_path)[0] or "image/jpeg"
                content.append({
                    "type": "image",
                    "source": {"type": "base64", "media_type": mime, "data": img_data},
                })

        content.append({"type": "text", "text": prompt})

        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{"role": "user", "content": content}],
        )
        raw = response.content[0].text.strip()
        parsed = _json.loads(raw)
        return parsed.get("beschreibung", "").strip(), parsed.get("hook", "").strip()

    except Exception as e:
        print(f"  ⚠️  KI-Fehler für {bild.bildtitel}: {e}")
        return "", ""


def ausschnitt_erstellen(img_pfad: str, bild_nr: str, teil: int) -> Optional[str]:
    """Schneidet Teil N (1–25) aus einem 5×5-Raster und speichert als JPG."""
    try:
        from PIL import Image
        img_pfad_full = "." + img_pfad if img_pfad.startswith("/") else img_pfad
        if not os.path.exists(img_pfad_full):
            return None
        os.makedirs(REELS_DIR, exist_ok=True)
        with Image.open(img_pfad_full) as img:
            w, h = img.size
            col = (teil - 1) % 5
            row = (teil - 1) // 5
            x1 = int(col * w / 5)
            y1 = int(row * h / 5)
            x2 = int((col + 1) * w / 5)
            y2 = int((row + 1) * h / 5)
            crop = img.crop((x1, y1, x2, y2))
            dateiname = f"{bild_nr}_t{teil}.jpg"
            ausgabe = os.path.join(REELS_DIR, dateiname)
            crop.convert("RGB").save(ausgabe, "JPEG", quality=90)
            return f"/{REELS_DIR}/{dateiname}"
    except Exception as e:
        print(f"  ⚠️  Ausschnitt {teil} fehlgeschlagen: {e}")
        return None


def erster_satz(text: str) -> str:
    for sep in (".", "!", "?"):
        idx = text.find(sep)
        if idx != -1:
            return text[: idx + 1].strip()
    return text[:120].strip()


def hashtags_fuer_werk(bild: Bild, kuenstler: Kuenstler | None) -> str:
    tags = [HASHTAGS_BASIS]
    if kuenstler and kuenstler.db_ort:
        ort_tag = "#" + kuenstler.db_ort.replace(" ", "").replace("-", "")
        tags.append(ort_tag)
    if bild.genre:
        genre_map = {
            "Abstrakt": "#AbstractArt",
            "Portrait": "#PortraitArt",
            "Landschaft": "#Landschaftsmalerei",
            "Stilleben": "#StillLife",
            "Menschen": "#FigurativeArt",
            "Pfalz": "#Pfalz",
            "Städte": "#UrbanArt",
            "Akt": "#FigurativeArt",
        }
        genre_val = bild.genre.value if bild.genre else ""
        if genre_val in genre_map:
            tags.append(genre_map[genre_val])
    return " ".join(tags)


def export(mit_ki: bool, limit: int | None, output: str) -> None:
    engine = create_engine(DATABASE_URL)

    with Session(engine) as session:
        query = (
            select(Bild)
            .where(Bild.freigegeben == True)
            .where(Bild.in_ausstellung == True)
            .order_by(Bild.bild_nr)
        )
        bilder = session.exec(query).all()

    if limit:
        bilder = bilder[:limit]

    print(f"✓ {len(bilder)} freigegebene Bilder gefunden")

    rows = []
    for i, bild in enumerate(bilder, 1):
        with Session(engine) as session:
            kuenstler = session.get(Kuenstler, bild.kuenstler_id) if bild.kuenstler_id else None
            zusatzfotos = session.exec(
                select(BildFoto)
                .where(BildFoto.bild_id == bild.id)
                .order_by(BildFoto.reihenfolge)
            ).all()

        kuenstler_name = (
            f"{kuenstler.db_vorname} {kuenstler.db_name}".strip() if kuenstler else "Unbekannt"
        )
        kuenstler_ort = kuenstler.db_ort if kuenstler and kuenstler.db_ort else ""
        kuenstler_zeile = f"{kuenstler_name} · {kuenstler_ort}" if kuenstler_ort else kuenstler_name

        # Fotos
        foto1 = foto_url(bild.bild_url_web)
        foto2 = foto_url(zusatzfotos[0].url) if zusatzfotos else foto1
        kuenstler_foto = foto_url(kuenstler.portrait_foto) if kuenstler and kuenstler.portrait_foto else foto1

        # Bildausschnitte (5×5-Raster, Standard: 7, 14, 23)
        ausschnitte_nrn = STANDARD_AUSSCHNITTE
        ausschnitt_urls = []
        if bild.bild_url_web:
            for teil in ausschnitte_nrn:
                pfad = ausschnitt_erstellen(bild.bild_url_web, bild.bild_nr, teil)
                ausschnitt_urls.append(foto_url(pfad) if pfad else foto1)
        while len(ausschnitt_urls) < 3:
            ausschnitt_urls.append(foto1)

        genre_str = bild.genre.value if bild.genre else ""

        # KI-Felder: bevorzugt redaktionell gepflegte Anmerkung, sonst live generieren (--mit-ki), sonst Fallback
        ki_text = bild.anmerkung_bild or ""
        hook = bild.ki_hook or ""

        if not ki_text or not hook:
            if mit_ki:
                print(f"  [{i}/{len(bilder)}] KI generieren für: {bild.bildtitel}")
                ki_text_neu, hook_neu = ki_hook_und_beschreibung_generieren(bild, kuenstler)
                if not ki_text:
                    ki_text = ki_text_neu
                if not hook:
                    hook = hook_neu
            else:
                # Einfacher Fallback ohne API
                if not ki_text:
                    ki_text = ""
                if not hook:
                    portrait_genres = {"Portrait", "Akt", "Menschen"}
                    hook = "Sie hat einen Namen." if genre_str in portrait_genres else \
                           "Dieser Künstler verwandelt Räume in Museen."

        ki_satz = erster_satz(ki_text) if ki_text else f"{bild.bildtechnik} · {genre_str}"

        rows.append({
            "Bild_Nr":            format_bild_nr(bild.bild_nr),
            "Werktitel":          bild.bildtitel,
            "Hook":               hook,
            "Kuenstler_Name":     kuenstler_zeile,
            "Technik":            bild.bildtechnik,
            "Genre":              genre_str,
            "KI_Satz":            ki_satz,
            "KI_Beschreibung":    ki_text,
            "Hashtags":           hashtags_fuer_werk(bild, kuenstler),
            "Ausschnitt_URL_1":   ausschnitt_urls[0],   # Hook-Szene  (00–03s)
            "Ausschnitt_URL_2":   ausschnitt_urls[1],   # 2. Detail   (03–07s)
            "Ausschnitt_URL_3":   ausschnitt_urls[2],   # 3. Detail   (vor Reveal)
            "Foto_URL_1":         foto1,                # Gesamtbild  (Reveal + Beschreibung)
            "Foto_URL_2":         foto2,                # Zusatzfoto  (Künstler-Szene Hintergrund)
            "Kuenstler_Foto_URL": kuenstler_foto,       # Portrait    (Künstler-Szene)
            "Event_Zeile1":       EVENT_ZEILE1,
            "Event_Zeile2":       EVENT_ZEILE2,
            "Event_Zeile3":       EVENT_ZEILE3,
            "CTA":                CTA,
        })

    with open(output, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ CSV exportiert: {output}")
    print(f"   {len(rows)} Werke · {len(rows[0])} Spalten")
    print(f"\nCanva Bulk Create:")
    print(f"   Template → Apps → Bulk Create → CSV hochladen")
    print(f"   Platzhalter-Namen im Template müssen exakt den Spaltenköpfen entsprechen")


def main() -> None:
    parser = argparse.ArgumentParser(description="Canva Reel CSV Export")
    parser.add_argument("--mit-ki", action="store_true", help="KI-Beschreibung generieren (API-Credits)")
    parser.add_argument("--limit", type=int, default=None, help="Max. Anzahl Werke")
    parser.add_argument("--output", default="reel_export.csv", help="Ausgabedatei")
    parser.add_argument("--image-base-url", default=None, help="Basis-URL für Bilder (z.B. https://kunsttage-ludwigshoehe.de)")
    args = parser.parse_args()

    if args.image_base_url:
        global IMAGE_BASE_URL
        IMAGE_BASE_URL = args.image_base_url.rstrip("/")

    if args.mit_ki:
        print("⚡ KI-Modus aktiv — generiere Beschreibungen via Claude Haiku")
    else:
        print("ℹ️  Ohne KI-Beschreibung (--mit-ki für vollständigen Export)")

    print(f"🖼  Bild-URLs: {IMAGE_BASE_URL}")
    export(mit_ki=args.mit_ki, limit=args.limit, output=args.output)


if __name__ == "__main__":
    main()
