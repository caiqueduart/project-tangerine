export interface LoginCredentials {
    uid: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthSessionUser {
    id: string;
    firstName: string;
    lastName: string;
}

export interface AuthSessionTownhouse {
    id: number;
    name: string;
    slug: string;
}

export interface AuthSessionHouse {
    id: number;
    identifier: string;
    townhouse: AuthSessionTownhouse;
}

export interface AuthSession {
    user: AuthSessionUser;
    house: AuthSessionHouse | null;
}

export interface LoginResponse extends AuthTokens {
    session: AuthSession;
}

export interface AccessToken {
    accessToken: string;
}
