import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@repo/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { IdentityRequest } from './supabase-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    if (!request.authIdentity)
      throw new UnauthorizedException('La autenticacion no es valida.');
    const roles = this.reflector.getAllAndOverride<readonly UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // Sin declaracion explicita no conceder permisos por accidente.
    if (
      !roles?.length ||
      !request.userProfile ||
      !roles.includes(request.userProfile.role)
    ) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso.',
      );
    }
    return true;
  }
}
