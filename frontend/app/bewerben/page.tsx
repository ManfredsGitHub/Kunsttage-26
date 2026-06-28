"use client";
import { useState } from "react";
import { bewerbungEinreichen } from "@/lib/api";

type BewerbungFormData = {
  db_vorname: string;
  db_name: string;
  db_email: string;
  db_telefon: string;
  db_beruf: string;
  db_adresse: string;
  db_plz: string;
  db_ort: string;
  db_webseite: string;
  db_instagram: string;
  db_pinterest: string;
  bewerbungstext: string;
};

const leer: BewerbungFormData = {
  db_vorname: "", db_name: "", db_email: "", db_telefon: "",
  db_beruf: "", db_adresse: "", db_plz: "", db_ort: "",
  db_webseite: "", db_instagram: "", db_pinterest: "", bewerbungstext: "",
};

export default function BewerbenPage() {
  const [form, setForm] = useState<BewerbungFormData>(leer);
  const [laden, setLaden] = useState(false);
  const [erfolg, setErfolg] = useState(false);
  const [fehler, setFehler] = useState("");

  function set(field: keyof BewerbungFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    setLaden(true);
    try {
      await bewerbungEinreichen({
        db_name: form.db_name,
        db_vorname: form.db_vorname,
        db_email: form.db_email,
        db_telefon: form.db_telefon || undefined,
        db_beruf: form.db_beruf || undefined,
        db_adresse: form.db_adresse || undefined,
        db_plz: form.db_plz || undefined,
        db_ort: form.db_ort || undefined,
        db_webseite: form.db_webseite || undefined,
        db_instagram: form.db_instagram || undefined,
        db_pinterest: form.db_pinterest || undefined,
        bewerbungstext: form.bewerbungstext || undefined,
      });
      setErfolg(true);
      setForm(leer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409")) {
        setFehler("Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich über den Login-Bereich an.");
      } else {
        setFehler("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      }
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-sm text-lions-blue font-medium uppercase tracking-widest mb-2">
            Lions Clubs der Südpfalz
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bewerbung als Künstlerin / Künstler
          </h1>
          <p className="text-gray-500 text-sm">
            14. Kunsttage auf der Ludwigshöhe · 17. &amp; 18. Oktober 2026 · Schloss Villa Ludwigshöhe, Edenkoben
          </p>
        </div>

        {erfolg ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Bewerbung eingegangen</h2>
            <p className="text-green-700 text-sm">
              Vielen Dank! Wir prüfen Ihre Bewerbung und melden uns in Kürze bei Ihnen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">

            <section className="space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Persönliche Daten</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vorname *" htmlFor="db_vorname">
                  <input id="db_vorname" required value={form.db_vorname} onChange={set("db_vorname")}
                    placeholder="Maria" className="input" />
                </Field>
                <Field label="Nachname *" htmlFor="db_name">
                  <input id="db_name" required value={form.db_name} onChange={set("db_name")}
                    placeholder="Muster" className="input" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="E-Mail *" htmlFor="db_email">
                  <input id="db_email" required type="email" value={form.db_email} onChange={set("db_email")}
                    placeholder="ihre@email.de" className="input" />
                </Field>
                <Field label="Telefon" htmlFor="db_telefon">
                  <input id="db_telefon" value={form.db_telefon} onChange={set("db_telefon")}
                    placeholder="0621 000000" className="input" />
                </Field>
              </div>
              <Field label="Berufsbezeichnung / Technik" htmlFor="db_beruf">
                <input id="db_beruf" value={form.db_beruf} onChange={set("db_beruf")}
                  placeholder="z.B. Malerin, Bildhauer, Grafik-Designerin" className="input" />
              </Field>
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Adresse</h2>
              <Field label="Straße und Hausnummer" htmlFor="db_adresse">
                <input id="db_adresse" value={form.db_adresse} onChange={set("db_adresse")}
                  placeholder="Musterstraße 1" className="input" />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="PLZ" htmlFor="db_plz">
                  <input id="db_plz" value={form.db_plz} onChange={set("db_plz")}
                    placeholder="76829" className="input" />
                </Field>
                <div className="col-span-2">
                  <Field label="Ort" htmlFor="db_ort">
                    <input id="db_ort" value={form.db_ort} onChange={set("db_ort")}
                      placeholder="Landau" className="input" />
                  </Field>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Online-Präsenz (optional)</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Webseite" htmlFor="db_webseite">
                  <input id="db_webseite" value={form.db_webseite} onChange={set("db_webseite")}
                    placeholder="https://…" className="input" />
                </Field>
                <Field label="Instagram" htmlFor="db_instagram">
                  <input id="db_instagram" value={form.db_instagram} onChange={set("db_instagram")}
                    placeholder="https://instagram.com/…" className="input" />
                </Field>
                <Field label="Pinterest" htmlFor="db_pinterest">
                  <input id="db_pinterest" value={form.db_pinterest} onChange={set("db_pinterest")}
                    placeholder="https://pinterest.de/…" className="input" />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Über Ihre Kunst</h2>
              <Field label="Kurzbeschreibung / Bewerbungstext (optional)" htmlFor="bewerbungstext"
                hint="Was charakterisiert Ihre Arbeit? Welche Techniken oder Themen beschäftigen Sie?">
                <textarea id="bewerbungstext" rows={5} value={form.bewerbungstext} onChange={set("bewerbungstext")}
                  placeholder="Ich arbeite vorwiegend mit Öl auf Leinwand und beschäftige mich mit…"
                  className="input" />
              </Field>
            </section>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-xs text-blue-700">
              Ihre Daten werden ausschließlich für die Durchführung der Kunsttage auf der Ludwigshöhe verwendet
              und nicht an Dritte weitergegeben. Die Teilnahme wird durch ein unabhängiges Gremium entschieden;
              eine Bewerbung ist keine Teilnahmegarantie.
            </div>

            {fehler && <p className="text-red-600 text-sm">{fehler}</p>}

            <button type="submit" disabled={laden}
              className="w-full bg-lions-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50">
              {laden ? "Wird gesendet…" : "Bewerbung einreichen"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.875rem;
          outline: none;
          resize: vertical;
        }
        .input:focus { border-color: #0f2d5e; box-shadow: 0 0 0 2px rgba(15,45,94,0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, htmlFor, children }: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
