"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { getAlleKuenstler, getAlleBilder, kuenstlerAktualisieren } from "@/lib/api";
import { authHeaders } from "@/lib/auth";
import { Kuenstler, Bild } from "@/lib/types";
import { formatBildNr } from "@/lib/utils";
import { EditModal } from "./_components/EditModal";

const API = process.env.NEXT_PUBLIC_API_URL;

// --- Neu-Modal ---
function NeuModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ db_vorname: "", db_name: "", db_email: "", db_telefon: "" });
  const [laden, setLaden] = useState(false);
  const [ergebnis, setErgebnis] = useState<{ portalLink: string } | null>(null);
  const [fehler, setFehler] = useState("");
  const inp = "w-full border rounded-md px-3 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-1 focus:ring-lions-blue";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true); setFehler("");
    try {
      const res = await fetch(`${API}/admin/kuenstler`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...form, db_ident: "" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      const einRes = await fetch(`${API}/admin/kuenstler/${id}/einladen`, { method: "POST", headers: authHeaders() });
      if (!einRes.ok) throw new Error(await einRes.text());
      const { portal_url } = await einRes.json();
      setErgebnis({ portalLink: `${window.location.origin}${portal_url}` });
      onCreated();
    } catch (err: any) { setFehler(err.message); }
    finally { setLaden(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Künstler anlegen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        {!ergebnis ? (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vorname *</label>
                <input required value={form.db_vorname} onChange={e => setForm({...form, db_vorname: e.target.value})} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nachname *</label>
                <input required value={form.db_name} onChange={e => setForm({...form, db_name: e.target.value})} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
              <input type="email" value={form.db_email} onChange={e => setForm({...form, db_email: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
              <input value={form.db_telefon} onChange={e => setForm({...form, db_telefon: e.target.value})} className={inp} />
            </div>
            {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
            <button type="submit" disabled={laden}
              className="w-full bg-lions-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-900 disabled:opacity-50">
              {laden ? "Wird angelegt…" : "Anlegen & Portal-Link generieren"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-green-700 font-medium">Künstler angelegt ✓</p>
            <p className="text-xs text-gray-500">Portal-Link (48h gültig):</p>
            <div className="flex gap-2">
              <input readOnly value={ergebnis.portalLink}
                className="flex-1 border rounded px-2 py-1.5 text-xs font-mono text-gray-600 bg-gray-50 focus:outline-none" />
              <button onClick={() => navigator.clipboard.writeText(ergebnis.portalLink)}
                className="px-3 py-1.5 text-xs bg-lions-blue text-white rounded hover:bg-blue-900">
                Kopieren
              </button>
            </div>
            <button onClick={onClose} className="w-full py-2 text-sm border rounded-md hover:bg-gray-50">Schließen</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Hauptseite ---
export default function AdminKuenstlerPage() {
  const [kuenstler, setKuenstler] = useState<Kuenstler[]>([]);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState("");
  const [editK, setEditK] = useState<Kuenstler | null>(null);
  const [showNeu, setShowNeu] = useState(false);
  const [nurMitEmail, setNurMitEmail] = useState(false);
  const [nurAnwesend, setNurAnwesend] = useState(false);
  const [nurAnsprechen, setNurAnsprechen] = useState(false);
  const [nurMitBildern, setNurMitBildern] = useState(false);
  const [mitInaktiven, setMitInaktiven] = useState(false);
  const [editNrId, setEditNrId] = useState<number | null>(null);
  const [editNrWert, setEditNrWert] = useState("");
  const [sortNr, setSortNr] = useState<"name" | "nr">("name");
  const [bilderByKuenstler, setBilderByKuenstler] = useState<Record<number, Bild[]>>({});
  const [popover, setPopover] = useState<{ id: number; x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState<{ bilder: Bild[]; index: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLaden(true);
    Promise.all([
      getAlleKuenstler(mitInaktiven),
      getAlleBilder(),
    ]).then(([ks, bilder]) => {
      setKuenstler(ks);
      const grouped: Record<number, Bild[]> = {};
      for (const b of bilder) {
        if (!grouped[b.kuenstler_id]) grouped[b.kuenstler_id] = [];
        grouped[b.kuenstler_id].push(b);
      }
      setBilderByKuenstler(grouped);
    }).finally(() => setLaden(false));
  }, [mitInaktiven]);

  const sichtbar = useMemo(() => {
    return kuenstler
      .filter(k => !nurMitEmail || !!k.db_email)
      .filter(k => !nurAnwesend || !!k.vor_ort_anwesend)
      .filter(k => !nurAnsprechen || !!k.zur_ausstellung_ansprechen)
      .filter(k => !nurMitBildern || (bilderByKuenstler[k.id]?.length ?? 0) > 0)
      .filter(k => {
        if (!suche) return true;
        const s = suche.toLowerCase();
        return `${k.db_name} ${k.db_vorname}`.toLowerCase().includes(s)
          || (k.db_email ?? "").toLowerCase().includes(s);
      })
      .sort((a, b) => {
        const aktivDiff = (b.aktiv !== false ? 1 : 0) - (a.aktiv !== false ? 1 : 0);
        if (aktivDiff !== 0) return aktivDiff;
        if (sortNr === "nr") {
          const na = a.kuenstler_nr ?? "￿";
          const nb = b.kuenstler_nr ?? "￿";
          return na.localeCompare(nb) || `${a.db_name}${a.db_vorname}`.localeCompare(`${b.db_name}${b.db_vorname}`);
        }
        return `${a.db_name}${a.db_vorname}`.localeCompare(`${b.db_name}${b.db_vorname}`);
      });
  }, [kuenstler, suche, nurMitEmail, nurAnwesend, nurAnsprechen, nurMitBildern, bilderByKuenstler, sortNr]);

  function handleSaved(updated: Kuenstler) {
    setKuenstler(prev => prev.map(k => k.id === updated.id ? { ...k, ...updated } : k));
    setEditK(null);
  }

  function handleDeleted(id: number) {
    setKuenstler(prev => prev.filter(k => k.id !== id));
    setEditK(null);
  }

  async function saveNr(k: Kuenstler) {
    const nr = editNrWert.trim();
    if (nr === (k.kuenstler_nr ?? "")) { setEditNrId(null); return; }
    setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, kuenstler_nr: nr || undefined } : x));
    setEditNrId(null);
    try {
      await kuenstlerAktualisieren(k.id, { kuenstler_nr: nr || undefined } as any);
    } catch {
      setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, kuenstler_nr: k.kuenstler_nr } : x));
    }
  }

  async function toggleFeld(k: Kuenstler, feld: "vor_ort_anwesend" | "aktiv" | "zur_ausstellung_ansprechen", e: React.MouseEvent) {
    e.stopPropagation();
    const neuerWert = !k[feld];
    setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, [feld]: neuerWert } : x));
    try {
      await kuenstlerAktualisieren(k.id, { [feld]: neuerWert } as any);
    } catch {
      setKuenstler(prev => prev.map(x => x.id === k.id ? { ...x, [feld]: k[feld] } : x));
    }
  }

  if (laden) return <p className="text-gray-400 animate-pulse">Laden…</p>;

  return (
    <div className="space-y-4">
      {editK && <EditModal k={editK} onClose={() => setEditK(null)} onSaved={handleSaved} onDeleted={handleDeleted} />}

      {/* Lightbox */}
      {lightbox && (() => {
        const b = lightbox.bilder[lightbox.index];
        const total = lightbox.bilder.length;
        const go = (delta: number) =>
          setLightbox({ ...lightbox, index: (lightbox.index + delta + total) % total });
        return (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            onKeyDown={e => {
              if (e.key === "ArrowLeft")  { e.stopPropagation(); go(-1); }
              if (e.key === "ArrowRight") { e.stopPropagation(); go(+1); }
              if (e.key === "Escape")     setLightbox(null);
            }}
            tabIndex={-1}
            ref={el => el?.focus()}
          >
            {/* Prev */}
            {total > 1 && (
              <button
                onClick={e => { e.stopPropagation(); go(-1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-xl flex items-center justify-center transition-colors"
              >‹</button>
            )}

            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
                 onClick={e => e.stopPropagation()}>
              {/* Zähler */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-xs text-gray-400 font-mono">{lightbox.index + 1} / {total}</span>
                <button onClick={() => setLightbox(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>

              {b.bild_url_web
                ? <img src={`${API}${b.bild_url_web}`} alt={b.bildtitel}
                       className="w-full max-h-[65vh] object-contain bg-gray-50" />
                : <div className="h-64 flex items-center justify-center text-gray-300 text-5xl bg-gray-50">🖼</div>
              }
              <div className="p-4">
                <p className="font-semibold text-gray-800">{b.bildtitel}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{formatBildNr(b.bild_nr)} · {b.bildtechnik} · {b.genre}</p>
                {b.verkaufspreis && (
                  <p className="text-sm text-lions-blue font-medium mt-1">€ {b.verkaufspreis.toLocaleString("de-DE")}</p>
                )}
              </div>
            </div>

            {/* Next */}
            {total > 1 && (
              <button
                onClick={e => { e.stopPropagation(); go(+1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-xl flex items-center justify-center transition-colors"
              >›</button>
            )}
          </div>
        );
      })()}
      {showNeu && <NeuModal onClose={() => setShowNeu(false)} onCreated={() => {
        setShowNeu(false);
        getAlleKuenstler().then(setKuenstler);
      }} />}

      {/* Kopfzeile */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-lions-blue">Künstler</h1>
        <button onClick={() => setShowNeu(true)}
          className="px-4 py-1.5 bg-lions-blue text-white text-sm font-medium rounded-md hover:bg-blue-900 transition-colors">
          + Künstler anlegen
        </button>
      </div>

      {/* Filter & Suche */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={suche}
          onChange={e => setSuche(e.target.value)}
          placeholder="Name oder E-Mail suchen…"
          className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-lions-blue w-64"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurMitEmail}
            onChange={e => setNurMitEmail(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Nur mit E-Mail
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurAnwesend}
            onChange={e => setNurAnwesend(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Nur Anwesende
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurAnsprechen}
            onChange={e => setNurAnsprechen(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Zur Ausstellung ansprechen
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={nurMitBildern}
            onChange={e => setNurMitBildern(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Nur mit Bildern
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mitInaktiven}
            onChange={e => setMitInaktiven(e.target.checked)}
            className="rounded accent-lions-blue"
          />
          Auch Inaktive
        </label>
        <span className="text-sm text-gray-400">{sichtbar.length} von {kuenstler.length}</span>
        <a
          href="/admin/kuenstler/druckliste"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          title="Künstlerliste drucken (alle mit E-Mail, inkl. inaktive)"
        >
          🖨 Druckliste
        </a>
        {nurAnsprechen && (() => {
          const emails = sichtbar.filter(k => !!k.db_email).map(k => k.db_email!);
          if (emails.length === 0) return null;
          return (
            <button
              onClick={() => navigator.clipboard.writeText(emails.join(", "))}
              className="ml-2 px-3 py-1.5 text-xs bg-lions-blue text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-1.5"
              title={`${emails.length} E-Mail-Adressen in die Zwischenablage`}
            >
              ✉ BCC kopieren ({emails.length})
            </button>
          );
        })()}
      </div>

      {/* Bilder-Popover */}
      {popover && (() => {
        const bilder = bilderByKuenstler[popover.id] ?? [];
        return (
          <div
            ref={popoverRef}
            style={{ position: "absolute", top: popover.y, left: Math.min(popover.x, window.innerWidth - 340), zIndex: 100 }}
            className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-3"
            onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
            onMouseLeave={() => { hideTimer.current = setTimeout(() => setPopover(null), 150); }}
          >
            <p className="text-xs font-semibold text-gray-500 mb-2">{bilder.length} Bild{bilder.length !== 1 ? "er" : ""}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {bilder.slice(0, 12).map((b, i) => (
                <button
                  key={b.id}
                  className="aspect-square rounded overflow-hidden bg-gray-100 relative group cursor-pointer"
                  onClick={() => { setPopover(null); setLightbox({ bilder, index: i }); }}
                  title={b.bildtitel}
                >
                  {b.bild_url_web
                    ? <img src={`${API}${b.bild_url_web}`} alt={b.bildtitel}
                        className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🖼</div>
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-white text-[9px] leading-tight font-mono">{formatBildNr(b.bild_nr)}</span>
                  </div>
                </button>
              ))}
            </div>
            {bilder.length > 12 && (
              <p className="text-xs text-gray-400 mt-2 text-center">+{bilder.length - 12} weitere</p>
            )}
          </div>
        );
      })()}

      {/* Tabelle */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap cursor-pointer select-none hover:text-gray-700"
                  onClick={() => setSortNr(s => s === "nr" ? "name" : "nr")}>
                Nr. {sortNr === "nr" ? "▲" : <span className="text-gray-300">⇅</span>}
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap cursor-pointer select-none hover:text-gray-700"
                  onClick={() => setSortNr(s => s === "name" ? "nr" : "name")}>
                Name {sortNr === "name" ? "▲" : ""}
              </th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Bilder</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">E-Mail</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Telefon</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Beruf</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Webseite</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Anwesend</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Ansprechen</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Aktiv</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sichtbar.map(k => (
              <tr key={k.id} onClick={() => setEditK(k)}
                className={`cursor-pointer transition-colors ${k.aktiv === false ? "opacity-50 bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50"}`}>
                <td className="px-2 py-1 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {editNrId === k.id ? (
                    <input
                      autoFocus
                      value={editNrWert}
                      onChange={e => setEditNrWert(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      onBlur={() => saveNr(k)}
                      onKeyDown={e => { if (e.key === "Enter") saveNr(k); if (e.key === "Escape") setEditNrId(null); }}
                      className="w-12 border rounded px-1.5 py-0.5 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-lions-blue"
                    />
                  ) : (
                    <button
                      onClick={() => { setEditNrId(k.id); setEditNrWert(k.kuenstler_nr ?? ""); }}
                      className={`w-12 rounded px-1.5 py-0.5 text-xs font-mono text-center border transition-colors ${
                        k.kuenstler_nr
                          ? "font-semibold text-gray-700 border-gray-200 hover:border-lions-blue hover:text-lions-blue"
                          : "text-red-400 border-red-200 hover:border-red-400"
                      }`}
                      title="Klicken zum Bearbeiten"
                    >
                      {k.kuenstler_nr ?? "!"}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {k.db_name}{k.db_vorname ? `, ${k.db_vorname}` : ""}
                  {(k as any).db_leben && <span className="ml-1.5 text-xs font-normal text-gray-400">{(k as any).db_leben}</span>}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {(() => {
                    const bilder = bilderByKuenstler[k.id] ?? [];
                    if (bilder.length === 0) return <span className="text-gray-300 text-xs">—</span>;
                    return (
                      <button
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-lions-blue/10 text-lions-blue hover:bg-lions-blue/20 transition-colors"
                        onMouseEnter={e => {
                          if (hideTimer.current) clearTimeout(hideTimer.current);
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setPopover({ id: k.id, x: rect.left, y: rect.bottom + window.scrollY + 6 });
                        }}
                        onMouseLeave={() => {
                          hideTimer.current = setTimeout(() => setPopover(null), 200);
                        }}
                      >
                        {bilder.length} Bild{bilder.length !== 1 ? "er" : ""}
                      </button>
                    );
                  })()}
                </td>
                <td className="px-3 py-2 text-gray-500 text-xs">{k.db_email ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{(k as any).db_telefon ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{k.db_beruf ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {k.db_webseite
                    ? <a href={k.db_webseite} target="_blank" onClick={e => e.stopPropagation()}
                        className="text-lions-blue hover:underline truncate max-w-32 inline-block">{k.db_webseite}</a>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2 text-center" onClick={e => toggleFeld(k, "vor_ort_anwesend", e)}>
                  <span className={`text-base cursor-pointer select-none ${k.vor_ort_anwesend ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-500"}`}>
                    {k.vor_ort_anwesend ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center" onClick={e => toggleFeld(k, "zur_ausstellung_ansprechen", e)}>
                  <span className={`text-base cursor-pointer select-none ${k.zur_ausstellung_ansprechen ? "text-lions-blue hover:text-red-400" : "text-gray-300 hover:text-lions-blue"}`}>
                    {k.zur_ausstellung_ansprechen ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center" onClick={e => toggleFeld(k, "aktiv", e)}>
                  <span className={`text-base cursor-pointer select-none ${k.aktiv !== false ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-500"}`}>
                    {k.aktiv !== false ? "✓" : "✗"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sichtbar.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Keine Einträge.</p>
        )}
      </div>
    </div>
  );
}
