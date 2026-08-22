export class AuthenticationSessionDto {
    user: AuthenticationSessionUserDto;
    house: AuthenticationSessionHouseDto | null;
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
