"use client";
import { useEffect, useState } from "react";

export default function ImpressumPage() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/einstellungen/impressum`)
      .then(r => r.json())
      .then(d => setText(d.text))
      .catch(() => setText("Impressum konnte nicht geladen werden."));
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {text === null ? (
        <p className="text-gray-400 animate-pulse">Laden…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">{text}</pre>
        </div>
      )}
    </div>
  );
}
