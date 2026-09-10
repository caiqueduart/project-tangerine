export enum AuthenticationTokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export class AccessTokenPayloadDto {
    id: string;
    tokenType: AuthenticationTokenType.ACCESS;
    townhouseId?: number;
}

export class RefreshTokenPayloadDto {
    id: string;
    tokenType: AuthenticationTokenType.REFRESH;
    townhouseId?: number;
}
