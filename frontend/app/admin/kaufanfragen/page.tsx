"use client";
import { useEffect, useState } from "react";
import { getAlleKaufanfragen, kaufanfrageStatusSetzen } from "@/lib/api";
import { Kaufanfrage, KaufanfrageStatus } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";

const STATUS_FARBE: Record<KaufanfrageStatus, string> = {
  Offen: "bg-yellow-100 text-yellow-800",
  Kontaktiert: "bg-blue-100 text-blue-800",
  Abgeschlossen: "bg-green-100 text-green-800",
  Storniert: "bg-red-100 text-red-800",
};

export default function KaufanfragenPage() {
  const [anfragen, setAnfragen] = useState<Kaufanfrage[]>([]);
  const [laden, setLaden] = useState(true);
  const [filter, setFilter] = useState<KaufanfrageStatus | "Alle">("Alle");

  useEffect(() => {
    getAlleKaufanfragen()
      .then(setAnfragen)
      .finally(() => setLaden(false));
  }, []);

  async function statusAendern(id: number, status: KaufanfrageStatus) {
    await kaufanfrageStatusSetzen(id, status);
    setAnfragen(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  const sichtbar = filter === "Alle" ? anfragen : anfragen.filter(a => a.status === filter);

  const offen = anfragen.filter(a => a.status === "Offen").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kaufanfragen</h1>
          <p className="text-sm text-gray-500 mt-1">Online-Kaufabsichten — für Abwicklung über xt:Commerce</p>
        </div>
        {offen > 0 && (
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
            {offen} offen
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["Alle", "Offen", "Kontaktiert", "Abgeschlossen", "Storniert"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === s
                ? "bg-lions-blue text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {laden && <p className="text-gray-400 animate-pulse">Laden…</p>}

      {!laden && sichtbar.length === 0 && (
        <p className="text-gray-500 text-sm">Keine Kaufanfragen vorhanden.</p>
      )}

      <div className="space-y-4">
        {sichtbar.map(a => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-start justify-between p-4 border-b bg-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">#{a.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_FARBE[a.status]}`}>
                    {a.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.erstellt_am).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  {a.bildtitel && <><strong>„{a.bildtitel}"</strong>{a.bild_nr ? ` · ${formatBildNr(a.bild_nr)}` : ""}</>}
                  {a.kuenstler && <span className="text-gray-400"> · {a.kuenstler}</span>}
                  {a.verkaufspreis && <span className="font-medium text-lions-blue ml-2">{a.verkaufspreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>}
                </p>
              </div>
              <select
                value={a.status}
                onChange={(e) => statusAendern(a.id, e.target.value as KaufanfrageStatus)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-lions-blue"
              >
                {(["Offen", "Kontaktiert", "Abgeschlossen", "Storniert"] as KaufanfrageStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="p-4 grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Käufer</h3>
                <table className="text-gray-600 space-y-0.5 w-full">
                  <tbody>
                    {a.anrede && <tr><td className="text-gray-400 w-24 pr-3">Anrede</td><td>{a.anrede}</td></tr>}
                    <tr><td className="text-gray-400 w-24 pr-3">Name</td><td className="font-medium">{a.vorname} {a.name}</td></tr>
                    <tr><td className="text-gray-400 pr-3">E-Mail</td><td><a href={`mailto:${a.email}`} className="text-lions-blue hover:underline">{a.email}</a></td></tr>
                    {a.telefon && <tr><td className="text-gray-400 pr-3">Telefon</td><td><a href={`tel:${a.telefon}`}>{a.telefon}</a></td></tr>}
                    <tr><td className="text-gray-400 pr-3">Adresse</td><td>{a.strasse}<br />{a.plz} {a.ort}<br />{a.land}</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                {a.anmerkung && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Anmerkung</h3>
                    <p className="text-gray-600 bg-gray-50 rounded-md p-2">{a.anmerkung}</p>
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  <a
                    href={`mailto:${a.email}?subject=Ihre Kaufanfrage – ${a.bildtitel ?? ""}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-lions-blue text-white px-3 py-1.5 rounded-md hover:bg-blue-900 transition-colors"
                  >
                    ✉ Käufer kontaktieren
                  </a>
                  <a
                    href="https://shop22.lions-kunsttage.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors ml-2"
                  >
                    → xt:Commerce Shop
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
