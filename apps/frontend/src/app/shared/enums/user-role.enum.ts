import { UserRole } from '@repo/shared';

export { UserRole };

export const USER_ROLE_LABELS: Readonly<Record<UserRole, string>> = {
    [UserRole.RESIDENT]: 'Morador',
    [UserRole.TOWNHOUSE_MANAGER]: 'Administrador de condomínio',
    [UserRole.SYSTEM_ADMIN]: 'Administrador do sistema',
};
