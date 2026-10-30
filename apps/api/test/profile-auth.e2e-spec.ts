import type { UserProfileResponse } from '@repo/types';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { webcrypto } from 'node:crypto';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AdminModule } from '../src/modules/admin/admin.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { JWKS_FETCH } from '../src/modules/auth/jwks-fetch.provider';
import { DatabaseService } from '../src/modules/database/database.service';
import { HealthModule } from '../src/modules/health/health.module';
import {
  anotherSubject,
  profileStore,
  sessionId,
  storedProfile,
  subject,
  wireProfile,
} from './helpers/auth-profile';

describe('Perfiles y roles (HTTP, JWT ES256 y persistencia simulada)', () => {
  let app: INestApplication<App>;
  const store = profileStore();
  const getClient = jest.fn();
  let token: string;
  let otherToken: string;
  let expiredToken: string;
  let sign: (sub: string, expiration?: number) => Promise<string>;

  beforeAll(async () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
    const keys = await generateKeyPair('ES256', { extractable: true });
    const jwk = {
      ...(await exportJWK(keys.publicKey)),
      kid: 'perfiles',
      alg: 'ES256',
    };
    sign = (sub, expiration = Math.floor(Date.now() / 1000) + 3600) =>
      new SignJWT({
        sub,
        session_id: sessionId,
        role: 'authenticated',
        is_anonymous: false,
        user_metadata: { role: 'ADMIN', supabaseUserId: anotherSubject },
        app_metadata: { role: 'ADMIN' },
      })
        .setProtectedHeader({ alg: 'ES256', typ: 'JWT', kid: 'perfiles' })
        .setIssuer('https://project.example/auth/v1')
        .setAudience('authenticated')
        .setIssuedAt()
        .setExpirationTime(expiration)
        .sign(keys.privateKey);
    token = await sign(subject);
    otherToken = await sign(anotherSubject);
    expiredToken = await sign(subject, 1);
    const fixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          skipProcessEnv: true,
          load: [() => ({ SUPABASE_URL: 'https://project.example' })],
        }),
        AuthModule,
        AdminModule,
        HealthModule,
      ],
    })
      .overrideProvider(DatabaseService)
      .useValue({ getClient })
      .overrideProvider(JWKS_FETCH)
      .useValue(() =>
        Promise.resolve(new Response(JSON.stringify({ keys: [jwk] }))),
      )
      .compile();
    app = fixture.createNestApplication();
    await app.listen(0, '127.0.0.1');
  });
  beforeEach(() => {
    store.rows.clear();
    store.delegate.findUnique.mockClear();
    store.delegate.upsert.mockClear();
    getClient.mockReset().mockResolvedValue({ userProfile: store.delegate });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('health sigue publico, incluso con DB caida', async () => {
    getClient.mockRejectedValue(new Error('secret-db'));
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
    expect(getClient).not.toHaveBeenCalled();
  });
  it.each(['/auth/me', '/admin/comprobacion'])(
    'sin token rechaza GET %s antes de consultar DB',
    async (path) => {
      await request(app.getHttpServer()).get(path).expect(401);
      expect(getClient).not.toHaveBeenCalled();
    },
  );
  it('sin token rechaza POST /auth/perfil antes de consultar DB', async () => {
    await request(app.getHttpServer()).post('/auth/perfil').expect(401);
    expect(getClient).not.toHaveBeenCalled();
  });
  it('token caducado no crea ni lee perfiles', async () => {
    await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    expect(getClient).not.toHaveBeenCalled();
  });
  it('GET sin perfil responde 404 privado y no crea filas', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect((res.body as { message: string }).message).toBe(
      'El perfil no existe.',
    );
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(store.delegate.upsert).not.toHaveBeenCalled();
  });
  it('POST crea USER por identidad verificada, ignora metadata ADMIN y GET lee el mismo perfil', async () => {
    const created = await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);
    expect(created.body).toEqual(wireProfile());
    expect(created.headers['cache-control']).toBe('private, no-store');
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(created.body as UserProfileResponse);
    expect(store.rows.size).toBe(1);
    expect(created.body).not.toHaveProperty('sessionId');
    expect(created.body).not.toHaveProperty('user_metadata');
  });
  it.each([
    { role: 'ADMIN' },
    { supabaseUserId: anotherSubject },
    { displayName: 'forzado' },
    [],
    { user_metadata: { role: 'ADMIN' } },
  ])('rechaza campos o forma de cuerpo no admitidos: %j', async (body) => {
    await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400);
    expect(store.delegate.upsert).not.toHaveBeenCalled();
    expect(store.rows.size).toBe(0);
  });
  it('rechaza un cuerpo no vacio sin parser JSON', async () => {
    await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${token}`)
      .type('text')
      .send('role=ADMIN')
      .expect(400);
    expect(store.delegate.upsert).not.toHaveBeenCalled();
  });

  it('POST repetido conserva ADMIN y campos existentes, sin aceptar datos externos', async () => {
    store.rows.set(subject, {
      ...storedProfile(subject, 'ADMIN'),
      displayName: 'Habitante',
    });
    const first = await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(first.body as UserProfileResponse);
    expect((first.body as UserProfileResponse).role).toBe('ADMIN');
    expect((first.body as UserProfileResponse).displayName).toBe('Habitante');
    expect((first.body as UserProfileResponse).updatedAt).toBe(
      '2026-10-30T10:00:00.000Z',
    );
  });
  it('sincronizaciones concurrentes devuelven una unica identidad de perfil', async () => {
    const settled = await Promise.allSettled(
      Array.from({ length: 12 }, () =>
        request(app.getHttpServer())
          .post('/auth/perfil')
          .set('Authorization', `Bearer ${token}`)
          .expect(200),
      ),
    );
    expect(settled.every((result) => result.status === 'fulfilled')).toBe(true);
    const responses = settled
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    expect(
      new Set(responses.map((res) => (res.body as { id: string }).id)).size,
    ).toBe(1);
    expect(store.rows.size).toBe(1);
  });
  it.each(['USER', 'EDITOR', 'MODERATOR'] as const)(
    'ADMIN endpoint rechaza rol %s',
    async (role) => {
      store.rows.set(subject, storedProfile(subject, role));
      await request(app.getHttpServer())
        .get('/admin/comprobacion')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      expect(store.delegate.upsert).not.toHaveBeenCalled();
    },
  );
  it('ADMIN endpoint rechaza perfil ausente como 403, sin crearlo', async () => {
    await request(app.getHttpServer())
      .get('/admin/comprobacion')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    expect(store.delegate.upsert).not.toHaveBeenCalled();
  });
  it('permite ADMIN y consulta de nuevo DB tras retirar permisos', async () => {
    store.rows.set(subject, storedProfile(subject, 'ADMIN'));
    const allowed = await request(app.getHttpServer())
      .get('/admin/comprobacion')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(allowed.body).toEqual({
      message: 'Acceso administrativo autorizado.',
    });
    expect(allowed.headers['cache-control']).toBe('private, no-store');
    store.rows.set(subject, storedProfile(subject, 'USER'));
    await request(app.getHttpServer())
      .get('/admin/comprobacion')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
  it('un segundo usuario no puede leer ni heredar el ADMIN del primero', async () => {
    store.rows.set(subject, storedProfile(subject, 'ADMIN'));
    await request(app.getHttpServer())
      .get('/auth/me?supabaseUserId=' + subject)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
    const response = await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    expect((response.body as UserProfileResponse).supabaseUserId).toBe(
      anotherSubject,
    );
    expect((response.body as UserProfileResponse).role).toBe('USER');
    expect((response.body as UserProfileResponse).id).not.toBe(
      wireProfile('ADMIN').id,
    );
    await request(app.getHttpServer())
      .get('/admin/comprobacion')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });
  it.each(['/auth/me', '/admin/comprobacion'])(
    'fallo DB al leer %s es 503 sanitizado',
    async (path) => {
      getClient.mockRejectedValue(
        new Error('postgres://usuario:secreto@interno'),
      );
      const res = await request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${token}`)
        .expect(503);
      expect((res.body as { message: string }).message).toBe(
        'No se ha podido consultar el perfil.',
      );
      expect(JSON.stringify(res.body)).not.toContain('secreto');
    },
  );
  it('fallo de escritura es 503, sin filtrar el driver ni declarar perfil creado', async () => {
    store.delegate.upsert.mockRejectedValueOnce(
      new Error('password-no-publicar'),
    );
    const res = await request(app.getHttpServer())
      .post('/auth/perfil')
      .set('Authorization', `Bearer ${token}`)
      .expect(503);
    expect((res.body as { message: string }).message).toBe(
      'No se ha podido sincronizar el perfil.',
    );
    expect(JSON.stringify(res.body)).not.toContain('password-no-publicar');
    expect(store.rows.size).toBe(0);
  });
});
