import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { UserProfileResponse } from '@repo/types';
import { DatabaseService } from '../database/database.service';

// Lista explicita: los futuros campos privados no se exponen automaticamente.
const profileSelect = {
  id: true,
  supabaseUserId: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserProfileSelect;

type Profile = Prisma.UserProfileGetPayload<{ select: typeof profileSelect }>;

function serialize(profile: Profile): UserProfileResponse {
  return {
    id: profile.id,
    supabaseUserId: profile.supabaseUserId,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

function uniqueConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async findBySupabaseUserId(
    supabaseUserId: string,
  ): Promise<UserProfileResponse | null> {
    try {
      const client = await this.database.getClient();
      const profile = await client.userProfile.findUnique({
        where: { supabaseUserId },
        select: profileSelect,
      });
      return profile ? serialize(profile) : null;
    } catch {
      throw new ServiceUnavailableException(
        'No se ha podido consultar el perfil.',
      );
    }
  }

  async synchronize(supabaseUserId: string): Promise<UserProfileResponse> {
    try {
      const client = await this.database.getClient();
      try {
        const profile = await client.userProfile.upsert({
          where: { supabaseUserId },
          create: { supabaseUserId }, // USER y UUID provienen de defaults Prisma/DB.
          update: {}, // Repetir no cambia rol, campos ni updatedAt.
          select: profileSelect,
        });
        return serialize(profile);
      } catch (error) {
        // Prisma puede resolver un upsert vacio con read/create. Si hay carrera,
        // recuperar la fila ganadora por identidad; nunca actualizar sus permisos.
        if (!uniqueConflict(error)) throw error;
        const profile = await client.userProfile.findUnique({
          where: { supabaseUserId },
          select: profileSelect,
        });
        if (!profile) throw new Error('Conflicto sin perfil recuperable.');
        return serialize(profile);
      }
    } catch {
      throw new ServiceUnavailableException(
        'No se ha podido sincronizar el perfil.',
      );
    }
  }
}
