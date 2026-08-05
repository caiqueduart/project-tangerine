import { Injectable, signal } from '@angular/core';
import { AuthSession, LoginResponse } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'tangerine.act';
const LEGACY_REFRESH_TOKEN_KEY = 'tangerine.rfst';
const TOWNHOUSE_SLUG_KEY = 'tangerine.slug';
const AUTH_SESSION_KEY = 'tangerine.sson';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
    private readonly _session = signal<AuthSession | null>(this._restoreSession());

    readonly session = this._session.asReadonly();

    constructor() {
        localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
    }

    get accessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    get townhouseSlug(): string | null {
        return localStorage.getItem(TOWNHOUSE_SLUG_KEY);
    }

    save(response: LoginResponse, townhouseSlug?: string): void {
        const sessionTownhouseSlug = response.session.house?.townhouse.slug ?? townhouseSlug;

        localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(response.session));

        if (sessionTownhouseSlug) {
            localStorage.setItem(TOWNHOUSE_SLUG_KEY, sessionTownhouseSlug);
        } else {
            localStorage.removeItem(TOWNHOUSE_SLUG_KEY);
        }

        this._session.set(response.session);
    }

    updateAccessToken(accessToken: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    hasValidAccessToken(): boolean {
        return this._hasValidToken(this.accessToken, 'access');
    }

    clear(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOWNHOUSE_SLUG_KEY);
        localStorage.removeItem(AUTH_SESSION_KEY);

        this._session.set(null);
    }

    private _restoreSession(): AuthSession | null {
        const storedSession = localStorage.getItem(AUTH_SESSION_KEY);

        if (!storedSession) {
            return null;
        }

        try {
            return JSON.parse(storedSession) as AuthSession;
        } catch {
            localStorage.removeItem(AUTH_SESSION_KEY);
            return null;
        }
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
