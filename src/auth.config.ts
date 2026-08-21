import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration shared between the middleware (Edge runtime)
 * and the full server config (`src/auth.ts`).
 *
 * IMPORTANT: this file must not import Prisma, argon2, or any Node-only module,
 * because the middleware runs in the Edge runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [], // real providers are added in src/auth.ts
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // On sign-in, copy custom fields from the authorized user into the token.
      if (user) {
        token.userId = user.id as string;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      // Allow server-side session updates (e.g. after a password change).
      if (trigger === "update" && session && typeof session === "object") {
        const next = session as { mustChangePassword?: boolean };
        if (typeof next.mustChangePassword === "boolean") {
          token.mustChangePassword = next.mustChangePassword;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
