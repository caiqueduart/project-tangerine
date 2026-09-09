import { UserSituation } from '../enums/user-situation';
import { UserAuditAction } from '../enums/user-audit-action';
import { UserRole } from '../enums/user-role';
import { ManagerPermissionSituation } from '../../manager-permission/enums/manager-permission-situation';

export class GetUserTownhouseDto {
    id: number;
    name: string;
    slug: string;
}

export class GetUserHouseDto {
    id: number;
    identifier: string;
    townhouse: GetUserTownhouseDto;
}

export class GetUserManagerPermissionDto {
    id: string;
    situation: ManagerPermissionSituation;
    grantedAt: Date;
    revokedAt: Date | null;
    townhouse: GetUserTownhouseDto;
}

export class GetUserDto {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    situation: UserSituation;
    role: UserRole;
    house: GetUserHouseDto | null;
    managerPermissions: GetUserManagerPermissionDto[];
}

export class CreateUserResultDto extends GetUserDto {
    provisionalPassword: string;
}

export class GetUserAuditActorDto {
    id: string;
    firstName: string;
    lastName: string;
}

export class GetUserAuditDto {
    id: string;
    action: UserAuditAction;
    actorUserId: string | null;
    actor: GetUserAuditActorDto | null;
    createdAt: Date;
}

export class GetUserDetailsDto extends GetUserDto {
    audits: GetUserAuditDto[];
}
