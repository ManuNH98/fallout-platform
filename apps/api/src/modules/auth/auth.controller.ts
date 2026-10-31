import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserProfileResponse } from '@repo/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  SupabaseAuthGuard,
  type IdentityRequest,
} from '../../common/guards/supabase-auth.guard';
import { EmptyBodyPipe } from '../../common/pipes/empty-body.pipe';
import { UsersService } from '../users/users.service';

@Controller('auth')
@UseGuards(SupabaseAuthGuard)
export class AuthController {
  constructor(private readonly users: UsersService) {}

  @Post('perfil')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  synchronize(
    @Req() request: IdentityRequest,
    @Body(EmptyBodyPipe) _body: undefined,
  ): Promise<UserProfileResponse> {
    void _body; // La pipe valida y descarta el cuerpo: no se pasa a persistencia.
    return this.users.synchronize(request.authIdentity!.supabaseUserId);
  }

  @Get('me')
  @Header('Cache-Control', 'private, no-store')
  me(@CurrentUser() profile: UserProfileResponse): UserProfileResponse {
    return profile;
  }
}
