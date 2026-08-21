import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { ROLES } from "@/lib/auth/constants";

// Edge-safe middleware instance (authConfig has no Node-only imports).
const { auth } = NextAuth(authConfig);

const LOGIN_PATH = "/login";
const CHANGE_PASSWORD_PATH = "/promjena-lozinke";
const PUBLIC_PATHS = new Set<string>([LOGIN_PATH]);

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  // Auth.js internal routes are always allowed.
  if (path.startsWith("/api/auth")) return;

  // Unauthenticated: allow public paths, otherwise redirect to login.
  if (!isLoggedIn) {
    if (PUBLIC_PATHS.has(path)) return;
    const url = new URL(LOGIN_PATH, nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Authenticated but forced to change password: confine to the change page.
  if (user?.mustChangePassword && path !== CHANGE_PASSWORD_PATH) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl));
  }

  // Already logged in: keep users off the login page.
  if (path === LOGIN_PATH) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Admin area requires the ADMIN role (server-side enforcement).
  if (path.startsWith("/admin") && user?.role !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return;
});

export const config = {
  // Run on all routes except static assets and image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
