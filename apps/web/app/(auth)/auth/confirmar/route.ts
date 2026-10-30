import { confirmEmail } from "@/features/auth/registration";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const destination = await confirmEmail(
    new URL(request.url).searchParams,
    () => createClient({ writableCookies: true }),
  );
  // Location relativo y fijo: no confiar en Host, next ni redirect_to.
  return new Response(null, {
    status: 303,
    headers: {
      Location: destination,
      "Cache-Control": "private, no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
