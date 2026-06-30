"use client";
import { useEffect, useState } from "react";
import { getAlleKuenstler } from "@/lib/api";
import { Kuenstler } from "@/lib/types";

export default function DrucklistePage() {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    getAlleKuenstler(true).then(alle => {
      const mitEmail = alle
        .filter(k => !!k.db_email)
        .sort((a, b) => {
          const nrA = parseInt(a.kuenstler_nr ?? "", 10);
          const nrB = parseInt(b.kuenstler_nr ?? "", 10);
          if (!isNaN(nrA) && !isNaN(nrB)) return nrA - nrB;
          if (!isNaN(nrA)) return -1;
          if (!isNaN(nrB)) return 1;
          return (a.db_name ?? "").localeCompare(b.db_name ?? "", "de", { sensitivity: "base" });
        });
      setKuenstler(mitEmail);
      setGeladen(true);
    });
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "druckliste-chrome-hide";
    style.textContent = `
      header { display: none !important; }
      body > footer, body > div > footer { display: none !important; }
      main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("druckliste-chrome-hide")?.remove();
  }, []);

  useEffect(() => {
    if (!geladen) return;
    document.title = "Künstlerliste – Kunsttage 2026";
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [geladen]);

  if (!geladen) return <p style={{ padding: 32, color: "#888" }}>Laden…</p>;

  const heute = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <>
      <div id="no-print-bar">
        <button onClick={() => window.print()}>Drucken / Als PDF</button>
        <button onClick={() => window.close()}>Schließen</button>
        <span id="count">{kuenstler.length} Künstler mit E-Mail</span>
      </div>

      <div id="druckliste">
        <div id="dl-kopf">
          <div>
            <h1>Künstlerliste</h1>
            <p>Kunsttage auf der Ludwigshöhe 2026</p>
          </div>
          <div id="dl-meta">
            <span>{kuenstler.length} Einträge</span>
            <span>Stand: {heute}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th className="col-nr">Nr.</th>
              <th className="col-name">Name</th>
              <th className="col-vorname">Vorname</th>
              <th className="col-email">E-Mail</th>
              <th className="col-tel">Telefon</th>
              <th className="col-center">Typ</th>
              <th className="col-center">Aktiv</th>
              <th className="col-center">Vor Ort</th>
              <th className="col-center">Anspre.</th>
            </tr>
          </thead>
          <tbody>
            {kuenstler.map((k, i) => (
              <tr key={k.id} className={i % 2 === 0 ? "gerade" : ""}>
                <td className="col-nr">{k.kuenstler_nr || "—"}</td>
                <td className="col-name bold">{k.db_name}</td>
                <td className="col-vorname">{k.db_vorname}</td>
                <td className="col-email">{k.db_email}</td>
                <td className="col-tel">{k.db_telefon || ""}</td>
                <td className="col-center">{k.kuenstlertyp === "galerist" ? "G" : "K"}</td>
                <td className="col-center">{k.aktiv ? "✓" : <span className="inaktiv">–</span>}</td>
                <td className="col-center">{k.vor_ort_anwesend ? "✓" : ""}</td>
                <td className="col-center">{k.zur_ausstellung_ansprechen ? "✓" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div id="dl-footer">
          Kunsttage auf der Ludwigshöhe · Lions Club Villa Ludwigshöhe · Nur Künstler mit E-Mail-Adresse (inkl. inaktive)
        </div>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 8.5pt;
          color: #1a1a1a;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        #no-print-bar {
          position: fixed; top: 10px; right: 12px;
          display: flex; align-items: center; gap: 10px; z-index: 999;
        }
        #no-print-bar button {
          padding: 5px 12px; font-size: 12px; border-radius: 4px;
          cursor: pointer; border: 1px solid #ccc; background: #f5f5f5;
        }
        #no-print-bar button:first-child {
          background: #1a3a6b; color: #fff; border-color: #1a3a6b;
        }
        #count { font-size: 12px; color: #555; }

        #druckliste {
          width: 277mm;
          padding: 10mm 12mm 14mm;
          margin: 0 auto;
        }

        #dl-kopf {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 5mm; border-bottom: 1.5px solid #1a3a6b; padding-bottom: 3mm;
        }
        h1 { font-size: 16pt; font-weight: bold; color: #1a3a6b; }
        #dl-kopf p { font-size: 9pt; color: #555; margin-top: 1mm; }
        #dl-meta { text-align: right; font-size: 8pt; color: #666; display: flex; flex-direction: column; gap: 1mm; }

        table {
          width: 100%; border-collapse: collapse;
          font-size: 8pt; line-height: 1.35;
        }
        thead tr {
          background: #1a3a6b;
          color: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        thead th {
          padding: 3px 5px; text-align: left; font-weight: bold; font-size: 7.5pt;
        }
        tbody td { padding: 2.5px 5px; vertical-align: top; }
        tr.gerade td { background: #f0f3f8; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        .col-nr      { width: 5%; text-align: right; color: #666; }
        .col-name    { width: 13%; }
        .col-vorname { width: 10%; }
        .col-email   { width: 26%; }
        .col-tel     { width: 14%; }
        .col-center  { width: 6%; text-align: center; }

        .bold { font-weight: 600; }
        .inaktiv { color: #999; }

        #dl-footer {
          margin-top: 6mm; padding-top: 2mm;
          border-top: 0.5px solid #ccc;
          font-size: 7pt; color: #888; text-align: center;
        }

        @media print {
          #no-print-bar { display: none !important; }
          body { margin: 0; }
          #druckliste { width: 100%; padding: 8mm 10mm 18mm; }
          #dl-footer {
            position: fixed; bottom: 6mm; left: 10mm; right: 10mm;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>
    </>
  );
}
