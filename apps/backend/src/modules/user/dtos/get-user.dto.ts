import { UserSituation } from '../enums/user-situation';

export class GetUserTownhouseDto {
    id: number;
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
