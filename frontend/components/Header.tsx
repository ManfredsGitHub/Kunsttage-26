import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-lions-blue text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lions-gold font-bold text-xl tracking-wide">LIONS</span>
          <span className="text-white font-light text-lg">Kunsttage 2026</span>
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-lions-gold transition-colors">Galerie</Link>
          <Link href="/kuenstler" className="hover:text-lions-gold transition-colors">Künstler</Link>
          <Link href="/kuenstler/login" className="hover:text-lions-gold transition-colors">Künstler-Login</Link>
        </nav>
      </div>
    </header>
  );
}
