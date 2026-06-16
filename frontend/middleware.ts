import { NextRequest, NextResponse } from "next/server";

// Seiten, auf die Orga-Team Zugriff hat
const ORGA_SEITEN = [
  "/admin/bilder/aufsteller",
  "/admin/kasse",
  "/admin/kaufuebersicht",
  "/admin/kaeufer",
];

function decodePayload(token: string): { rolle?: string; exp?: number } | null {
  try {
    const part = token.split(".")[1];
    const json = Buffer.from(part, "base64url").toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("kt_auth")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const payload = decodePayload(token);
  if (!payload?.exp || payload.exp < Date.now() / 1000) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const rolle = payload.rolle;

  if (rolle === "admin") return NextResponse.next();

  if (rolle === "orga") {
    const erlaubt = ORGA_SEITEN.some(s => pathname.startsWith(s));
    if (erlaubt) return NextResponse.next();
    // Orga landet standardmäßig auf der Kasse
    return NextResponse.redirect(new URL("/admin/kasse", request.url));
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
