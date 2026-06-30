"use client";

interface FehlermeldungProps {
  fehler: string | null;
  className?: string;
}

export default function Fehlermeldung({ fehler, className = "" }: FehlermeldungProps) {
  if (!fehler) return null;
  return (
    <p className={`text-red-600 text-sm ${className}`}>
      {fehler}
    </p>
  );
}
