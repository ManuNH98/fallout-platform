import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import type { AdminCheckResponse } from '@repo/types';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AdminController {
  @Get('comprobacion')
  @Roles('ADMIN')
  @Header('Cache-Control', 'private, no-store')
  check(): AdminCheckResponse {
    return { message: 'Acceso administrativo autorizado.' };
  }
}
