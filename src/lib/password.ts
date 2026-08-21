import { hash, verify } from "@node-rs/argon2";

// Argon2id is the default algorithm in @node-rs/argon2 (see its README).
// Parameters follow the OWASP Password Storage Cheat Sheet recommendation
// for Argon2id: m = 19 MiB, t = 2, p = 1.
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

/** Hash a plaintext password. Runs on the server only. */
export function hashPassword(plainText: string): Promise<string> {
  return hash(plainText, ARGON2_OPTIONS);
}

/** Verify a plaintext password against a stored argon2 hash. */
export function verifyPassword(storedHash: string, plainText: string): Promise<boolean> {
  return verify(storedHash, plainText, ARGON2_OPTIONS);
}
