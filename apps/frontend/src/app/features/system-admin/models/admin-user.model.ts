import { UserRole } from '../../../shared/enums/user-role.enum';

export type UserSituation = 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'PENDING';
export type UserAuditAction =
    'CREATED' | 'REGISTRATION_REQUESTED' | 'UPDATED' | 'APPROVED' | 'PASSWORD_CHANGED' | 'ACTIVATED';

export interface AdminUser {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly email: string | null;
    readonly situation: UserSituation;
    readonly role: UserRole;
    readonly house: {
        readonly id: number;
        readonly identifier: string;
        readonly townhouse: {
            readonly id: number;
            readonly name: string;
            readonly slug: string;
        };
    } | null;
}

export interface AdminUserFormValue {
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly email: string | null;
    readonly townhouseId: number | null;
    readonly houseId: number | null;
    readonly situation?: UserSituation;
    readonly role?: UserRole;
}

export interface ProvisionalPasswordResult {
    readonly provisionalPassword: string;
}

export interface AdminUserCreationResult extends AdminUser, ProvisionalPasswordResult {}

export interface AdminUserAudit {
    readonly id: string;
    readonly action: UserAuditAction;
    readonly actorUserId: string | null;
    readonly actor: {
        readonly id: string;
        readonly firstName: string;
        readonly lastName: string;
    } | null;
    readonly createdAt: string;
}

export interface AdminUserDetails extends AdminUser {
    readonly audits: readonly AdminUserAudit[];
}
