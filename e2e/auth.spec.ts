import { expect, test } from "@playwright/test";

import { E2E_EMAIL, E2E_NEW_PASSWORD, E2E_TEMP_PASSWORD } from "./constants";

// Critical flow: a user with a temporary password is forced to change it on
// first login before reaching the dashboard. The E2E user is created/removed
// by the Playwright global setup/teardown.

test("login with a temporary password forces a password change, then reaches the dashboard", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(E2E_EMAIL);
  await page.getByLabel("Lozinka").fill(E2E_TEMP_PASSWORD);
  await page.getByRole("button", { name: "Prijava" }).click();

  // Forced to the password-change page.
  await expect(page).toHaveURL(/promjena-lozinke/);

  await page.getByLabel("Trenutna lozinka").fill(E2E_TEMP_PASSWORD);
  await page.getByLabel("Nova lozinka", { exact: true }).fill(E2E_NEW_PASSWORD);
  await page.getByLabel("Potvrda nove lozinke").fill(E2E_NEW_PASSWORD);
  await page.getByRole("button", { name: "Promijeni lozinku" }).click();

  // After a successful change the user lands on the dashboard.
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Nadzorna ploča" })).toBeVisible();
});

test("wrong password shows an error and does not authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(E2E_EMAIL);
  await page.getByLabel("Lozinka").fill("PogresnaLozinka1");
  await page.getByRole("button", { name: "Prijava" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/login/);
});
