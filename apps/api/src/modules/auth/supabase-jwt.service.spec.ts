import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { webcrypto } from 'node:crypto';
import {
  exportJWK,
  generateKeyPair,
  SignJWT,
  type FetchImplementation,
  type JWK,
  type JWTPayload,
} from 'jose';
import type { AppEnvironment } from '../../config/environment';
import { SupabaseJwtService } from './supabase-jwt.service';

const origin = 'https://project.example';
const subject = '2756a032-021a-4bf7-bab1-a827d6fa9a45';
const session = 'ef2c3b97-b090-423b-9a0a-8c34769e6f11';
let first: Awaited<ReturnType<typeof generateKeyPair>>;
let second: Awaited<ReturnType<typeof generateKeyPair>>;
let publicKeys: JWK[];
let transport: jest.MockedFunction<FetchImplementation>;
let service: SupabaseJwtService;

function claims(): JWTPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: subject,
    session_id: session,
    role: 'authenticated',
    is_anonymous: false,
    iss: `${origin}/auth/v1`,
    aud: 'authenticated',
    iat: now,
    exp: now + 3600,
  };
}
async function token(
  payload: JWTPayload = claims(),
  key = first.privateKey,
  header = { alg: 'ES256', typ: 'JWT', kid: 'primera' },
) {
  return new SignJWT(payload).setProtectedHeader(header).sign(key);
}

beforeAll(async () => {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
  first = await generateKeyPair('ES256', { extractable: true });
  second = await generateKeyPair('ES256', { extractable: true });
});
beforeEach(async () => {
  publicKeys = [
    {
      ...(await exportJWK(first.publicKey)),
      alg: 'ES256',
      use: 'sig',
      kid: 'primera',
    },
  ];
  transport = jest.fn();
  transport.mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify({ keys: publicKeys }))),
  );
  service = new SupabaseJwtService(
    new ConfigService<AppEnvironment, true>({ SUPABASE_URL: origin }),
    transport,
  );
});
afterEach(() => jest.restoreAllMocks());

it('verifica firma real y devuelve solo identidad interna; reutiliza JWKS sin iniciar conexiones al construir', async () => {
  expect(transport).not.toHaveBeenCalled();
  const jwt = await token({ ...claims(), user_metadata: { role: 'ADMIN' } });
  await expect(service.verify(jwt)).resolves.toEqual({
    supabaseUserId: subject,
    sessionId: session,
  });
  await service.verify(jwt);
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport.mock.calls[0][0]).toBe(
    `${origin}/auth/v1/.well-known/jwks.json`,
  );
  expect(transport.mock.calls[0][1].redirect).toBe('manual');
  expect(transport.mock.calls[0][1].headers.has('Authorization')).toBe(false);
  expect(transport.mock.calls[0][1].headers.has('apikey')).toBe(false);
});

it.each([
  ['issuer', { iss: 'https://otro.example/auth/v1' }],
  ['audiencia', { aud: 'otro' }],
  ['caducado', { exp: 1 }],
  ['exp ausente', { exp: undefined }],
  ['iat ausente', { iat: undefined }],
  ['sub ausente', { sub: undefined }],
  ['UUID invalido', { sub: 'no-uuid' }],
  ['sesion ausente', { session_id: undefined }],
  ['sesion invalida', { session_id: 'no-uuid' }],
  ['service_role', { role: 'service_role' }],
  ['anon', { role: 'anon' }],
  ['sin rol', { role: undefined }],
  ['usuario anonimo', { is_anonymous: true }],
  ['indicador anonimo invalido', { is_anonymous: 'false' }],
  ['nbf futuro', { nbf: 9_999_999_999 }],
])('rechaza %s', async (_name, patch) => {
  await expect(
    service.verify(await token({ ...claims(), ...patch })),
  ).rejects.toThrow(UnauthorizedException);
});

it('rechaza un tipo de token inesperado', async () => {
  await expect(
    service.verify(
      await token(claims(), first.privateKey, {
        alg: 'ES256',
        typ: 'otro',
        kid: 'primera',
      }),
    ),
  ).rejects.toThrow(UnauthorizedException);
});

it('rechaza firma ajena y payload manipulado', async () => {
  await expect(
    service.verify(await token(claims(), second.privateKey)),
  ).rejects.toThrow(UnauthorizedException);
  const parts = (await token()).split('.');
  parts[1] = Buffer.from(
    JSON.stringify({ ...claims(), sub: session }),
  ).toString('base64url');
  await expect(service.verify(parts.join('.'))).rejects.toThrow(
    UnauthorizedException,
  );
});

it('rechaza algoritmo simetrico, JWT sin kid y claves API sin consultar JWKS', async () => {
  const hs = await new SignJWT(claims())
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(new Uint8Array(32));
  for (const jwt of [
    hs,
    await token(claims(), first.privateKey, {
      alg: 'ES256',
      typ: 'JWT',
      kid: '',
    }),
    'sb_publishable_prueba',
  ]) {
    await expect(service.verify(jwt)).rejects.toThrow(UnauthorizedException);
  }
  expect(transport).not.toHaveBeenCalled();
});

it('ignora jku del token y usa siempre el origen configurado', async () => {
  const jwt = await new SignJWT(claims())
    .setProtectedHeader({
      alg: 'ES256',
      kid: 'primera',
      typ: 'JWT',
      jku: 'https://atacante.example/jwks',
    })
    .sign(first.privateKey);
  await service.verify(jwt);
  expect(transport.mock.calls[0][0]).toBe(
    `${origin}/auth/v1/.well-known/jwks.json`,
  );
});

it('recarga ante kid nuevo pasado el cooldown y limita las consultas mientras dura', async () => {
  await service.verify(await token());
  const next = await token(claims(), second.privateKey, {
    alg: 'ES256',
    typ: 'JWT',
    kid: 'segunda',
  });
  publicKeys.push({
    ...(await exportJWK(second.publicKey)),
    alg: 'ES256',
    kid: 'segunda',
  });
  await expect(service.verify(next)).rejects.toThrow(UnauthorizedException);
  expect(transport).toHaveBeenCalledTimes(1);
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 30_001);
  await expect(service.verify(next)).resolves.toMatchObject({
    supabaseUserId: subject,
  });
  expect(transport).toHaveBeenCalledTimes(2);
});

it('deja de confiar en una clave retirada al vencer los diez minutos de cache local', async () => {
  const jwt = await token();
  await service.verify(jwt);
  publicKeys = [
    { ...(await exportJWK(second.publicKey)), alg: 'ES256', kid: 'segunda' },
  ];
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 600_001);
  await expect(service.verify(jwt)).rejects.toThrow(UnauthorizedException);
  expect(transport).toHaveBeenCalledTimes(2);
});

it.each(['red', 'HTTP', 'JSON', 'JWKS'])(
  'devuelve 503 sin detalles ante fallo %s del proveedor',
  async (kind) => {
    transport.mockImplementation(() => {
      if (kind === 'red')
        return Promise.reject(new Error('secreto-no-publicar'));
      if (kind === 'HTTP')
        return Promise.resolve(
          new Response('secreto-no-publicar', { status: 503 }),
        );
      return Promise.resolve(
        new Response(kind === 'JSON' ? 'secreto-no-publicar' : '{}'),
      );
    });
    await expect(service.verify(await token())).rejects.toThrow(
      'No se ha podido comprobar la identidad.',
    );
    await expect(service.verify(await token())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  },
);

it('aborta la descarga JWKS a los cinco segundos', async () => {
  transport.mockImplementation(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('timeout')), {
          once: true,
        });
      }),
  );
  await expect(service.verify(await token())).rejects.toThrow(
    ServiceUnavailableException,
  );
  expect(transport.mock.calls[0][1].signal.aborted).toBe(true);
}, 10_000);

it('sin configuracion conserva arranque sin conexion y rechaza verificacion con 503', async () => {
  service = new SupabaseJwtService(
    new ConfigService<AppEnvironment, true>({ SUPABASE_URL: '' }),
    transport,
  );
  await expect(service.verify(await token())).rejects.toThrow(
    ServiceUnavailableException,
  );
  expect(transport).not.toHaveBeenCalled();
});
