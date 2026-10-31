import {
  type ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseJwtService } from '../../modules/auth/supabase-jwt.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { UsersService } from '../../modules/users/users.service';
import { wireProfile } from '../../../test/helpers/auth-profile';

const identity = {
  supabaseUserId: 'usuario-verificado',
  sessionId: 'sesion-verificada',
};
function setup(authorization?: string, rawHeaders?: string[]) {
  const request = {
    headers: { authorization },
    rawHeaders:
      rawHeaders ?? (authorization ? ['Authorization', authorization] : []),
    authIdentity: identity,
    userProfile: wireProfile(),
  };
  const verify = jest.fn().mockResolvedValue(identity);
  const findBySupabaseUserId = jest.fn().mockResolvedValue(null);
  const guard = new SupabaseAuthGuard(
    { verify } as unknown as SupabaseJwtService,
    { findBySupabaseUserId } as unknown as UsersService,
  );
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { request, verify, findBySupabaseUserId, guard, context };
}

it.each([
  undefined,
  '',
  'Basic a.b.c',
  'Bearer a.b.c extra',
  'Bearer sb_publishable_prueba',
  'Bearer a.b',
  `Bearer ${'a'.repeat(16_384)}.b.c`,
])('rechaza header ausente o mal formado (%s)', async (header) => {
  const { guard, context, request, verify } = setup(header);
  await expect(guard.canActivate(context)).rejects.toThrow(
    UnauthorizedException,
  );
  expect(verify).not.toHaveBeenCalled();
  expect(request.authIdentity).toBeUndefined();
  expect(request.userProfile).toBeUndefined();
});

it('rechaza Authorization duplicado aunque Node conserve un unico valor', async () => {
  const { guard, context, verify } = setup('Bearer a.b.c', [
    'Authorization',
    'Bearer a.b.c',
    'authorization',
    'Bearer otro.token.jwt',
  ]);
  await expect(guard.canActivate(context)).rejects.toThrow(
    UnauthorizedException,
  );
  expect(verify).not.toHaveBeenCalled();
});

it('solo adjunta identidad tras verificar y admite esquema case insensitive', async () => {
  const { guard, context, request, verify } = setup('bearer a.b.c');
  await expect(guard.canActivate(context)).resolves.toBe(true);
  expect(verify).toHaveBeenCalledWith('a.b.c');
  expect(request.authIdentity).toEqual(identity);
});

it.each([new UnauthorizedException(), new ServiceUnavailableException()])(
  'propaga el error del verificador sin conservar identidad previa',
  async (error) => {
    const { guard, context, request, verify } = setup('Bearer a.b.c');
    verify.mockRejectedValue(error);
    await expect(guard.canActivate(context)).rejects.toBe(error);
    expect(request.authIdentity).toBeUndefined();
    expect(request.userProfile).toBeUndefined();
  },
);

it('adjunta solo el perfil consultado tras verificar identidad', async () => {
  const { guard, context, request, findBySupabaseUserId } =
    setup('Bearer a.b.c');
  findBySupabaseUserId.mockResolvedValue(wireProfile('ADMIN'));
  await guard.canActivate(context);
  expect(findBySupabaseUserId).toHaveBeenCalledWith(identity.supabaseUserId);
  expect(request.userProfile?.role).toBe('ADMIN');
});
it('un fallo DB limpia identidad y perfil previos y propaga 503', async () => {
  const { guard, context, request, findBySupabaseUserId } =
    setup('Bearer a.b.c');
  findBySupabaseUserId.mockRejectedValue(new ServiceUnavailableException());
  await expect(guard.canActivate(context)).rejects.toThrow(
    ServiceUnavailableException,
  );
  expect(request.authIdentity).toBeUndefined();
  expect(request.userProfile).toBeUndefined();
});
