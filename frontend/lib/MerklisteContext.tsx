"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { merklisteAnmelden, getMerkliste, merklisteHinzufuegen, merklisteEntfernen, merklisteProfilAktualisieren } from "./api";

interface MerklisteContextType {
  token: string | null;
  email: string | null;
  telefon: string | null;
  ids: Set<number>;
  anmelden: (email?: string, telefon?: string) => Promise<void>;
  updateProfil: (email?: string, telefon?: string) => Promise<void>;
  toggle: (bildId: number) => Promise<void>;
  isInList: (bildId: number) => boolean;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MerklisteContext = createContext<MerklisteContextType | null>(null);

export function MerklisteProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [telefon, setTelefon] = useState<string | null>(null);
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const pendingIdRef = useRef<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("merkliste_token");
    if (!t) return;
    setToken(t);
    setEmail(localStorage.getItem("merkliste_email"));
    setTelefon(localStorage.getItem("merkliste_telefon"));
    getMerkliste(t)
      .then(data => {
        setIds(new Set(data.bilder.map((b: any) => b.id)));
        if (data.email) { setEmail(data.email); localStorage.setItem("merkliste_email", data.email); }
        if (data.telefon) { setTelefon(data.telefon); localStorage.setItem("merkliste_telefon", data.telefon); }
      })
      .catch(() => {
        localStorage.removeItem("merkliste_token");
        setToken(null);
      });
  }, []);

  const anmelden = useCallback(async (email?: string, telefon?: string) => {
    const data = await merklisteAnmelden(email, telefon);
    localStorage.setItem("merkliste_token", data.token);
    if (email) localStorage.setItem("merkliste_email", email);
    if (telefon) localStorage.setItem("merkliste_telefon", telefon);
    setToken(data.token);
    setEmail(email ?? null);
    setTelefon(telefon ?? null);
    const list = await getMerkliste(data.token);
    const newIds = new Set<number>(list.bilder.map((b: any) => b.id));
    if (pendingIdRef.current !== null) {
      await merklisteHinzufuegen(data.token, pendingIdRef.current);
      newIds.add(pendingIdRef.current);
      pendingIdRef.current = null;
    }
    setIds(newIds);
    setShowModal(false);
  }, []);

  const toggle = useCallback(async (bildId: number) => {
    if (!token) {
      pendingIdRef.current = bildId;
      setShowModal(true);
      return;
    }
    if (ids.has(bildId)) {
      await merklisteEntfernen(token, bildId);
      setIds(prev => { const n = new Set(prev); n.delete(bildId); return n; });
    } else {
      await merklisteHinzufuegen(token, bildId);
      setIds(prev => new Set([...prev, bildId]));
    }
  }, [token, ids]);

  const updateProfil = useCallback(async (newEmail?: string, newTelefon?: string) => {
    if (!token) return;
    const result = await merklisteProfilAktualisieren(token, { email: newEmail, telefon: newTelefon });
    if (result.email !== undefined) { setEmail(result.email); if (result.email) localStorage.setItem("merkliste_email", result.email); }
    if (result.telefon !== undefined) { setTelefon(result.telefon); if (result.telefon) localStorage.setItem("merkliste_telefon", result.telefon); }
  }, [token]);

  const isInList = useCallback((bildId: number) => ids.has(bildId), [ids]);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => { setShowModal(false); pendingIdRef.current = null; }, []);

  return (
    <MerklisteContext.Provider value={{ token, email, telefon, ids, anmelden, updateProfil, toggle, isInList, showModal, openModal, closeModal }}>
      {children}
    </MerklisteContext.Provider>
  );
}

export function useMerkliste() {
  const ctx = useContext(MerklisteContext);
  if (!ctx) throw new Error("useMerkliste must be within MerklisteProvider");
  return ctx;
}
