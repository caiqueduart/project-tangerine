export enum AuthTokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export class AccessTokenPayloadDto {
    id: string;
    tokenType: AuthTokenType.ACCESS;
}

export class RefreshTokenPayloadDto {
    id: string;
    tokenType: AuthTokenType.REFRESH;
}
