const COOKIE = "kt_auth";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getRolle(): "admin" | "orga" | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp < Date.now() / 1000) return null;
    return payload.rolle ?? null;
  } catch {
    return null;
  }
}

export function setToken(token: string, stunden: number) {
  document.cookie =
    `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${stunden * 3600}; SameSite=Strict`;
}

export function logout() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
