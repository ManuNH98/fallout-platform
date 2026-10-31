import "server-only";
import type { UserProfileResponse } from "@repo/types";
import { userProfileResponseSchema } from "@repo/validation";

export class PrivateApiError extends Error {
  constructor(readonly status: number) {
    super("No se ha podido consultar el perfil.");
  }
}

export function createPrivateProfileApi(
  apiUrl: string,
  fetcher: typeof fetch = fetch,
) {
  async function call(
    path: "auth/me" | "auth/perfil",
    token: string,
    method: "GET" | "POST",
  ): Promise<UserProfileResponse> {
    try {
      const base = new URL(apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`);
      const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(
        base.hostname,
      );
      if (
        base.username ||
        base.password ||
        base.search ||
        base.hash ||
        (base.protocol !== "https:" && !(base.protocol === "http:" && loopback))
      )
        throw new PrivateApiError(503);
      if (
        token.length > 16_384 ||
        !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
      )
        throw new PrivateApiError(401);
      const response = await fetcher(new URL(path, base), {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok)
        throw new PrivateApiError(
          [401, 403, 404].includes(response.status) ? response.status : 503,
        );
      const parsed = userProfileResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new PrivateApiError(503);
      return parsed.data;
    } catch (error) {
      if (error instanceof PrivateApiError) throw error;
      throw new PrivateApiError(503);
    }
  }
  return {
    read: (token: string) => call("auth/me", token, "GET"),
    synchronize: (token: string) => call("auth/perfil", token, "POST"),
  };
}
