import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { jwksFetchProvider } from './jwks-fetch.provider';
import { SupabaseJwtService } from './supabase-jwt.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    jwksFetchProvider,
    SupabaseJwtService,
    SupabaseAuthGuard,
    RolesGuard,
  ],
  exports: [SupabaseJwtService, SupabaseAuthGuard, RolesGuard, UsersModule],
})
export class AuthModule {}
