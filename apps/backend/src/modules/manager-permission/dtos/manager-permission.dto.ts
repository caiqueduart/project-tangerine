import { IsUUID } from 'class-validator';
import { UserRole } from '../../user/enums/user-role';
import { UserSituation } from '../../user/enums/user-situation';
import { ManagerPermissionSituation } from '../enums/manager-permission-situation';

export class GrantManagerPermissionDto {
    @IsUUID()
    userId: string;
}

export class ManagerPermissionUserDto {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    role: UserRole;
    situation: UserSituation;
}

export class ManagerPermissionTownhouseDto {
    id: number;
    name: string;
    slug: string;
}

export class ManagerPermissionDto {
    id: string;
    userId: string;
    townhouseId: number;
    situation: ManagerPermissionSituation;
    grantedByUserId: string | null;
    grantedAt: Date;
    revokedByUserId: string | null;
    revokedAt: Date | null;
    user: ManagerPermissionUserDto;
    townhouse: ManagerPermissionTownhouseDto;
}
