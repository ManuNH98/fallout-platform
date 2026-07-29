function parsePublicUrl(
  name: string,
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} debe ser una URL valida.`);
  }
}

const supabaseUrl = parsePublicUrl(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (Boolean(supabaseUrl) !== Boolean(supabaseAnonKey)) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben configurarse juntas.",
  );
}

export const webEnvironment = Object.freeze({
  apiUrl:
    parsePublicUrl("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL) ??
    "http://localhost:3001",
  supabaseUrl,
  supabaseAnonKey,
});
