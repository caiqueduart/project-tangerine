import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserSituation } from './admin-user.model';

export interface AdminManagerPermission {
    readonly id: string;
    readonly userId: string;
    readonly townhouseId: number;
    readonly situation: 'ACTIVE' | 'REVOKED';
    readonly grantedByUserId: string | null;
    readonly grantedAt: string;
    readonly revokedByUserId: string | null;
    readonly revokedAt: string | null;
    readonly user: {
        readonly id: string;
        readonly firstName: string;
        readonly lastName: string;
        readonly phone: string;
        readonly email: string | null;
        readonly role: UserRole;
        readonly situation: UserSituation;
    };
    readonly townhouse: {
        readonly id: number;
        readonly name: string;
        readonly slug: string;
    };
}
