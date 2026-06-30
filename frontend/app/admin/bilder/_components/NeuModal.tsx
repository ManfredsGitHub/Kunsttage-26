"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { getAlleKuenstler, bildNeuAnlegen, kuenstlerAnlegen } from "@/lib/api";
import { Bild, Kuenstler } from "@/lib/types";

const GENRES = ["Abstrakt","Akt","Landschaft","Menschen","Pfalz","Portrait","Städte","Stilleben","Sonstiges"];

export function NeuModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Bild) => void }) {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [form, setForm] = useState({
    kuenstler_id: "", bildtitel: "", bildtechnik: "", genre: "Abstrakt",
    breite_rahmen_cm: "", hoehe_rahmen_cm: "",
    breite_cm: "", hoehe_cm: "", tiefe_cm: "", gewicht_kg: "",
    einlieferungspreis: "", verkaufspreis: "", anmerkung_bild: "",
    in_ausstellung: true, abrechnungsempf: "Künstler", galerist_id: "",
  });
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [schnellanlage, setSchnellanlage] = useState(false);
  const [neuName, setNeuName] = useState({ vorname: "", name: "" });
  const [neuLaden, setNeuLaden] = useState(false);
  const [neuFehler, setNeuFehler] = useState("");
  const [kuSuche, setKuSuche] = useState("");
  const [kuOffen, setKuOffen] = useState(false);
  const [kuHighlight, setKuHighlight] = useState(-1);
  const kuSucheRef = useRef<HTMLDivElement>(null);
  const kuListRef = useRef<HTMLUListElement>(null);

  useEffect(() => { getAlleKuenstler(true).then(setKuenstler); }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (kuSucheRef.current && !kuSucheRef.current.contains(e.target as Node)) setKuOffen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const gefilterteKuenstler = useMemo(() => {
    setKuHighlight(-1);
    const q = kuSuche.toLowerCase().trim();
    if (!q) return kuenstler.slice(0, 50);
    return kuenstler
      .filter(k => k.db_name.toLowerCase().includes(q) || k.db_vorname.toLowerCase().includes(q) || `${k.db_vorname} ${k.db_name}`.toLowerCase().includes(q))
      .slice(0, 50);
  }, [kuenstler, kuSuche]);

  const ausgewaehlterKuenstler = kuenstler.find(k => String(k.id) === form.kuenstler_id);

  async function kuenstlerSchnellAnlegen() {
    if (!neuName.vorname.trim() || !neuName.name.trim()) return;
    setNeuLaden(true); setNeuFehler("");
    try {
      const result = await kuenstlerAnlegen({ db_vorname: neuName.vorname.trim(), db_name: neuName.name.trim() });
      const liste = await getAlleKuenstler(true);
      setKuenstler(liste);
      setForm(f => ({ ...f, kuenstler_id: String(result.id) }));
      setSchnellanlage(false);
      setNeuName({ vorname: "", name: "" });
    } catch (err: any) { setNeuFehler(err.message); }
    finally { setNeuLaden(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kuenstler_id) { setFehler("Bitte Künstler auswählen"); return; }
    setLaden(true); setFehler("");
    try {
      const bild = await bildNeuAnlegen({
        kuenstler_id: Number(form.kuenstler_id),
        bildtitel: form.bildtitel,
        bildtechnik: form.bildtechnik,
        genre: form.genre,
        breite_rahmen_cm: Number(form.breite_rahmen_cm) || 0,
        hoehe_rahmen_cm: Number(form.hoehe_rahmen_cm) || 0,
        breite_cm: form.breite_cm ? Number(form.breite_cm) : undefined,
        hoehe_cm: form.hoehe_cm ? Number(form.hoehe_cm) : undefined,
        tiefe_cm: form.tiefe_cm ? Number(form.tiefe_cm) : undefined,
        gewicht_kg: form.gewicht_kg ? Number(form.gewicht_kg) : undefined,
        einlieferungspreis: form.einlieferungspreis ? Number(form.einlieferungspreis) : undefined,
        verkaufspreis: form.verkaufspreis ? Number(form.verkaufspreis) : undefined,
        anmerkung_bild: form.anmerkung_bild || undefined,
        in_ausstellung: form.in_ausstellung,
        abrechnungsempf: form.abrechnungsempf,
        galerist_id: form.abrechnungsempf === "Galerist" && form.galerist_id ? Number(form.galerist_id) : undefined,
      });
      onCreated(bild);
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  const inp = "w-full border rounded-md px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lions-blue";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Neues Bild anlegen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Künstler *</label>
            <div className="flex gap-2">
              <div ref={kuSucheRef} className="relative flex-1">
                <input
                  value={kuOffen ? kuSuche : (ausgewaehlterKuenstler ? `${ausgewaehlterKuenstler.db_vorname} ${ausgewaehlterKuenstler.db_name}` : "")}
                  placeholder="Namen suchen…"
                  onChange={e => { setKuSuche(e.target.value); setKuOffen(true); }}
                  onFocus={() => { setKuSuche(""); setKuOffen(true); }}
                  onKeyDown={e => {
                    if (!kuOffen) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const next = Math.min(kuHighlight + 1, gefilterteKuenstler.length - 1);
                      setKuHighlight(next);
                      kuListRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const prev = Math.max(kuHighlight - 1, 0);
                      setKuHighlight(prev);
                      kuListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" });
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (kuHighlight >= 0 && gefilterteKuenstler[kuHighlight]) {
                        const k = gefilterteKuenstler[kuHighlight];
                        setForm(f => ({...f, kuenstler_id: String(k.id)}));
                        setKuOffen(false);
                      }
                    } else if (e.key === "Escape") {
                      setKuOffen(false);
                    }
                  }}
                  autoComplete="off"
                  className={inp}
                />
                {kuOffen && (
                  <ul ref={kuListRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {gefilterteKuenstler.length > 0 ? gefilterteKuenstler.map((k, i) => (
                      <li key={k.id}
                        className={`px-3 py-2 text-sm cursor-pointer ${i === kuHighlight ? "bg-lions-blue text-white" : String(k.id) === form.kuenstler_id ? "bg-blue-50 font-medium text-lions-blue" : "hover:bg-gray-50"}`}
                        onMouseDown={e => { e.preventDefault(); setForm(f => ({...f, kuenstler_id: String(k.id)})); setKuOffen(false); }}
                        onMouseEnter={() => setKuHighlight(i)}>
                        {k.db_vorname} {k.db_name}
                      </li>
                    )) : (
                      <li className="px-3 py-2 text-sm text-gray-400 italic">Keine Treffer</li>
                    )}
                  </ul>
                )}
              </div>
              <button type="button" onClick={() => setSchnellanlage(v => !v)}
                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold leading-none transition-colors"
                title="Neuen Künstler schnell anlegen">+</button>
            </div>
            {schnellanlage && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <p className="text-xs font-medium text-blue-700">Neuen Künstler anlegen</p>
                <div className="grid grid-cols-2 gap-2">
                  <input autoFocus placeholder="Vorname *" value={neuName.vorname}
                    onChange={e => setNeuName(n => ({ ...n, vorname: e.target.value }))}
                    className={inp} />
                  <input placeholder="Nachname *" value={neuName.name}
                    onChange={e => setNeuName(n => ({ ...n, name: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && kuenstlerSchnellAnlegen()}
                    className={inp} />
                </div>
                {neuFehler && <p className="text-red-600 text-xs">{neuFehler}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={kuenstlerSchnellAnlegen} disabled={neuLaden || !neuName.vorname.trim() || !neuName.name.trim()}
                    className="flex-1 bg-lions-blue text-white text-sm py-1.5 rounded-md disabled:opacity-50 hover:bg-blue-900 transition-colors">
                    {neuLaden ? "Wird angelegt…" : "Anlegen"}
                  </button>
                  <button type="button" onClick={() => { setSchnellanlage(false); setNeuName({ vorname: "", name: "" }); setNeuFehler(""); }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Abbrechen</button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bildtitel *</label>
            <input required value={form.bildtitel} onChange={e => setForm({...form, bildtitel: e.target.value})} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Technik *</label>
              <input required value={form.bildtechnik} onChange={e => setForm({...form, bildtechnik: e.target.value})} placeholder="z.B. Acryl auf Leinwand" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Genre *</label>
              <select required value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className={inp}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Anmerkung</label>
            <input value={form.anmerkung_bild} onChange={e => setForm({...form, anmerkung_bild: e.target.value})} className={inp} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Breite m.Rahmen (cm)</label>
              <input type="number" value={form.breite_rahmen_cm} onChange={e => setForm({...form, breite_rahmen_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Höhe m.Rahmen (cm)</label>
              <input type="number" value={form.hoehe_rahmen_cm} onChange={e => setForm({...form, hoehe_rahmen_cm: e.target.value})} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Breite o.Rahmen (cm)</label>
              <input type="number" value={form.breite_cm} onChange={e => setForm({...form, breite_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Höhe o.Rahmen (cm)</label>
              <input type="number" value={form.hoehe_cm} onChange={e => setForm({...form, hoehe_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tiefe (cm)</label>
              <input type="number" value={form.tiefe_cm} onChange={e => setForm({...form, tiefe_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gewicht (kg)</label>
              <input type="number" step="0.1" value={form.gewicht_kg} onChange={e => setForm({...form, gewicht_kg: e.target.value})} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Einlief.-Preis (€)</label>
              <input type="number" value={form.einlieferungspreis} onChange={e => setForm({...form, einlieferungspreis: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Verkaufspreis (€)</label>
              <input type="number" value={form.verkaufspreis} onChange={e => setForm({...form, verkaufspreis: e.target.value})} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Abrechnung über</label>
              <select value={form.abrechnungsempf} onChange={e => setForm({...form, abrechnungsempf: e.target.value, galerist_id: ""})} className={inp}>
                <option value="Künstler">Künstler</option>
                <option value="Galerist">Galerist / Sammler</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.in_ausstellung}
                  onChange={e => setForm({...form, in_ausstellung: e.target.checked})}
                  className="rounded" />
                In der Ausstellung
              </label>
            </div>
          </div>
          {form.abrechnungsempf === "Galerist" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Galerist / Sammler auswählen</label>
              <select required value={form.galerist_id} onChange={e => setForm({...form, galerist_id: e.target.value})} className={inp}>
                <option value="">— bitte wählen —</option>
                {kuenstler.filter(k => k.kuenstlertyp === "galerist").sort((a, b) => a.db_name.localeCompare(b.db_name)).map(k => (
                  <option key={k.id} value={k.id}>{k.db_name}, {k.db_vorname}</option>
                ))}
              </select>
            </div>
          )}
          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
          <button type="submit" disabled={laden}
            className="w-full bg-lions-blue text-white py-2.5 rounded-md font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 mt-2">
            {laden ? "Wird angelegt…" : "Bild anlegen"}
          </button>
        </form>
      </div>
    </div>
  );
}
