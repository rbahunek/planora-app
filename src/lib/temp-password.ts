import { randomInt } from "node:crypto";

// Character sets exclude visually ambiguous characters (0/O, 1/l/I).
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGIT = "23456789";
const ALL = UPPER + LOWER + DIGIT;

function pick(set: string): string {
  return set[randomInt(0, set.length)];
}

/**
 * Generate a cryptographically secure temporary password that is guaranteed to
 * contain at least one uppercase letter, one lowercase letter and one digit.
 *
 * The returned plaintext is shown to the administrator only once and must never
 * be persisted, logged, or cached — only its hash is stored.
 */
export function generateTemporaryPassword(length = 16): string {
  if (length < 4) throw new Error("Temporary password length must be at least 4.");

  const chars = [pick(UPPER), pick(LOWER), pick(DIGIT)];
  while (chars.length < length) {
    chars.push(pick(ALL));
  }

  // Fisher–Yates shuffle so the guaranteed characters are not in fixed positions.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
