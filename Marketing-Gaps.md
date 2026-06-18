# Marketing-Gaps: Kunsttage auf der Ludwigshöhe 2026

Ergebnisse aus Landing Page Review, Wettbewerbsanalyse und SEO-Audit (Juni 2026).

---

## 1. Technische SEO-Fixes (vor Go-Live zwingend)

### 1.1 BASEURL in allen maschinellen Outputs
**Problem:** Sitemap, robots.txt, OG-Tags und JSON-LD auf Bild-Seiten zeigen alle auf `localhost:3000` bzw. `localhost:8000` statt auf die Produktionsdomain. Betrifft alle 141 Seiten der Sitemap.

**Aufgabe:**
- `NEXT_PUBLIC_BASE_URL=https://kunsttage-ludwigshoehe.de` als Umgebungsvariable einrichten
- Variable in `sitemap.xml`-Generierung, `metadata`-Exports und JSON-LD-Blöcke einbinden
- OG-Image-URLs auf Produktionspfad umstellen (aktuell `http://localhost:3000/villa.jpg`)
- Bild-Seiten-JSON-LD: `image` und `url` zeigen auf `localhost:8000` → muss Produktions-Upload-Pfad sein

### 1.2 SSR/SSG für `/bilder/[id]`-Seiten
**Problem:** Bild-Detail-Seiten haben exzellente Title, Meta und JSON-LD (VisualArtwork + Offer), aber der sichtbare H1 rendert client-seitig als „Laden…". Google indexiert keinen Werktitel.

**Aufgabe:**
- `generateStaticParams` + `generateMetadata` in `app/bilder/[id]/page.tsx` implementieren
- Werkdaten (Titel, Künstler, Technik, Preis) server-seitig rendern
- 137 Bild-Seiten als Static Pages bauen → Long-Tail-Keywords indexierbar

### 1.3 Canonical Tags auf allen Seiten
**Problem:** Kein `<link rel="canonical">` auf keiner Seite gesetzt.

**Aufgabe:**
- `alternates.canonical` in `generateMetadata` für alle Routen ergänzen
- Format: `https://kunsttage-ludwigshoehe.de/[pfad]`

### 1.4 Duplicate Content auf `/kuenstler`
**Problem:** `/kuenstler` hat identischen Titel und identische Meta-Description wie die Homepage → Duplicate-Content-Signal für Google.

**Aufgabe:**
- Unique Title: `"Künstlerinnen & Künstler | Kunsttage auf der Ludwigshöhe 2026"`
- Unique Meta: Kurzbeschreibung der teilnehmenden Künstler
- Seite in `sitemap.xml` aufnehmen (aktuell nicht enthalten)

### 1.5 `/kuenstler`-Seite SSR
**Problem:** Google sieht nur „Laden…" — Künstlernamen (Long-Tail-Potenzial) nicht indexierbar.

**Aufgabe:**
- Künstlerliste server-seitig rendern
- Jeder Künstlername ist ein potenzielles Keyword (z. B. „Angelika Castelli Kunsttage Pfalz")

### 1.6 Redirect von lions-kunsttage.de
**Problem:** Alle bestehenden Backlinks und die vorhandene Domain-Authority liegen auf `lions-kunsttage.de`. Neue Domain startet bei 0.

**Aufgabe:**
- 301-Redirect von `lions-kunsttage.de` → `kunsttage-ludwigshoehe.de` einrichten
- Überträgt Link-Authority und verhindert Split der Markenbekanntheit

---

## 2. Landing Page / Conversion-Fixes

### 2.1 Hero-Sektion auf der Homepage fehlt
**Problem:** Der erste Viewport der Homepage zeigt nur animierte Buchstaben „Kunsttage" + einen leeren Galerie-Filter mit Skeleton-Loadern. Kein Datum, kein CTA, kein Bild, kein Warum.

**Aufgabe:**
- Hero-Block oberhalb der Galerie einbauen (analog zu `/veranstaltung`, kompakt):
  - Villa-Bild (400 px, mit Gradient-Overlay)
  - Label: „14. Kunsttage auf der Ludwigshöhe" (lions-gold)
  - H1: „Kunst für einen guten Zweck"
  - Datum + „Eintritt frei" prominent
  - CTA-Button: „Bilder entdecken →" + Sekundärlink „Zur Veranstaltung ↗"
- Vorlage liegt fertig in `app/veranstaltung/page.tsx` — Refactor, kein Neuaufbau

### 2.2 Impact-Zahlen auf die Homepage
**Problem:** „100.000 Euro Gesamterlös" und „14 Jahre" stehen nur auf `/veranstaltung`. Die Homepage zeigt kein einziges Trust-Signal.

**Aufgabe:**
- Drei-Spalten-Stat-Leiste zwischen Hero und Galerie einfügen:
  - 14 Jahre Kunsttage
  - 100.000 € für gute Zwecke
  - 5 Lions Clubs Südpfalz

### 2.3 Kein H1 mit vollem Keyword auf der Homepage
**Problem:** Das animierte `<h1>` enthält nur „Kunsttage" — zu dünn für Keyword-Relevanz.

**Aufgabe:**
- H1-Text auf „Kunsttage auf der Ludwigshöhe 2026" erweitern
- Animation auf ein `<span>` innerhalb des H1 verschieben (SEO-neutral)

### 2.4 Merkliste ohne Erklärung
**Problem:** Nav-Eintrag „Merkliste" ist für Erstbesucher bedeutungslos — das Feature wird kaum genutzt.

**Aufgabe:**
- Kurzen Erklärungstext in der Galerie ergänzen: „Bilder vormerken — bei der Veranstaltung gezielt suchen"
- Optional: Tooltip auf Nav-Icon

### 2.5 Bildkarten ohne Reservierungs-CTA
**Problem:** Die Galerie-Karten laden Bilder, bieten aber keine sichtbare Aktion. Die Merkliste ist versteckt.

**Aufgabe:**
- Herz-Icon / „Vormerken"-Button als Hover-State auf Bildkarten einblenden
- Sichtbar auch auf Touch-Geräten (kein reines Hover-only)

### 2.6 Veranstaltungsdetails nicht permanent sichtbar
**Problem:** Datum und „Eintritt frei" sind nur auf `/veranstaltung` zu sehen. Wer direkt auf ein Bild landet, sieht nie wann die Veranstaltung stattfindet.

**Aufgabe:**
- Schmale Info-Leiste unter dem Header auf allen Seiten: „17. & 18. Oktober 2026 · Schloss Villa Ludwigshöhe · Eintritt frei"
- Oder: Datum dauerhaft im Header sichtbar

---

## 3. Wettbewerbs-Positionierung

### 3.1 Online-Katalog als Alleinstellungsmerkmal kommunizieren
**Befund:** Kein einziger Wettbewerber (Lions Frankenthal, art Karlsruhe, Kunsttage Winningen) hat einen öffentlichen Online-Kunstkatalog mit Vormerkungs-Funktion. Diese Infrastruktur existiert bereits — sie wird aber nirgendwo kommuniziert.

**Aufgabe:**
- Auf der Homepage explizit erwähnen: „Bilder vorab online entdecken und vormerken"
- Auf `/veranstaltung` als Feature herausstellen

### 3.2 SEO-Vakuum „Kunsttage Oktober Pfalz" besetzen
**Befund:** Alle sichtbaren Wettbewerber spielen im Mai (Winningen, Landau). Oktober-Kunst-Events in der Pfalz sind bei Google ein offenes Feld — niemand rankt.

**Aufgabe:**
- `/veranstaltung` gezielt auf Keywords optimieren: „Kunstausstellung Oktober Pfalz", „Benefiz Kunstausstellung Südliche Weinstraße", „Kunstkauf Edenkoben"
- Blog-Artikel oder Sektion: „Kunst im Oktober an der Deutschen Weinstraße"

### 3.3 Villa Ludwigshöhe als Destination positionieren
**Befund:** Das Venue — einstige Sommerresidenz König Ludwigs I. — wird nur in einem Nebensatz auf `/veranstaltung` erwähnt. Kunsttage Winningen positioniert ihr Dorf erfolgreich als Galerie; gleiches Potenzial liegt bei der Villa brach.

**Aufgabe:**
- Stärkere Venue-Story auf der Homepage und `/veranstaltung`: historische Bedeutung, einzigartiger Ausstellungsraum
- Bild der Villa mit Bildunterschrift und kurzem Text above the fold

### 3.4 Preistransparenz einführen
**Befund:** Kein Wettbewerber kommuniziert Preisspannen proaktiv. Besucherinnen und Besucher mit Kaufabsicht haben keine Orientierung.

**Aufgabe:**
- Auf der Homepage oder in der Galerie: Preisrange der ausgestellten Werke nennen (z. B. „Werke von 150 bis 2.500 €")
- Filter „Preis bis X €" in der Galerie sichtbar machen

---

## 4. Pre-Launch-Checkliste

| Aufgabe | Priorität | Typ |
|---------|-----------|-----|
| BASEURL-Umgebungsvariable setzen | **Kritisch** | Code |
| Sitemap-URLs auf Produktionsdomain umstellen | **Kritisch** | Code |
| OG-Images und JSON-LD auf Produktionspfade umstellen | **Kritisch** | Code |
| 301-Redirect lions-kunsttage.de → neue Domain | **Hoch** | Infrastruktur |
| Canonical Tags auf allen Seiten | **Hoch** | Code |
| SSR für /bilder/[id] (generateStaticParams) | **Hoch** | Code |
| Hero-Sektion auf der Homepage | **Hoch** | Feature |
| Datum-Leiste sitewide | **Hoch** | Feature |
| Duplicate Title/Meta /kuenstler beheben | **Mittel** | Code |
| /kuenstler SSR + in Sitemap aufnehmen | **Mittel** | Code |
| Impact-Zahlen auf Homepage | **Mittel** | Feature |
| Herz-Icon/Vormerken auf Bildkarten | **Mittel** | Feature |
| H1 Homepage auf volles Keyword erweitern | **Mittel** | Code |
| Keyword-Optimierung /veranstaltung | **Niedrig** | Content |
| Merkliste-Erklärung in Galerie | **Niedrig** | Content |
| Preisrange-Kommunikation | **Niedrig** | Content |

---

## Quellen

- Landing Page Review (localhost:3000) — Juni 2026
- Wettbewerbsanalyse: lions-kunsttage.de, frankenthal.lions.de, art-karlsruhe.de, kunsttage-winningen.de
- SEO-Audit: robots.txt, sitemap.xml, Seitenquelltext, Google-Suche
