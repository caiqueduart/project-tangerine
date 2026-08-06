export class AuthSessionDto {
    user: AuthSessionUserDto;
    house?: AuthSessionHouseDto;
}

class AuthSessionHouseDto {
    id: number;
    identifier: string;
    townhouse: AuthSessionTownhouseDto;
}

class AuthSessionUserDto {
    id: string;
    firstName: string;
    lastName: string;
}

class AuthSessionTownhouseDto {
    id: number;
    name: string;
    slug: string;
}
