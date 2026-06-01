"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { getAlleBilder, massenFreigeben, bilderFreigeben, preisSetzen, fotoHochladen, getAlleKuenstler, bildNeuAnlegen, ausstellungToggle, bildAktualisieren, bildLoeschen } from "@/lib/api";
import { Bild, Kuenstler } from "@/lib/types";

const GENRES = ["Abstrakt","Akt","Landschaft","Menschen","Pfalz","Portrait","Städte","Stilleben","Sonstiges"];
type Filter = "alle" | "offen" | "mit_foto" | "ohne_foto" | "online";
type SortKey = "kuenstler" | "titel" | "bild_nr" | "genre" | "einlieferungspreis" | "verkaufspreis";
type SortDir = "asc" | "desc";

function NeuModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Bild) => void }) {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [form, setForm] = useState({
    kuenstler_id: "", bildtitel: "", bildtechnik: "", genre: "Abstrakt",
    breite_rahmen_cm: "", hoehe_rahmen_cm: "", einlieferungspreis: "",
    in_ausstellung: true,
  });
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  useEffect(() => { getAlleKuenstler().then(setKuenstler); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const bild = await bildNeuAnlegen({
        kuenstler_id: Number(form.kuenstler_id),
        bildtitel: form.bildtitel,
        bildtechnik: form.bildtechnik,
        genre: form.genre,
        breite_rahmen_cm: Number(form.breite_rahmen_cm) || 0,
        hoehe_rahmen_cm: Number(form.hoehe_rahmen_cm) || 0,
        einlieferungspreis: form.einlieferungspreis ? Number(form.einlieferungspreis) : undefined,
        in_ausstellung: form.in_ausstellung,
      });
      onCreated(bild);
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  const inp = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue";

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
            <select required value={form.kuenstler_id} onChange={e => setForm({...form, kuenstler_id: e.target.value})} className={inp}>
              <option value="">— bitte wählen —</option>
              {kuenstler.map(k => (
                <option key={k.id} value={k.id}>{k.db_vorname} {k.db_name}</option>
              ))}
            </select>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Breite (cm)</label>
              <input type="number" value={form.breite_rahmen_cm} onChange={e => setForm({...form, breite_rahmen_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Höhe (cm)</label>
              <input type="number" value={form.hoehe_rahmen_cm} onChange={e => setForm({...form, hoehe_rahmen_cm: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Einlief.-Preis (€)</label>
              <input type="number" value={form.einlieferungspreis} onChange={e => setForm({...form, einlieferungspreis: e.target.value})} className={inp} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.in_ausstellung}
              onChange={e => setForm({...form, in_ausstellung: e.target.checked})}
              className="rounded" />
            In der Ausstellung (nicht nur online)
          </label>
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

function EditModal({ bild, onClose, onSaved, onDeleted }: { bild: Bild; onClose: () => void; onSaved: (b: Bild) => void; onDeleted: (id: number) => void }) {
  const [form, setForm] = useState({
    bildtitel: bild.bildtitel,
    bildtechnik: bild.bildtechnik,
    genre: bild.genre,
    breite_rahmen_cm: String(bild.breite_rahmen_cm ?? ""),
    hoehe_rahmen_cm: String(bild.hoehe_rahmen_cm ?? ""),
    breite_cm: String(bild.breite_cm ?? ""),
    hoehe_cm: String(bild.hoehe_cm ?? ""),
    tiefe_cm: String(bild.tiefe_cm ?? ""),
    gewicht_kg: String(bild.gewicht_kg ?? ""),
    einlieferungspreis: String(bild.einlieferungspreis ?? ""),
    verkaufspreis: String(bild.verkaufspreis ?? ""),
    anmerkung_bild: bild.anmerkung_bild ?? "",
    foto_nr: (bild as any).foto_nr ?? "",
    in_ausstellung: bild.in_ausstellung !== false,
    freigegeben: bild.freigegeben ?? false,
    abrechnungsempf: bild.abrechnungsempf ?? "Künstler",
  });
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const [loeschenBestaetigt, setLoeschenBestaetigt] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(bild.bild_url_web ?? "");
  const [fotoLaedt, setFotoLaedt] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const inp = "w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-lions-blue";

  async function handleFotoWechsel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoLaedt(true);
    try {
      const { bild_url_web } = await fotoHochladen(bild.id, file);
      setFotoUrl(bild_url_web);
    } catch (err: any) {
      setFehler(err.message);
    } finally {
      setFotoLaedt(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const updated = await bildAktualisieren(bild.id, {
        bildtitel: form.bildtitel,
        bildtechnik: form.bildtechnik,
        genre: form.genre,
        breite_rahmen_cm: Number(form.breite_rahmen_cm) || 0,
        hoehe_rahmen_cm: Number(form.hoehe_rahmen_cm) || 0,
        ...(form.breite_cm ? { breite_cm: Number(form.breite_cm) } : {}),
        ...(form.hoehe_cm ? { hoehe_cm: Number(form.hoehe_cm) } : {}),
        ...(form.tiefe_cm ? { tiefe_cm: Number(form.tiefe_cm) } : {}),
        ...(form.gewicht_kg ? { gewicht_kg: Number(form.gewicht_kg) } : {}),
        ...(form.einlieferungspreis ? { einlieferungspreis: Number(form.einlieferungspreis) } : {}),
        ...(form.verkaufspreis ? { verkaufspreis: Number(form.verkaufspreis) } : {}),
        anmerkung_bild: form.anmerkung_bild || undefined,
        foto_nr: form.foto_nr || undefined,
        in_ausstellung: form.in_ausstellung,
        freigegeben: form.freigegeben,
        abrechnungsempf: form.abrechnungsempf,
      });
      onSaved(updated);
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Bild bearbeiten</h2>
            <p className="text-xs text-gray-400 font-mono">{bild.bild_nr}</p>
            {bild.kuenstler && (
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {bild.kuenstler.db_name}, {bild.kuenstler.db_vorname}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="mb-4">
          <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoWechsel} />
          {fotoUrl ? (
            <div className="relative group cursor-pointer w-fit mx-auto" onClick={() => fotoInputRef.current?.click()}>
              <img
                src={`http://localhost:8000${fotoUrl}`}
                alt={bild.bildtitel}
                className="max-h-48 rounded-lg object-contain shadow"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Foto ersetzen</span>
              </div>
              {fotoLaedt && (
                <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500 animate-pulse">Wird hochgeladen…</span>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => fotoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-6 text-sm text-gray-400 hover:border-lions-blue hover:text-lions-blue transition-colors">
              {fotoLaedt ? "Wird hochgeladen…" : "+ Foto hochladen"}
            </button>
          )}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Titel *</label>
              <input required value={form.bildtitel} onChange={e => setForm({...form, bildtitel: e.target.value})} className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Anmerkung</label>
              <textarea rows={2} value={form.anmerkung_bild} onChange={e => setForm({...form, anmerkung_bild: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Technik *</label>
              <input required value={form.bildtechnik} onChange={e => setForm({...form, bildtechnik: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Genre *</label>
              <select required value={form.genre} onChange={e => setForm({...form, genre: e.target.value as any})} className={inp}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Maße mit Rahmen (cm)</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Breite" value={form.breite_rahmen_cm} onChange={e => setForm({...form, breite_rahmen_cm: e.target.value})} className={inp} />
              <input type="number" placeholder="Höhe" value={form.hoehe_rahmen_cm} onChange={e => setForm({...form, hoehe_rahmen_cm: e.target.value})} className={inp} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Maße ohne Rahmen (cm)</p>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="Breite" value={form.breite_cm} onChange={e => setForm({...form, breite_cm: e.target.value})} className={inp} />
              <input type="number" placeholder="Höhe" value={form.hoehe_cm} onChange={e => setForm({...form, hoehe_cm: e.target.value})} className={inp} />
              <input type="number" placeholder="Tiefe" value={form.tiefe_cm} onChange={e => setForm({...form, tiefe_cm: e.target.value})} className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gewicht (kg)</label>
              <input type="number" step="0.1" value={form.gewicht_kg} onChange={e => setForm({...form, gewicht_kg: e.target.value})} className={inp} />
            </div>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Foto-Nr.</label>
              <input value={form.foto_nr} onChange={e => setForm({...form, foto_nr: e.target.value})} className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Abrechnung über</label>
              <select value={form.abrechnungsempf} onChange={e => setForm({...form, abrechnungsempf: e.target.value as any})} className={inp}>
                <option value="Künstler">Künstler</option>
                <option value="Galerist">Galerist / Sammler</option>
                <option value="Lions">Lions</option>
              </select>
            </div>
            <div className="flex gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.in_ausstellung} onChange={e => setForm({...form, in_ausstellung: e.target.checked})} className="rounded" />
                In der Ausstellung
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.freigegeben} onChange={e => setForm({...form, freigegeben: e.target.checked})} className="rounded" />
                Freigegeben
              </label>
            </div>
          </div>

          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}

          <div className="flex items-center justify-between pt-2 border-t">
            {loeschenBestaetigt ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Wirklich löschen?</span>
                <button type="button" onClick={async () => { await bildLoeschen(bild.id); onDeleted(bild.id); }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                  Ja, löschen
                </button>
                <button type="button" onClick={() => setLoeschenBestaetigt(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 border rounded-md hover:bg-gray-50">
                  Abbrechen
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setLoeschenBestaetigt(true)}
                className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-md hover:bg-red-50">
                Bild löschen
              </button>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50">Abbrechen</button>
              <button type="submit" disabled={laden} className="px-4 py-2 text-sm bg-lions-blue text-white rounded-md hover:bg-blue-900 disabled:opacity-50">
                {laden ? "Wird gespeichert…" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBilderPage() {
  const [bilder, setBilder] = useState<Bild[]>([]);
  const [preise, setPreise] = useState<Record<number, string>>({});
  const [auswahl, setAuswahl] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<Filter>("offen");
  const [sortKey, setSortKey] = useState<SortKey>("kuenstler");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [kuenstlerFilter, setKuenstlerFilter] = useState<number | null>(null);
  const [kuenstlerImGaleristFilter, setKuenstlerImGaleristFilter] = useState<number | null>(null);
  const [laden, setLaden] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNeu, setShowNeu] = useState(false);
  const [editBild, setEditBild] = useState<Bild | null>(null);

  useEffect(() => {
    getAlleBilder().then(setBilder).finally(() => setLaden(false));
  }, []);

  const gefiltertOhneKuenstler = useMemo(() => {
    switch (filter) {
      case "offen":     return bilder.filter(b => !b.freigegeben);
      case "mit_foto":  return bilder.filter(b => !!b.bild_url_web);
      case "ohne_foto": return bilder.filter(b => !b.bild_url_web);
      case "online":    return bilder.filter(b => b.in_ausstellung === false);
      default:          return bilder;
    }
  }, [bilder, filter]);

  const kuenstlerListe = useMemo(() => {
    const seen = new Map<number, { label: string; isGalerist: boolean }>();
    for (const b of gefiltertOhneKuenstler) {
      if (b.kuenstler && !seen.has(b.kuenstler_id)) {
        seen.set(b.kuenstler_id, { label: `${b.kuenstler.db_name}, ${b.kuenstler.db_vorname}`, isGalerist: false });
      }
      if (b.galerist && b.galerist_id && !seen.has(-b.galerist_id)) {
        seen.set(-b.galerist_id, { label: `${b.galerist.db_name}, ${b.galerist.db_vorname} (Galerist)`, isGalerist: true });
      }
    }
    return [...seen.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label));
  }, [gefiltertOhneKuenstler]);

  const sichtbar = useMemo(() => {
    const gefiltert = gefiltertOhneKuenstler.filter(b => {
      if (kuenstlerFilter === null) return true;
      if (kuenstlerFilter < 0) return b.galerist_id === -kuenstlerFilter;
      return b.kuenstler_id === kuenstlerFilter;
    }).filter(b => kuenstlerImGaleristFilter === null || b.kuenstler_id === kuenstlerImGaleristFilter);
    return [...gefiltert].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortKey) {
        case "kuenstler":
          va = `${a.kuenstler?.db_name ?? ""} ${a.kuenstler?.db_vorname ?? ""}`.toLowerCase();
          vb = `${b.kuenstler?.db_name ?? ""} ${b.kuenstler?.db_vorname ?? ""}`.toLowerCase();
          break;
        case "titel":
          va = a.bildtitel.toLowerCase(); vb = b.bildtitel.toLowerCase(); break;
        case "bild_nr":
          va = a.bild_nr; vb = b.bild_nr; break;
        case "genre":
          va = a.genre; vb = b.genre; break;
        case "einlieferungspreis":
          va = a.einlieferungspreis ?? 0; vb = b.einlieferungspreis ?? 0; break;
        case "verkaufspreis":
          va = a.verkaufspreis ?? 0; vb = b.verkaufspreis ?? 0; break;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [gefiltertOhneKuenstler, sortKey, sortDir, kuenstlerFilter, kuenstlerImGaleristFilter]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-lions-blue ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const alleAusgewaehlt = sichtbar.length > 0 && sichtbar.every(b => auswahl.has(b.id));

  function toggleAlle() {
    setAuswahl(alleAusgewaehlt ? new Set() : new Set(sichtbar.map(b => b.id)));
  }

  function toggleBild(id: number) {
    const next = new Set(auswahl);
    next.has(id) ? next.delete(id) : next.add(id);
    setAuswahl(next);
  }

  const alleAuswahlFreigegeben = auswahl.size > 0 &&
    [...auswahl].every(id => bilder.find(b => b.id === id)?.freigegeben);

  async function handleMassenfreigabe() {
    if (!auswahl.size || saving) return;
    setSaving(true);
    const neuerWert = !alleAuswahlFreigegeben;
    try {
      await massenFreigeben(Array.from(auswahl), neuerWert);
      const ids = new Set(auswahl);
      setBilder(prev => prev.map(b => ids.has(b.id) ? { ...b, freigegeben: neuerWert } : b));
      setAuswahl(new Set());
    } finally {
      setSaving(false);
    }
  }

  async function handleFreigeben(id: number) {
    await bilderFreigeben(id);
    setBilder(prev => prev.map(b => b.id === id ? { ...b, freigegeben: true } : b));
  }

  async function handleFreigabeToggle(id: number, aktuell: boolean) {
    await bildAktualisieren(id, { freigegeben: !aktuell });
    setBilder(prev => prev.map(b => b.id === id ? { ...b, freigegeben: !aktuell } : b));
  }


  async function handlePreis(id: number) {
    const preis = parseFloat(preise[id] ?? "");
    if (!preis) return;
    await preisSetzen(id, preis);
    setBilder(prev => prev.map(b => b.id === id ? { ...b, verkaufspreis: preis } : b));
  }

  async function handleAusstellungToggle(id: number, inAusstellung: boolean) {
    await ausstellungToggle(id, inAusstellung);
    setBilder(prev => prev.map(b => b.id === id ? { ...b, in_ausstellung: inAusstellung } : b));
  }

  function handleEditSaved(updated: Bild) {
    setBilder(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
    setEditBild(null);
  }

  function handleDeleted(id: number) {
    setBilder(prev => prev.filter(b => b.id !== id));
    setEditBild(null);
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  const freigegebenCount = bilder.filter(b => b.freigegeben).length;
  const mitFotoCount = bilder.filter(b => !!b.bild_url_web).length;

  function handleCreated(b: Bild) {
    setBilder(prev => [b, ...prev]);
    setShowNeu(false);
    setFilter("offen");
  }

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: "alle",      label: "Alle",              count: bilder.length },
    { key: "offen",     label: "Nicht freigegeben", count: bilder.filter(b => !b.freigegeben).length },
    { key: "mit_foto",  label: "Mit Foto",          count: mitFotoCount },
    { key: "ohne_foto", label: "Ohne Foto",         count: bilder.filter(b => !b.bild_url_web).length },
    { key: "online",    label: "Nur Online",        count: bilder.filter(b => b.in_ausstellung === false).length },
  ];

  return (
    <div className="space-y-4">
      {showNeu && <NeuModal onClose={() => setShowNeu(false)} onCreated={handleCreated} />}
      {editBild && <EditModal bild={editBild} onClose={() => setEditBild(null)} onSaved={handleEditSaved} onDeleted={handleDeleted} />}
      {/* Kopfzeile */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-lions-blue">Bildverwaltung</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            {freigegebenCount}/{bilder.length} freigegeben · {mitFotoCount} mit Foto
          </p>
          <button onClick={() => setShowNeu(true)}
            className="px-4 py-1.5 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 transition-colors">
            + Neues Bild
          </button>
        </div>
      </div>

      {/* Filter-Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map(t => (
          <button key={t.key}
            onClick={() => { setFilter(t.key); setAuswahl(new Set()); setKuenstlerFilter(null); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.key
                ? "bg-lions-blue text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-lions-blue"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Aktionsleiste */}
      <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm border gap-4">
        <div className="flex items-center gap-3">
          <input type="checkbox"
            checked={alleAusgewaehlt}
            onChange={toggleAlle}
            className="rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600">
            {auswahl.size > 0 ? `${auswahl.size} ausgewählt` : `${sichtbar.length} Einträge`}
          </span>
          {auswahl.size > 0 && (
            <button onClick={() => setAuswahl(new Set())}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Auswahl aufheben
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Künstler:</label>
          <select
            value={kuenstlerFilter ?? ""}
            onChange={e => { setKuenstlerFilter(e.target.value ? Number(e.target.value) : null); setKuenstlerImGaleristFilter(null); }}
            className="border rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-lions-blue min-w-[200px]"
          >
            <option value="">— Alle Künstler —</option>
            {kuenstlerListe.map(([id, { label }]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          {kuenstlerFilter !== null && (
            <button onClick={() => { setKuenstlerFilter(null); setKuenstlerImGaleristFilter(null); }}
              className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        {kuenstlerFilter !== null && kuenstlerFilter < 0 && (() => {
          const galeristBilder = gefiltertOhneKuenstler.filter(b => b.galerist_id === -kuenstlerFilter);
          const künstlerImGalerist = [...new Map(galeristBilder.filter(b => b.kuenstler).map(b => [b.kuenstler_id, `${b.kuenstler!.db_name}, ${b.kuenstler!.db_vorname}`])).entries()].sort((a,b) => a[1].localeCompare(b[1]));
          return (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">Künstler im Galerist:</label>
              <select
                value={kuenstlerImGaleristFilter ?? ""}
                onChange={e => setKuenstlerImGaleristFilter(e.target.value ? Number(e.target.value) : null)}
                className="border rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-lions-blue min-w-[180px]"
              >
                <option value="">— Alle —</option>
                {künstlerImGalerist.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              {kuenstlerImGaleristFilter !== null && (
                <button onClick={() => setKuenstlerImGaleristFilter(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
          );
        })()}
        <button
          onClick={handleMassenfreigabe}
          disabled={auswahl.size === 0 || saving}
          className={`px-4 py-1.5 text-white text-sm font-medium rounded-md transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            ${alleAuswahlFreigegeben ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}>
          {saving
            ? "Wird gespeichert…"
            : auswahl.size === 0
            ? "— freigeben"
            : alleAuswahlFreigegeben
            ? `${auswahl.size} Freigabe zurückziehen`
            : `${auswahl.size} freigeben`}
        </button>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-2 py-2 w-8"></th>
              <th className="px-2 py-2 text-left whitespace-nowrap cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("bild_nr")}>
                Nr.<SortIcon col="bild_nr" />
              </th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("kuenstler")}>
                Künstler<SortIcon col="kuenstler" />
              </th>
              <th className="px-2 py-2 text-center">Foto</th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-gray-700" style={{minWidth:"200px"}} onClick={() => handleSort("titel")}>
                Titel<SortIcon col="titel" />
              </th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-gray-700" style={{width:"120px",maxWidth:"120px"}} onClick={() => handleSort("genre")}>
                Technik · Genre<SortIcon col="genre" />
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                <div>Maße (cm)</div>
                <div className="font-normal normal-case text-gray-400">B × H × (T)</div>
              </th>
              <th className="px-2 py-2 text-center whitespace-nowrap">Status · Ausst.</th>
              <th className="px-2 py-2 text-right cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("einlieferungspreis")}>
                <div>Einlief.<SortIcon col="einlieferungspreis" /></div>
                <div>Vorschlag</div>
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("verkaufspreis")}>
                <div>Verkauf<SortIcon col="verkaufspreis" /></div>
                <div className="font-normal normal-case text-gray-400">Euro</div>
              </th>
              <th className="px-2 py-2 text-center">Freigabe</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sichtbar.map(b => (
              <tr key={b.id}
                onClick={() => setEditBild(b)}
                className={`cursor-pointer transition-colors ${
                  auswahl.has(b.id)
                    ? "bg-blue-50 hover:bg-blue-100"
                    : b.freigegeben
                    ? "hover:bg-gray-50"
                    : "bg-yellow-50 hover:bg-yellow-100"
                }`}>
                <td className="px-2 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  <input type="checkbox"
                    checked={auswahl.has(b.id)}
                    onChange={() => toggleBild(b.id)}
                    className="rounded cursor-pointer"
                  />
                </td>
                <td className="px-2 py-1.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                  {b.bild_nr}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {b.kuenstler && (
                    <div className="text-sm font-medium text-gray-700">
                      {b.kuenstler.db_name},
                    </div>
                  )}
                  {b.kuenstler && (
                    <div className="text-xs text-gray-500">
                      {b.kuenstler.db_vorname}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  {b.bild_url_web ? (
                    <img
                      src={`http://localhost:8000${b.bild_url_web}`}
                      alt={b.bildtitel}
                      className="w-9 h-9 object-cover rounded mx-auto"
                    />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-2 py-1.5" style={{minWidth:"200px"}} onClick={e => e.stopPropagation()}>
                  <div className="font-medium leading-tight">{b.bildtitel}</div>
                  {b.anmerkung_bild && (
                    <div className="text-xs text-amber-600 mt-0.5 leading-snug">{b.anmerkung_bild}</div>
                  )}
                </td>
                <td className="px-2 py-1.5" style={{width:"120px",maxWidth:"120px"}}>
                  <div className="text-xs text-gray-600 truncate">{b.bildtechnik || "—"}</div>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-0.5 inline-block">
                    {b.genre}
                  </span>
                  {b.abrechnungsempf && b.abrechnungsempf !== "Künstler" && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
                      b.abrechnungsempf === "Galerist" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {b.abrechnungsempf}
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right text-xs text-gray-600 whitespace-nowrap">
                  <div>
                    {b.breite_rahmen_cm && b.hoehe_rahmen_cm
                      ? `${b.breite_rahmen_cm} × ${b.hoehe_rahmen_cm}`
                      : "—"}
                  </div>
                  {(b.breite_cm || b.hoehe_cm || b.tiefe_cm) && (
                    <div className="text-gray-400">
                      {[b.breite_cm, b.hoehe_cm, b.tiefe_cm]
                        .filter(v => v != null)
                        .join(" × ")}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.verfuegbarkeit === "Verfügbar"  ? "bg-green-100 text-green-700" :
                    b.verfuegbarkeit === "Reserviert" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{b.verfuegbarkeit}</span>
                  <div className="mt-1">
                    <button
                      onClick={() => handleAusstellungToggle(b.id, !(b.in_ausstellung !== false))}
                      title={b.in_ausstellung !== false ? "In Ausstellung — klicken für Online-only" : "Nur Online — klicken für Ausstellung"}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        b.in_ausstellung !== false
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}>
                      {b.in_ausstellung !== false ? "Ausst." : "Online"}
                    </button>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right text-gray-500 whitespace-nowrap">
                  <div>{b.einlieferungspreis ? `${b.einlieferungspreis} €` : "—"}</div>
                  <div className="text-gray-400">{b.verkaufspreis_vorschlag ? `${b.verkaufspreis_vorschlag} €` : "—"}</div>
                </td>
                <td className="px-2 py-1.5 text-right" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    value={preise[b.id] ?? b.verkaufspreis ?? ""}
                    onChange={e => setPreise({ ...preise, [b.id]: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handlePreis(b.id)}
                    className="w-16 border rounded px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-lions-blue"
                    placeholder="€"
                    title="Enter zum Speichern"
                  />
                </td>
                <td className="px-2 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); handleFreigabeToggle(b.id, !!b.freigegeben); }}
                    title={b.freigegeben ? "Freigabe zurückziehen" : "Freigeben"}
                    className={`text-xs px-2 py-1 rounded transition-colors whitespace-nowrap ${
                      b.freigegeben
                        ? "text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700"
                        : "bg-lions-blue text-white hover:bg-blue-900"
                    }`}>
                    {b.freigegeben ? "✓ Freigegeben" : "Freigeben"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sichtbar.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            Keine Einträge für diesen Filter.
          </p>
        )}
      </div>
    </div>
  );
}
