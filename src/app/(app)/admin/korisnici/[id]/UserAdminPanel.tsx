"use client";

import { useActionState } from "react";

import { Alert, SubmitButton } from "@/components/forms";
import { roleLabel } from "@/lib/labels";

import {
  generateCredentialsAction,
  toggleBlockAction,
  updateUserAction,
  type BlockFormState,
  type CredentialsFormState,
  type UpdateUserFormState,
} from "../actions";

type PanelUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountStatus: string;
  roleId: string;
};

const inputClass = "input";

const sectionClass = "card flex flex-col gap-4 p-6";

export function UserAdminPanel({
  user,
  roles,
  isSelf,
}: {
  user: PanelUser;
  roles: { id: string; name: string }[];
  isSelf: boolean;
}) {
  const [updateState, updateFormAction] = useActionState<UpdateUserFormState, FormData>(
    updateUserAction,
    {},
  );
  const [credState, credFormAction] = useActionState<CredentialsFormState, FormData>(
    generateCredentialsAction,
    {},
  );
  const [blockState, blockFormAction] = useActionState<BlockFormState, FormData>(
    toggleBlockAction,
    {},
  );

  const isBlocked = user.accountStatus === "BLOCKED";
  const isInactive = user.accountStatus === "INACTIVE";

  return (
    <div className="flex flex-col gap-6">
      {/* Edit name + role */}
      <form action={updateFormAction} className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Podaci korisnika</h2>
        {updateState.error ? <Alert>{updateState.error}</Alert> : null}
        {updateState.message ? <Alert tone="success">{updateState.message}</Alert> : null}
        <input type="hidden" name="userId" value={user.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="label">
              Ime
            </label>
            <input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName}
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="label">
              Prezime
            </label>
            <input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName}
              required
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="roleId" className="label">
            Uloga
          </label>
          <select id="roleId" name="roleId" defaultValue={user.roleId} className={inputClass}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {roleLabel(role.name)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <SubmitButton>Spremi promjene</SubmitButton>
        </div>
      </form>

      {/* Access credentials */}
      <form action={credFormAction} className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Pristupni podaci</h2>
        {credState.error ? <Alert>{credState.error}</Alert> : null}
        {credState.temporaryPassword ? (
          <div className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-sm font-medium text-amber-300">
              Privremena lozinka (prikazuje se samo jednom):
            </p>
            <code className="bg-elevated text-fg block rounded px-3 py-2 font-mono text-lg tracking-wide select-all">
              {credState.temporaryPassword}
            </code>
            <p className="text-xs text-amber-300/80">
              Zabilježite je i sigurno proslijedite korisniku. Korisnik je mora promijeniti pri
              prvoj prijavi.
            </p>
          </div>
        ) : (
          <p className="text-fg-muted text-sm">
            {isInactive
              ? "Račun je neaktivan. Generirajte privremenu lozinku za aktivaciju."
              : "Generiranjem nove privremene lozinke poništava se trenutna."}
          </p>
        )}
        <input type="hidden" name="userId" value={user.id} />
        {!isBlocked ? (
          <div>
            <SubmitButton>
              {isInactive ? "Generiraj pristupne podatke" : "Poništi lozinku i generiraj novu"}
            </SubmitButton>
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            Račun je blokiran — prvo ga odblokirajte.
          </p>
        )}
      </form>

      {/* Block / unblock */}
      <form action={blockFormAction} className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Status računa</h2>
        {blockState.error ? <Alert>{blockState.error}</Alert> : null}
        {blockState.message ? <Alert tone="success">{blockState.message}</Alert> : null}
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="blocked" value={isBlocked ? "false" : "true"} />
        {isSelf ? (
          <p className="text-fg-muted text-sm">Ne možete mijenjati status vlastitog računa.</p>
        ) : (
          <div>
            <SubmitButton>{isBlocked ? "Odblokiraj račun" : "Blokiraj račun"}</SubmitButton>
          </div>
        )}
      </form>
    </div>
  );
}
