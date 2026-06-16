"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LoginPage() {
  const [rolle, setRolle] = useState<"admin" | "orga">("admin");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function einloggen(e: React.FormEvent) {
    e.preventDefault();
    if (!passwort) return;
    setFehler("");
    setLoading(true);
    try {
      const resp = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolle, passwort }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setFehler(err.detail ?? "Anmeldung fehlgeschlagen");
        return;
      }
      const { token, stunden } = await resp.json();
      setToken(token, stunden);
      router.push(rolle === "orga" ? "/admin/kasse" : "/admin");
    } catch {
      setFehler("Server nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-lions-blue">Kunsttage 2026</h1>
          <p className="text-gray-500 text-sm mt-1">Verwaltung · Anmeldung</p>
        </div>

        <form onSubmit={einloggen} className="bg-white rounded-lg shadow p-6 space-y-5">

          {/* Rolle */}
          <div className="grid grid-cols-2 gap-2">
            {(["admin", "orga"] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRolle(r)}
                className={`py-2 rounded-md text-sm font-medium border transition-colors ${
                  rolle === r
                    ? "bg-lions-blue text-white border-lions-blue"
                    : "bg-white text-gray-600 border-gray-300 hover:border-lions-blue"
                }`}
              >
                {r === "admin" ? "Admin" : "Orga-Team"}
              </button>
            ))}
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={passwort}
              onChange={e => setPasswort(e.target.value)}
              autoFocus
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
            />
          </div>

          {fehler && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {fehler}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passwort}
            className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>

        {rolle === "orga" && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Orga-Team: Zugriff auf Kasse, Kaufübersicht, Käufer und Bildaufsteller
          </p>
        )}
      </div>
    </div>
  );
}
