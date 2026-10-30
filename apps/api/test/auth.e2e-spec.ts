import {
  Controller,
  Get,
  type INestApplication,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { webcrypto } from 'node:crypto';
import {
  exportJWK,
  generateKeyPair,
  SignJWT,
  type FetchImplementation,
} from 'jose';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  SupabaseAuthGuard,
  type IdentityRequest,
} from '../src/common/guards/supabase-auth.guard';
import { AuthModule } from '../src/modules/auth/auth.module';
import { JWKS_FETCH } from '../src/modules/auth/jwks-fetch.provider';
import { HealthModule } from '../src/modules/health/health.module';

// Endpoint exclusivo del fixture: no se registra en la API de produccion.
@Controller('privado-prueba')
@UseGuards(SupabaseAuthGuard)
class ProbeController {
  @Get()
  read(@Req() req: IdentityRequest) {
    return req.authIdentity;
  }
}

describe('Identidad Supabase (e2e aislada)', () => {
  let app: INestApplication<App>;
  let validToken: string;
  let expiredToken: string;
  let unavailableToken: string;
  let transport: jest.MockedFunction<FetchImplementation>;
  const subject = '2756a032-021a-4bf7-bab1-a827d6fa9a45';
  const sessionId = 'ef2c3b97-b090-423b-9a0a-8c34769e6f11';

  beforeAll(async () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
    const keys = await generateKeyPair('ES256', { extractable: true });
    const jwk = {
      ...(await exportJWK(keys.publicKey)),
      kid: 'prueba',
      alg: 'ES256',
    };
    transport = jest.fn();
    transport.mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ keys: [jwk] }))),
    );
    const payload = {
      sub: subject,
      session_id: sessionId,
      role: 'authenticated',
      is_anonymous: false,
    };
    const sign = (exp: number, kid = 'prueba') =>
      new SignJWT(payload)
        .setProtectedHeader({ alg: 'ES256', typ: 'JWT', kid })
        .setIssuer('https://project.example/auth/v1')
        .setAudience('authenticated')
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(keys.privateKey);
    validToken = await sign(Math.floor(Date.now() / 1000) + 3600);
    expiredToken = await sign(1);
    unavailableToken = await sign(
      Math.floor(Date.now() / 1000) + 3600,
      'nuevo-kid',
    );
    const fixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          skipProcessEnv: true,
          load: [() => ({ SUPABASE_URL: 'https://project.example' })],
        }),
        AuthModule,
        HealthModule,
      ],
      controllers: [ProbeController],
    })
      .overrideProvider(JWKS_FETCH)
      .useValue(transport)
      .compile();
    app = fixture.createNestApplication();
    await app.init();
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await app?.close();
  });

  it('health sigue publico y no descarga claves', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
    expect(transport).not.toHaveBeenCalled();
  });

  it('sin bearer responde 401, con mensaje generico en espanol', async () => {
    const response = await request(app.getHttpServer())
      .get('/privado-prueba')
      .expect(401);
    expect(response.body).toMatchObject({
      message: 'La autenticacion no es valida.',
    });
  });

  it('valida criptograficamente la llamada HTTP y adjunta identidad', async () => {
    await request(app.getHttpServer())
      .get('/privado-prueba')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect({ supabaseUserId: subject, sessionId });
  });

  it('rechaza token caducado sin exponerlo', async () => {
    const response = await request(app.getHttpServer())
      .get('/privado-prueba')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    expect(JSON.stringify(response.body)).not.toContain(expiredToken);
  });

  it('rechaza cabeceras Authorization duplicadas', async () => {
    await request(app.getHttpServer())
      .get('/privado-prueba')
      .set({ Authorization: [`Bearer ${validToken}`, `Bearer ${validToken}`] })
      .expect(401);
  });
  it('un fallo JWKS responde 503 sin filtrar datos del proveedor', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 30_001);
    transport.mockRejectedValue(new Error('credencial-no-publicar'));
    const response = await request(app.getHttpServer())
      .get('/privado-prueba')
      .set('Authorization', `Bearer ${unavailableToken}`)
      .expect(503);
    expect(response.body).toMatchObject({
      message: 'No se ha podido comprobar la identidad.',
    });
    expect(JSON.stringify(response.body)).not.toContain(
      'credencial-no-publicar',
    );
  });
});
