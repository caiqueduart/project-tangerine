import { UserRole } from '../../../shared/enums/user-role.enum';

export interface LoginCredentials {
    uid: string;
    password: string;
}

export type AuthUserSituation = 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'PENDING';

export interface AuthSessionUser {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    situation: AuthUserSituation;
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

export interface LoginResponse extends AccessToken {
    session: AuthSession;
}

export interface AccessToken {
    accessToken: string;
}

export interface CompleteFirstAccessPayload {
    newPassword: string;
}

export interface ChangePasswordPayload extends CompleteFirstAccessPayload {
    currentPassword: string;
}
