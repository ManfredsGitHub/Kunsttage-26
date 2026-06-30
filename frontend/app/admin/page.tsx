"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRolle, type Rolle } from "@/lib/auth";
import { ADMIN_NAV, type NavEintrag } from "@/lib/adminNav";

function KachelLink({ href, label, beschreibung, icon }: NavEintrag) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 h-full">
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-semibold text-gray-900">{label}</h2>
        <p className="text-sm text-gray-500 mt-1">{beschreibung}</p>
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const [rolle, setRolle] = useState<Rolle | null>(null);

  useEffect(() => { setRolle(getRolle()); }, []);

  const sichtbar = ADMIN_NAV.filter(e => e.icon && (!e.rollen || !rolle || e.rollen.includes(rolle)));

  return (
    <div>
      <h1 className="text-2xl font-bold text-lions-blue mb-2">Admin-Dashboard</h1>
      <p className="text-gray-500 mb-8">Kunsttage auf der Ludwigshöhe 2026 · Verwaltung</p>

      <div className="grid sm:grid-cols-3 gap-4">
        {sichtbar.map(k => <KachelLink key={k.href} {...k} />)}
      </div>

      <div className="mt-10 bg-white rounded-lg shadow p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tastaturkürzel</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {[
            { key: "Alt+A", ziel: "Admin-Dashboard" },
            { key: "Alt+B", ziel: "Bildverwaltung" },
            { key: "Alt+K", ziel: "Vor-Ort-Kasse" },
            { key: "Alt+U", ziel: "Kaufübersicht" },
          ].map(({ key, ziel }) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 font-mono text-xs text-gray-700 whitespace-nowrap">{key}</kbd>
              <span className="text-gray-600">{ziel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
