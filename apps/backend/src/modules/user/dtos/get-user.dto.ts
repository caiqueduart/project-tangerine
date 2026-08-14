import { UserSituation } from '../enums/user-situation';
import { UserAuditAction } from '../enums/user-audit-action';

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

export class GetUserDto {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    situation: UserSituation;
    house: GetUserHouseDto | null;
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
