import type { Metadata } from "next";
import GalerieClient from "./_components/GalerieClient";

export const metadata: Metadata = {
  title: "Kunsttage auf der Ludwigshöhe 2026",
  description:
    "Kunstausstellung und Benefizveranstaltung im Schloss Villa Ludwigshöhe, Edenkoben – Bilder online entdecken, vormerken und vor Ort kaufen. 17. & 18. Oktober 2026. Eintritt frei.",
  alternates: { canonical: "/" },
};

export default function GaleriePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-56 sm:h-72 md:h-80">
        <img
          src="/villa.jpg"
          alt="Säulengang der Schloss Villa Ludwigshöhe"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <p className="absolute bottom-1.5 right-2 text-white/50 text-[10px] leading-none select-none pointer-events-none">
          © GDKE, E. Fischer
        </p>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 px-4 text-center">
          <p className="text-lions-gold font-semibold uppercase tracking-widest text-xs sm:text-sm mb-1">
            14. Kunsttage auf der Ludwigshöhe
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Kunst für einen guten Zweck
          </h1>
          <p className="text-gray-300 text-sm mt-1.5">
            17. &amp; 18. Oktober 2026 · Schloss Villa Ludwigshöhe ·{" "}
            <span className="text-white font-medium">Eintritt frei</span>
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href="#galerie"
              className="bg-lions-gold text-lions-blue font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Bilder entdecken →
            </a>
            <a
              href="/veranstaltung"
              className="text-white text-sm px-4 py-2 rounded-lg border border-white/40 hover:bg-white/10 transition-colors"
            >
              Zur Veranstaltung ↗
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          { zahl: "14", label: "Jahre Kunsttage" },
          { zahl: ">100.000 €", label: "für gute Zwecke" },
          { zahl: "4", label: "Lions-Clubs aus der Pfalz" },
        ].map(({ zahl, label }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-lions-blue">{zahl}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Galerie (Client Component) ── */}
      <GalerieClient />
    </div>
  );
}
