"use client";
import { useState } from "react";
import { useMerkliste } from "@/lib/MerklisteContext";

export default function AnmeldeModal() {
  const { showModal, closeModal, anmelden } = useMerkliste();
  const [mode, setMode] = useState<"email" | "telefon">("email");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  if (!showModal) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");
    try {
      await anmelden(
        mode === "email" ? email : undefined,
        mode === "telefon" ? telefon : undefined,
      );
    } catch (err: any) {
      setFehler(err.message || "Fehler beim Anmelden");
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={closeModal}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Merkliste</h2>
            <p className="text-sm text-gray-500 mt-1">
              Speichern Sie Ihre Favoriten und drucken Sie die Liste für die Ausstellung aus.
            </p>
          </div>
          <button onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 ml-4 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["email", "telefon"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
                mode === m
                  ? "bg-lions-blue text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {m === "email" ? "E-Mail" : "Telefon"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "email" ? (
            <input type="email" required placeholder="ihre@email.de"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
              autoFocus />
          ) : (
            <input type="tel" required placeholder="0611 12345"
              value={telefon} onChange={e => setTelefon(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
              autoFocus />
          )}
          {fehler && <p className="text-red-600 text-xs">{fehler}</p>}
          <button type="submit" disabled={laden}
            className="w-full bg-lions-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-900 transition-colors disabled:opacity-50">
            {laden ? "Wird gespeichert…" : "Merkliste starten / anmelden"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Mit der gleichen E-Mail oder Telefonnummer können Sie Ihre Liste jederzeit wiederherstellen.
        </p>
      </div>
    </div>
  );
}
