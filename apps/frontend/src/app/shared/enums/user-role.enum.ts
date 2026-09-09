import { UserRole } from '@repo/shared';

export { UserRole };

export const USER_ROLE_LABELS: Readonly<Record<UserRole, string>> = {
    [UserRole.USER]: 'Usuário',
    [UserRole.SYSTEM_ADMIN]: 'Administrador do sistema',
};
