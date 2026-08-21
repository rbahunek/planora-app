import { describe, expect, it } from "vitest";

import { safeCallbackUrl } from "@/lib/auth/redirects";

describe("safeCallbackUrl", () => {
  it("allows internal paths (with query)", () => {
    expect(safeCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(safeCallbackUrl("/projekti?status=1")).toBe("/projekti?status=1");
    expect(safeCallbackUrl("/")).toBe("/");
    expect(safeCallbackUrl("  /vrijeme  ")).toBe("/vrijeme");
  });

  it("falls back for empty / missing values", () => {
    expect(safeCallbackUrl(undefined)).toBe("/dashboard");
    expect(safeCallbackUrl(null)).toBe("/dashboard");
    expect(safeCallbackUrl("")).toBe("/dashboard");
  });

  it("blocks off-site and protocol-relative URLs (open redirect)", () => {
    expect(safeCallbackUrl("https://evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("http://evil.com/path")).toBe("/dashboard");
    expect(safeCallbackUrl("//evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("/\\evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("\\\\evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/dashboard");
  });

  it("does not loop back to the login page", () => {
    expect(safeCallbackUrl("/login")).toBe("/dashboard");
    expect(safeCallbackUrl("/login?callbackUrl=%2F")).toBe("/dashboard");
  });

  it("honours a custom fallback", () => {
    expect(safeCallbackUrl(undefined, "/projekti")).toBe("/projekti");
  });
});
