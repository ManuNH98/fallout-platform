const NODE_ENV_VALUES = ['development', 'test', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENV_VALUES)[number];

export interface AppEnvironment {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  WEB_URL: string;
  DATABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_JWT_SECRET?: string;
  SUPABASE_STORAGE_BUCKET?: string;
}

function parsePort(value: unknown): number {
  const port = value === undefined ? 3001 : Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT debe ser un entero entre 1 y 65535.');
  }

  return port;
}

function parseUrl(name: string, value: unknown): string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${name} debe ser una URL valida.`);
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} debe ser una URL valida.`);
  }
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> & AppEnvironment {
  const nodeEnvironment = environment.NODE_ENV ?? 'development';

  if (
    typeof nodeEnvironment !== 'string' ||
    !NODE_ENV_VALUES.includes(nodeEnvironment as NodeEnvironment)
  ) {
    throw new Error(`NODE_ENV debe ser uno de: ${NODE_ENV_VALUES.join(', ')}.`);
  }

  const webUrl = parseUrl('WEB_URL', environment.WEB_URL);
  const databaseUrl = parseUrl('DATABASE_URL', environment.DATABASE_URL);
  const supabaseUrl = parseUrl('SUPABASE_URL', environment.SUPABASE_URL);

  return {
    ...environment,
    NODE_ENV: nodeEnvironment as NodeEnvironment,
    PORT: parsePort(environment.PORT),
    WEB_URL: webUrl ?? 'http://localhost:3000',
    ...(databaseUrl ? { DATABASE_URL: databaseUrl } : {}),
    ...(supabaseUrl ? { SUPABASE_URL: supabaseUrl } : {}),
  };
}
