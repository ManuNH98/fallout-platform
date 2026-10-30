import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserProfileResponse } from '@repo/types';
import { UsersService } from '../../modules/users/users.service';
import { SupabaseJwtService } from '../../modules/auth/supabase-jwt.service';
import type { SupabaseIdentity } from '../../modules/auth/supabase-identity';

export type IdentityRequest = Request & {
  authIdentity?: SupabaseIdentity;
  userProfile?: UserProfileResponse;
};

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: SupabaseJwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    delete request.authIdentity;
    delete request.userProfile;
    const authorization = request.headers.authorization;
    const count = request.rawHeaders.filter(
      (value, index) =>
        index % 2 === 0 && value.toLowerCase() === 'authorization',
    ).length;
    const match = authorization?.match(
      /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i,
    );

    if (!match || count !== 1 || (authorization?.length ?? 0) > 16_384) {
      throw new UnauthorizedException('La autenticacion no es valida.');
    }
    const identity = await this.jwt.verify(match[1]);
    const profile = await this.users.findBySupabaseUserId(
      identity.supabaseUserId,
    );
    request.authIdentity = identity;
    request.userProfile = profile ?? undefined;
    return true;
  }
}
