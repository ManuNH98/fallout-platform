import type { UserRole, UserProfileResponse } from '@repo/types';

export const subject = '2756a032-021a-4bf7-bab1-a827d6fa9a45';
export const anotherSubject = '39c24ab1-a65e-43bd-9c8a-f7707146a561';
export const sessionId = 'ef2c3b97-b090-423b-9a0a-8c34769e6f11';

export function storedProfile(
  supabaseUserId = subject,
  role: UserRole = 'USER',
) {
  return {
    id:
      supabaseUserId === subject
        ? 'a07c7044-cc9e-4121-a9a8-f0e0e47d8e60'
        : '2e93d651-1d68-44f6-83f0-f560a50d6b4d',
    supabaseUserId,
    username: null as string | null,
    displayName: null as string | null,
    avatarUrl: null as string | null,
    role,
    createdAt: new Date('2026-10-30T10:00:00.000Z'),
    updatedAt: new Date('2026-10-30T10:00:00.000Z'),
  };
}

export function wireProfile(role: UserRole = 'USER'): UserProfileResponse {
  const profile = storedProfile(subject, role);
  return {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function profileStore() {
  const rows = new Map<string, ReturnType<typeof storedProfile>>();
  const findUnique = jest.fn(
    ({ where }: { where: { supabaseUserId: string } }) =>
      Promise.resolve(rows.get(where.supabaseUserId) ?? null),
  );
  const upsert = jest.fn(
    async ({ where }: { where: { supabaseUserId: string } }) => {
      const existing = rows.get(where.supabaseUserId);
      if (existing) return existing;
      // Simular dos read/create solapados y el conflicto de unicidad del perdedor.
      await Promise.resolve();
      if (rows.has(where.supabaseUserId))
        throw Object.assign(new Error('Conflicto simulado.'), {
          code: 'P2002',
        });
      const created = storedProfile(where.supabaseUserId);
      rows.set(where.supabaseUserId, created);
      return created;
    },
  );
  return { rows, delegate: { findUnique, upsert } };
}
