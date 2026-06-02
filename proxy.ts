import { auth } from "@/app/auth";
import { NextResponse } from "next/server";

export async function proxy(req: any) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Permite rotas públicas
  const publicas = ["/api/auth", "/_next", "/favicon.ico"];
  if (publicas.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Se não tem sessão, redireciona para login
  if (!session) {
    const loginUrl = new URL("/api/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
