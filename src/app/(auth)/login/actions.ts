"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { safeCallbackUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validation/auth";

export type LoginFormState = { error?: string };

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  // Validate the requested redirect target to an internal path (no open redirects).
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl")?.toString());

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Neispravni podaci za prijavu ili račun nije dostupan." };
  }

  try {
    // redirect: false so we can choose the destination ourselves; signIn still
    // establishes the session cookie on success.
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Neispravni podaci za prijavu ili račun nije dostupan." };
    }
    throw error;
  }

  // Decide the destination server-side (a single server-action redirect is
  // followed reliably by the client router). A forced password change takes
  // precedence; otherwise return the user to the validated callback URL.
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { mustChangePassword: true },
  });
  redirect(user?.mustChangePassword ? "/promjena-lozinke" : callbackUrl);
}
