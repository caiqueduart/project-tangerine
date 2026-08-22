export enum UserRole {
    RESIDENT = 'RESIDENT',
    TOWNHOUSE_MANAGER = 'TOWNHOUSE_MANAGER',
    SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export const USER_ROLE_LABELS: Readonly<Record<UserRole, string>> = {
    [UserRole.RESIDENT]: 'Morador',
    [UserRole.TOWNHOUSE_MANAGER]: 'Administrador de condomínio',
    [UserRole.SYSTEM_ADMIN]: 'Administrador do sistema',
};
