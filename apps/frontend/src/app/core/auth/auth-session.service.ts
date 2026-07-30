import { Injectable } from '@angular/core';
import { AuthTokens } from './auth.model';

const ACCESS_TOKEN_KEY = 'tangerine.accessToken';
const REFRESH_TOKEN_KEY = 'tangerine.refreshToken';
const TOWNHOUSE_SLUG_KEY = 'tangerine.townhouseSlug';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
    get accessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    get refreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    get townhouseSlug(): string | null {
        return localStorage.getItem(TOWNHOUSE_SLUG_KEY);
    }

    save(tokens: AuthTokens, townhouseSlug: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        localStorage.setItem(TOWNHOUSE_SLUG_KEY, townhouseSlug);
    }

    updateAccessToken(accessToken: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    hasValidAccessToken(): boolean {
        return this._hasValidToken(this.accessToken, 'access');
    }

    hasValidRefreshToken(): boolean {
        return this._hasValidToken(this.refreshToken, 'refresh');
    }

    clear(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOWNHOUSE_SLUG_KEY);
    }

    private _hasValidToken(token: string | null, expectedType: 'access' | 'refresh'): boolean {
        if (!token) {
            return false;
        }

        try {
            const encodedPayload = token.split('.')[1];

            if (!encodedPayload) {
                return false;
            }

            const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
            const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
            const payload = JSON.parse(atob(paddedPayload)) as {
                exp?: number;
                tokenType?: string;
            };

            const nowInSeconds = Math.floor(Date.now() / 1000);

            return payload.tokenType === expectedType && typeof payload.exp === 'number' && payload.exp > nowInSeconds;
        } catch {
            return false;
        }
    }
}
