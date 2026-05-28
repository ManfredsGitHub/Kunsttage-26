"use client";
import Link from "next/link";
import { useMerkliste } from "@/lib/MerklisteContext";

export default function MerklisteNavLink() {
  const { ids } = useMerkliste();
  return (
    <Link href="/merkliste"
      className="hover:text-lions-gold transition-colors flex items-center gap-1.5">
      Merkliste
      {ids.size > 0 && (
        <span className="bg-lions-gold text-lions-blue text-xs font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[1.2rem] text-center">
          {ids.size}
        </span>
      )}
    </Link>
  );
}
