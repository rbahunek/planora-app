import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { verifyLoginCredentials } from "@/server/auth-service";
import { loginSchema } from "@/validation/auth";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Lozinka", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        return verifyLoginCredentials(parsed.data.email, parsed.data.password);
      },
    }),
  ],
});
