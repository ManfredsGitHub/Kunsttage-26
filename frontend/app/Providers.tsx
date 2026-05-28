"use client";
import { MerklisteProvider } from "@/lib/MerklisteContext";
import AnmeldeModal from "@/components/AnmeldeModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MerklisteProvider>
      {children}
      <AnmeldeModal />
    </MerklisteProvider>
  );
}
