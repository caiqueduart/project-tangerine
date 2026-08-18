export class AuthenticationSessionDto {
    user: AuthenticationSessionUserDto;
    house?: AuthenticationSessionHouseDto;
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
}

class AuthenticationSessionTownhouseDto {
    id: number;
    name: string;
    slug: string;
}
