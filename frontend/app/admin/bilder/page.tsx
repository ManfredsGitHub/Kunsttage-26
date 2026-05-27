"use client";
import { useEffect, useState } from "react";
import { getAlleBilder, bilderFreigeben, preisSetzen } from "@/lib/api";
import { Bild } from "@/lib/types";

export default function AdminBilderPage() {
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [preise, setPreise] = useState<Record<number, string>>({});
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    getAlleBilder().then(setBilder).finally(() => setLaden(false));
  }, []);

  async function handleFreigeben(id: number) {
    await bilderFreigeben(id);
    setBilder((prev) => prev.map((b) => b.id === id ? { ...b, freigegeben: true } : b));
  }

  async function handlePreis(id: number) {
    const preis = parseFloat(preise[id] ?? "");
    if (!preis) return;
    await preisSetzen(id, preis);
    setBilder((prev) => prev.map((b) => b.id === id ? { ...b, verkaufspreis: preis } : b));
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-lions-blue mb-6">Bildverwaltung</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nr.</th>
              <th className="px-4 py-3 text-left">Titel</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Einlief.</th>
              <th className="px-4 py-3 text-right">Vorschlag</th>
              <th className="px-4 py-3 text-right">Verkaufspreis</th>
              <th className="px-4 py-3 text-center">Freigabe</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bilder.map((b) => (
              <tr key={b.id} className={b.freigegeben ? "" : "bg-yellow-50"}>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.bild_nr}</td>
                <td className="px-4 py-3 font-medium">{b.bildtitel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.verfuegbarkeit === "Verfügbar" ? "bg-green-100 text-green-700" :
                    b.verfuegbarkeit === "Reserviert" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{b.verfuegbarkeit}</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {b.einlieferungspreis ? `${b.einlieferungspreis} €` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {b.verkaufspreis_vorschlag ? `${b.verkaufspreis_vorschlag} €` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      value={preise[b.id] ?? b.verkaufspreis ?? ""}
                      onChange={(e) => setPreise({ ...preise, [b.id]: e.target.value })}
                      className="w-20 border rounded px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-lions-blue"
                    />
                    <button onClick={() => handlePreis(b.id)}
                      className="text-xs text-lions-blue underline">setzen</button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {b.freigegeben ? (
                    <span className="text-green-600 text-xs">✓ Freigegeben</span>
                  ) : (
                    <button onClick={() => handleFreigeben(b.id)}
                      className="text-xs bg-lions-blue text-white px-3 py-1 rounded-md hover:bg-blue-900 transition-colors">
                      Freigeben
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
