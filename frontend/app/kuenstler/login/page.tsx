"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyToken } from "@/lib/api";
import { Suspense } from "react";

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"pruefen" | "ok" | "kein_token" | "fehler">("pruefen");

  useEffect(() => {
    if (!token) { setStatus("kein_token"); return; }
    verifyToken(token)
      .then(({ kuenstler_id, name }) => {
        localStorage.setItem("kuenstler_id", String(kuenstler_id));
        localStorage.setItem("kuenstler_name", name);
        setStatus("ok");
        setTimeout(() => router.push("/kuenstler/portal"), 1500);
      })
      .catch(() => setStatus("fehler"));
  }, [token]);

  if (status === "pruefen")
    return <p className="text-gray-500 animate-pulse">Login wird geprüft…</p>;

  if (status === "ok")
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center text-green-800">
        Login erfolgreich. Sie werden weitergeleitet…
      </div>
    );

  if (status === "kein_token")
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center text-blue-800 space-y-2">
        <p className="font-semibold">Künstler-Portal</p>
        <p className="text-sm">Der Zugang erfolgt ausschließlich über Ihren persönlichen Einladungslink.</p>
        <p className="text-sm">Bitte prüfen Sie Ihre E-Mail oder wenden Sie sich an die Veranstaltungsleitung.</p>
      </div>
    );

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center text-red-800 space-y-2">
      <p className="font-semibold">Link ungültig oder abgelaufen.</p>
      <p className="text-sm">Der Einladungslink ist 48 Stunden gültig. Bitte kontaktieren Sie die Veranstaltungsleitung für einen neuen Link.</p>
    </div>
  );
}

export default function KuenstlerLoginPage() {
  return (
    <div className="max-w-md mx-auto pt-16">
      <h1 className="text-2xl font-bold text-lions-blue mb-8 text-center">Künstler-Portal</h1>
      <Suspense fallback={<p className="text-gray-400 animate-pulse">Laden…</p>}>
        <LoginInner />
      </Suspense>
    </div>
  );
}
