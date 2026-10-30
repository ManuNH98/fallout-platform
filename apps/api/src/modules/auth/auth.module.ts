import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { jwksFetchProvider } from './jwks-fetch.provider';
import { SupabaseJwtService } from './supabase-jwt.service';

@Module({
  providers: [jwksFetchProvider, SupabaseJwtService, SupabaseAuthGuard],
  exports: [SupabaseJwtService, SupabaseAuthGuard],
})
export class AuthModule {}
