/** Formatiert eine 7-stellige Bild-Nr. als JJ.KKK.NN (z. B. "2540001" → "25.400.01"). */
export function formatBildNr(nr: string): string {
  const d = nr.replace(/\D/g, "");
  if (d.length === 7) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 7)}`;
  return nr;
}

/** Erzeugt einen aussagekräftigen alt-Text: "Bildtitel – Künstlername – Technik" */
export function bildAlt(bild: {
  bildtitel: string;
  kuenstler?: { db_vorname?: string | null; db_name?: string | null } | null;
  bildtechnik?: string | null;
}): string {
  const parts: string[] = [bild.bildtitel];
  if (bild.kuenstler) {
    const name = `${bild.kuenstler.db_vorname ?? ""} ${bild.kuenstler.db_name ?? ""}`.trim();
    if (name) parts.push(name);
  }
  if (bild.bildtechnik) parts.push(bild.bildtechnik);
  return parts.join(" – ");
}
