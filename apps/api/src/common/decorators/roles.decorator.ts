import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@repo/types';

export const ROLES_KEY = 'application:roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
