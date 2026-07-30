export interface LoginCredentials {
    uid: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AccessToken {
    accessToken: string;
}
