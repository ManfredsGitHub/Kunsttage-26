import Link from "next/link";
import MerklisteNavLink from "./MerklisteNavLink";

export default function Header() {
  return (
    <header className="bg-lions-blue text-white print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-bold text-4xl">
            <span className="text-lions-gold">Kunsttage</span>
            <span className="text-white"> auf der Ludwigshöhe</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/veranstaltung" className="hover:text-lions-gold transition-colors">Veranstaltung</Link>
          <Link href="/" className="hover:text-lions-gold transition-colors">Galerie</Link>
          <Link href="/kuenstler" className="hover:text-lions-gold transition-colors">Künstler</Link>
          <MerklisteNavLink />
          <Link
            href="/admin"
            className="opacity-30 hover:opacity-70 transition-opacity text-xs border border-white/30 rounded px-2 py-1"
            title="Verwaltung"
          >
            ⚙
          </Link>
        </nav>
      </div>
    </header>
  );
}
