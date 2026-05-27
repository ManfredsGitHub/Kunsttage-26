"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKuenstlerById, updateProfil, dsgvoEinwilligung } from "@/lib/api";
import { Kuenstler } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function KuenstlerPortalPage() {
  const router = useRouter();
  const [kuenstler, setKuenstler] = useState<Kuenstler | null>(null);
  const [form, setForm] = useState({ db_leben: "", db_kommentar: "", db_ausstellungen: "", db_instagram: "", db_webseite: "" });
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [gespeichert, setGespeichert] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("kuenstler_id");
    if (!id) { router.push("/kuenstler/login"); return; }
    getKuenstlerById(Number(id)).then((k) => {
      setKuenstler(k);
      setForm({
        db_leben: k.db_leben ?? "",
        db_kommentar: k.db_kommentar ?? "",
        db_ausstellungen: k.db_ausstellungen ?? "",
        db_instagram: k.db_instagram ?? "",
        db_webseite: k.db_webseite ?? "",
      });
    });
  }, []);

  async function handleSpeichern(e: React.FormEvent) {
    e.preventDefault();
    if (!kuenstler) return;
    try {
      await updateProfil(kuenstler.id, form);
      if (portraitFile) {
        const fd = new FormData();
        fd.append("file", portraitFile);
        await fetch(`${API}/kuenstler/${kuenstler.id}/portrait`, { method: "POST", body: fd });
      }
      setGespeichert(true);
      setTimeout(() => setGespeichert(false), 3000);
    } catch (err: any) {
      setFehler(err.message);
    }
  }

  async function handleDsgvo() {
    if (!kuenstler) return;
    await dsgvoEinwilligung(kuenstler.id);
    setKuenstler({ ...kuenstler });
    alert("Einwilligung erteilt. Vielen Dank.");
  }

  if (!kuenstler) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-lions-blue mb-2">Ihr Künstler-Portal</h1>
      <p className="text-gray-500 mb-8">{kuenstler.db_vorname} {kuenstler.db_name}</p>

      <form onSubmit={handleSpeichern} className="space-y-5 bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-700 border-b pb-2">Profil bearbeiten</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Portrait-Foto</label>
          {kuenstler.portrait_foto && (
            <img src={`${API}${kuenstler.portrait_foto}`} alt="Portrait" className="w-24 h-24 rounded-full object-cover mb-2" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setPortraitFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600" />
        </div>

        {(["db_leben", "db_kommentar", "db_ausstellungen"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm text-gray-600 mb-1 capitalize">
              {{ db_leben: "Lebenslauf / Ausbildung", db_kommentar: "Künstlerische Aussage / Inspiration", db_ausstellungen: "Ausstellungen & Auszeichnungen" }[field]}
            </label>
            <textarea rows={3} value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Instagram</label>
            <input value={form.db_instagram}
              onChange={(e) => setForm({ ...form, db_instagram: e.target.value })}
              placeholder="https://instagram.com/…"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Webseite</label>
            <input value={form.db_webseite}
              onChange={(e) => setForm({ ...form, db_webseite: e.target.value })}
              placeholder="https://…"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue" />
          </div>
        </div>

        {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
        {gespeichert && <p className="text-green-600 text-sm">Gespeichert!</p>}

        <button type="submit"
          className="bg-lions-blue text-white px-6 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors">
          Profil speichern
        </button>
      </form>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">DSGVO-Einwilligung</h3>
        <p className="text-sm text-yellow-700 mb-3">
          Ich willige ein, dass meine Daten und hochgeladenen Bilder für die Kunsttage 2026 verarbeitet und veröffentlicht werden.
        </p>
        <button onClick={handleDsgvo}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors">
          Einwilligung erteilen
        </button>
      </div>
    </div>
  );
}
