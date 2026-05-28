"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface NeuerKuenstler {
  db_vorname: string;
  db_name: string;
  db_email: string;
  db_telefon: string;
}

export default function AdminKuenstlerPage() {
  const [form, setForm] = useState<NeuerKuenstler>({
    db_vorname: "", db_name: "", db_email: "", db_telefon: "",
  });
  const [laden, setLaden] = useState(false);
  const [ergebnis, setErgebnis] = useState<{ id: number; portalUrl: string } | null>(null);
  const [fehler, setFehler] = useState("");

  async function handleAnlegen(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");
    setErgebnis(null);
    try {
      // Künstler anlegen
      const res = await fetch(`${API}/admin/kuenstler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db_vorname: form.db_vorname,
          db_name: form.db_name,
          db_email: form.db_email || null,
          db_telefon: form.db_telefon || null,
          db_ident: "",        // wird server-seitig gesetzt
          bildtechnik: "",     // nicht benötigt für Künstler
          kuenstlertyp: "VorOrt",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();

      // Login-Token generieren
      const einRes = await fetch(`${API}/admin/kuenstler/${id}/einladen`, { method: "POST" });
      if (!einRes.ok) throw new Error(await einRes.text());
      const { portal_url } = await einRes.json();

      setErgebnis({ id, portalUrl: portal_url });
      setForm({ db_vorname: "", db_name: "", db_email: "", db_telefon: "" });
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setLaden(false);
    }
  }

  const portalLink = ergebnis
    ? `${window?.location?.origin ?? "http://localhost:3001"}${ergebnis.portalUrl}`
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-lions-blue">VorOrt-Künstler anlegen</h1>

      <form onSubmit={handleAnlegen} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vorname *</label>
            <input required value={form.db_vorname}
              onChange={e => setForm({ ...form, db_vorname: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nachname *</label>
            <input required value={form.db_name}
              onChange={e => setForm({ ...form, db_name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
          <input type="email" value={form.db_email}
            onChange={e => setForm({ ...form, db_email: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
          <input type="tel" value={form.db_telefon}
            onChange={e => setForm({ ...form, db_telefon: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
        </div>

        {fehler && <p className="text-red-600 text-sm">{fehler}</p>}

        <button type="submit" disabled={laden}
          className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 transition-colors disabled:opacity-50">
          {laden ? "Wird angelegt…" : "Künstler anlegen & Portal-Link generieren"}
        </button>
      </form>

      {ergebnis && portalLink && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-3">
          <p className="font-semibold text-green-800">Künstler angelegt (ID {ergebnis.id})</p>
          <div>
            <p className="text-xs text-gray-500 mb-1">Portal-Link (48h gültig) — per E-Mail oder direkt weitergeben:</p>
            <div className="flex gap-2">
              <input readOnly value={portalLink}
                className="flex-1 border rounded px-3 py-1.5 text-xs bg-white font-mono text-gray-700 focus:outline-none" />
              <button
                onClick={() => navigator.clipboard.writeText(portalLink)}
                className="px-3 py-1.5 bg-lions-blue text-white text-xs rounded hover:bg-blue-900 transition-colors whitespace-nowrap">
                Kopieren
              </button>
            </div>
          </div>
          <a href={portalLink} target="_blank"
            className="inline-block text-xs text-lions-blue hover:underline">
            Portal direkt öffnen →
          </a>
        </div>
      )}
    </div>
  );
}
