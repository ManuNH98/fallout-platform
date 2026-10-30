import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createRemoteJWKSet,
  customFetch,
  errors,
  jwtVerify,
  type FetchImplementation,
  type RemoteJWKSet,
} from 'jose';
import type { AppEnvironment } from '../../config/environment';
import { JWKS_FETCH } from './jwks-fetch.provider';
import type { SupabaseIdentity } from './supabase-identity';

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const invalidTokenCodes = new Set([
  'ERR_JWT_EXPIRED',
  'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JOSE_ALG_NOT_ALLOWED',
  'ERR_JOSE_NOT_SUPPORTED',
  'ERR_JWS_INVALID',
  'ERR_JWT_INVALID',
  'ERR_JWKS_NO_MATCHING_KEY',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
]);

@Injectable()
export class SupabaseJwtService {
  private verification?: { issuer: string; jwks: RemoteJWKSet };

  constructor(
    private readonly config: ConfigService<AppEnvironment, true>,
    @Inject(JWKS_FETCH) private readonly fetchJwks: FetchImplementation,
  ) {}

  private getVerification() {
    if (!this.verification) {
      const url = this.config.get('SUPABASE_URL', { infer: true });
      if (!url) {
        throw new ServiceUnavailableException(
          'No se ha podido comprobar la identidad.',
        );
      }
      const issuer = new URL('/auth/v1', url).toString();
      const jwks = createRemoteJWKSet(
        new URL(`${issuer}/.well-known/jwks.json`),
        {
          timeoutDuration: 5_000,
          cooldownDuration: 30_000,
          cacheMaxAge: 600_000,
          [customFetch]: this.fetchJwks,
        },
      );
      this.verification = { issuer, jwks };
    }
    return this.verification;
  }

  async verify(token: string): Promise<SupabaseIdentity> {
    try {
      const { issuer, jwks } = this.getVerification();
      const { payload } = await jwtVerify(
        token,
        (header, jws) => {
          if (typeof header.kid !== 'string' || !header.kid) {
            throw new UnauthorizedException('La autenticacion no es valida.');
          }
          return jwks(header, jws);
        },
        {
          algorithms: ['ES256'],
          issuer,
          audience: 'authenticated',
          typ: 'JWT',
          requiredClaims: ['exp', 'iat', 'sub', 'session_id', 'role'],
        },
      );

      if (
        typeof payload.sub !== 'string' ||
        !uuid.test(payload.sub) ||
        typeof payload.session_id !== 'string' ||
        !uuid.test(payload.session_id) ||
        payload.role !== 'authenticated' ||
        (payload.is_anonymous !== undefined && payload.is_anonymous !== false)
      ) {
        throw new UnauthorizedException('La autenticacion no es valida.');
      }

      return {
        supabaseUserId: payload.sub,
        sessionId: payload.session_id,
      };
    } catch (error: unknown) {
      if (
        error instanceof UnauthorizedException ||
        (error instanceof errors.JOSEError && invalidTokenCodes.has(error.code))
      ) {
        throw new UnauthorizedException('La autenticacion no es valida.');
      }
      // No publicar excepciones del proveedor, JWTs ni credenciales.
      throw new ServiceUnavailableException(
        'No se ha podido comprobar la identidad.',
      );
    }
  }
}
