export type UserSituation = 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'PENDING';
export type UserAuditAction = 'CREATED' | 'REGISTRATION_REQUESTED' | 'UPDATED' | 'APPROVED';

export interface AdminUser {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly email: string | null;
    readonly situation: UserSituation;
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
    readonly password?: string;
    readonly houseId: number | null;
    readonly situation?: UserSituation;
}

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
