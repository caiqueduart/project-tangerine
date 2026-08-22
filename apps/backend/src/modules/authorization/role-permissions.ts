import { UserRole } from '../user/enums/user-role';
import { Permission } from './enums/permission';

const RESIDENT_PERMISSIONS = [
    Permission.TOWNHOUSE_READ,
    Permission.HOUSE_READ,
    Permission.CONTRIBUTION_READ,
    Permission.PAYMENT_PROOF_CREATE,
    Permission.PAYMENT_PROOF_READ,
    Permission.ACCOUNTABILITY_READ,
] as const;

const TOWNHOUSE_MANAGER_PERMISSIONS = [
    ...RESIDENT_PERMISSIONS,
    Permission.HOUSE_CREATE,
    Permission.HOUSE_UPDATE,
    Permission.HOUSE_DELETE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_PROVISIONAL_PASSWORD_CREATE,
    Permission.CONTRIBUTION_CREATE,
    Permission.CONTRIBUTION_UPDATE,
    Permission.CONTRIBUTION_FINALIZE,
    Permission.CONTRIBUTION_REOPEN,
    Permission.CONTRIBUTION_CANCEL,
    Permission.ACCOUNTABILITY_CREATE,
] as const;

export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = {
    [UserRole.RESIDENT]: RESIDENT_PERMISSIONS,
    [UserRole.TOWNHOUSE_MANAGER]: TOWNHOUSE_MANAGER_PERMISSIONS,
    [UserRole.SYSTEM_ADMIN]: Object.values(Permission),
};
