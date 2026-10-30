import {
  type ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@repo/types';
import {
  sessionId,
  subject,
  wireProfile,
} from '../../../test/helpers/auth-profile';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

function context(
  required: UserRole[] | undefined,
  actual?: UserRole,
  identity = true,
) {
  const handler = () => undefined;
  if (required) Reflect.defineMetadata(ROLES_KEY, required, handler);
  const request = {
    authIdentity: identity ? { supabaseUserId: subject, sessionId } : undefined,
    userProfile: actual ? wireProfile(actual) : undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}
const roles: UserRole[] = ['USER', 'ADMIN', 'EDITOR', 'MODERATOR'];
for (const required of roles) {
  it.each(roles)(
    'permiso ' + required + ' con rol %s usa coincidencia explicita',
    (actual) => {
      const guard = new RolesGuard(new Reflector());
      if (required === actual)
        expect(guard.canActivate(context([required], actual))).toBe(true);
      else
        expect(() => guard.canActivate(context([required], actual))).toThrow(
          ForbiddenException,
        );
    },
  );
}
it('rechaza falta de identidad como 401', () => {
  expect(() =>
    new RolesGuard(new Reflector()).canActivate(
      context(['ADMIN'], 'ADMIN', false),
    ),
  ).toThrow(UnauthorizedException);
});
it.each([undefined, []])('deniega sin roles declarados (%s)', (required) => {
  expect(() =>
    new RolesGuard(new Reflector()).canActivate(context(required, 'ADMIN')),
  ).toThrow(ForbiddenException);
});
it('deniega sin perfil como 403', () => {
  expect(() =>
    new RolesGuard(new Reflector()).canActivate(context(['ADMIN'])),
  ).toThrow(ForbiddenException);
});
it('admite lista explicita sin jerarquia de roles', () => {
  expect(
    new RolesGuard(new Reflector()).canActivate(
      context(['EDITOR', 'MODERATOR'], 'MODERATOR'),
    ),
  ).toBe(true);
});
