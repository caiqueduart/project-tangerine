export class AuthenticationSessionDto {
    user: AuthenticationSessionUserDto;
    house: AuthenticationSessionHouseDto | null;
    managerPermissions: AuthenticationSessionManagerPermissionDto[];
}

class AuthenticationSessionManagerPermissionDto {
    townhouse: AuthenticationSessionTownhouseDto;
}

class AuthenticationSessionHouseDto {
    id: number;
    identifier: string;
    townhouse: AuthenticationSessionTownhouseDto;
}

class AuthenticationSessionUserDto {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    situation: UserSituation;
}

class AuthenticationSessionTownhouseDto {
    id: number;
    name: string;
    slug: string;
}
import { UserRole } from '../../user/enums/user-role';
import { UserSituation } from '../../user/enums/user-situation';
