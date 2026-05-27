"use client";
import { Genre } from "@/lib/types";

const GENRES: Genre[] = [
  "Abstrakt", "Akt", "Landschaft", "Menschen",
  "Pfalz", "Portrait", "Städte", "Stilleben", "Sonstiges",
];

interface Props {
  genre: string;
  technik: string;
  onGenre: (v: string) => void;
  onTechnik: (v: string) => void;
}

export default function FilterBar({ genre, technik, onGenre, onTechnik }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center py-4">
      <select
        value={genre}
        onChange={(e) => onGenre(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
      >
        <option value="">Alle Genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Technik suchen…"
        value={technik}
        onChange={(e) => onTechnik(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lions-blue"
      />

      {(genre || technik) && (
        <button
          onClick={() => { onGenre(""); onTechnik(""); }}
          className="text-sm text-lions-blue underline"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
