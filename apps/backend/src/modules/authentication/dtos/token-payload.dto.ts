export enum AuthenticationTokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export class AccessTokenPayloadDto {
    id: string;
    tokenType: AuthenticationTokenType.ACCESS;
}

export class RefreshTokenPayloadDto {
    id: string;
    tokenType: AuthenticationTokenType.REFRESH;
}
