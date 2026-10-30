import "server-only";
import { createClient } from "../../lib/supabase/server";
import { webEnvironment } from "../../lib/env";
import { createPrivateProfileApi } from "../../lib/api/private-profile";
import type { AuthDependencies } from "./core";

export function authDependencies(writableCookies: boolean): AuthDependencies {
  return {
    client: () => createClient({ writableCookies }),
    api: createPrivateProfileApi(webEnvironment.apiUrl),
  };
}
