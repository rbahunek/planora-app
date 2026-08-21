import type { DefaultSession } from "next-auth";

// Extend Auth.js types with our custom fields (role, forced password change).
declare module "next-auth" {
  interface User {
    role: string;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }
}

// The JWT interface is declared in @auth/core/jwt (re-exported by next-auth/jwt),
// so the augmentation must target that module to merge correctly.
declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    role: string;
    mustChangePassword: boolean;
  }
}
