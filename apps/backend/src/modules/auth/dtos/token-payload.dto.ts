import { UserSituation } from '../../user/enums/user-situation';

export enum AuthTokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export class AccessTokenPayloadDto {
    id: string;
    situation: UserSituation;
    firstName: string;
    tokenType: AuthTokenType.ACCESS;
}

export class RefreshTokenPayloadDto {
    id: string;
    tokenType: AuthTokenType.REFRESH;
}
