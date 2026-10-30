"use server";

import { redirect } from "next/navigation";
import { continueSession, login, logout } from "./core";
import { authDependencies } from "./server";
import type { AuthActionState } from "./types";

export async function loginAction(
  _previous: AuthActionState,
  form: FormData,
): Promise<AuthActionState> {
  const result = await login(form, authDependencies(true));
  if (result.kind === "error") return result.state;
  redirect(result.destination);
}
export async function continueAction(
  _previous: AuthActionState,
): Promise<AuthActionState> {
  void _previous;
  const result = await continueSession(authDependencies(true));
  if (result.kind === "error") return result.state;
  redirect(result.destination);
}
export async function logoutAction(
  _previous: AuthActionState,
): Promise<AuthActionState> {
  void _previous;
  const result = await logout(authDependencies(true));
  if (result.kind === "error") return result.state;
  redirect(result.destination);
}
