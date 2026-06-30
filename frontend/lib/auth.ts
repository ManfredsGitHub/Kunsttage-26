const COOKIE = "kt_auth";

export type Rolle = "admin" | "orga" | "kasse" | "kuenstler";

export interface TokenPayload {
  sub: string;        // nutzer_id
  email: string;
  rolle: Rolle;
  kuenstler_id?: number;
  exp: number;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as TokenPayload;
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getRolle(): Rolle | null {
  return getPayload()?.rolle ?? null;
}

export function getNutzerId(): number | null {
  const p = getPayload();
  return p ? parseInt(p.sub) : null;
}

export function setToken(token: string, stunden: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${stunden * 3600}; SameSite=Strict${secure}`;
}

export function logout() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Künstler-Portal Auth ───────────────────────────────────────────────────────
const KT_TOKEN_KEY = "kt_kuenstler_token";

export function setKuenstlerToken(token: string): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KT_TOKEN_KEY, token);
  }
}

export function getKuenstlerToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(KT_TOKEN_KEY);
}

export function kuenstlerAuthHeaders(): Record<string, string> {
  const token = getKuenstlerToken();
  return token ? { "X-Kuenstler-Token": token } : {};
}

export function logoutKuenstler(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(KT_TOKEN_KEY);
    localStorage.removeItem("kuenstler_id");
    localStorage.removeItem("kuenstler_name");
  }
}

export function redirectNachRolle(rolle: Rolle): string {
  if (rolle === "admin") return "/admin";
  if (rolle === "orga") return "/admin/bilder";
  if (rolle === "kasse") return "/admin/kasse";
  if (rolle === "kuenstler") return "/kuenstler/portal";
  return "/admin";
}
