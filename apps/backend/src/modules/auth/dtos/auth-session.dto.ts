export class AuthSessionUserDto {
    id: string;
    firstName: string;
    lastName: string;
}

export class AuthSessionTownhouseDto {
    id: number;
    name: string;
    slug: string;
}

export class AuthSessionHouseDto {
    id: number;
    identifier: string;
    townhouse: AuthSessionTownhouseDto;
}

export class AuthSessionDto {
    user: AuthSessionUserDto;
    house: AuthSessionHouseDto | null;
}
