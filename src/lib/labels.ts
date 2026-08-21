// Croatian display labels for enum-like identifiers (UI is Croatian, data is English).

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  INACTIVE: "Neaktivan",
  ACTIVE: "Aktivan",
  BLOCKED: "Blokiran",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  PROJECT_MANAGER: "Voditelj projekta",
  DEVELOPER: "Programer",
  TESTER: "Tester",
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  USER_CREATED: "Kreiran korisnik",
  ACCOUNT_ACTIVATED: "Račun aktiviran",
  TEMP_PASSWORD_GENERATED: "Generirana privremena lozinka",
  PASSWORD_RESET: "Poništena lozinka",
  PASSWORD_CHANGED: "Promijenjena lozinka",
  ROLE_CHANGED: "Promijenjena uloga",
  ACCOUNT_BLOCKED: "Račun blokiran",
  ACCOUNT_UNBLOCKED: "Račun odblokiran",
  LOGIN_SUCCESS: "Uspješna prijava",
  LOGIN_FAILED: "Neuspješna prijava",
  ACCOUNT_LOCKED: "Račun zaključan",
};

export function roleLabel(name: string): string {
  return ROLE_LABELS[name] ?? name;
}

export function accountStatusLabel(status: string): string {
  return ACCOUNT_STATUS_LABELS[status] ?? status;
}

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}
