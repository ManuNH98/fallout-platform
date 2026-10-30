import {
  createParamDecorator,
  type ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserProfileResponse } from '@repo/types';
import type { IdentityRequest } from '../guards/supabase-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserProfileResponse => {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    if (!request.authIdentity)
      throw new UnauthorizedException('La autenticacion no es valida.');
    if (!request.userProfile)
      throw new NotFoundException('El perfil no existe.');
    return request.userProfile;
  },
);
