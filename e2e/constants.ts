// Deterministic credentials for the E2E test user (created/removed by the
// Playwright global setup/teardown). No database imports here so this is safe
// to import from spec files running under the Playwright loader.
export const E2E_EMAIL = "e2e-user@planora.test";
export const E2E_TEMP_PASSWORD = "TempE2E123";
export const E2E_NEW_PASSWORD = "NovaLozinka123";
