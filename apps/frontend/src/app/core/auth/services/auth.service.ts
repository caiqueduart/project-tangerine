import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, shareReplay, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { AuthSessionService } from './auth-session.service';
import { AccessToken, AuthTokens, LoginCredentials } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _httpClient = inject(HttpClient);
    private readonly _authSessionService = inject(AuthSessionService);
    private _refreshRequest: Observable<AccessToken> | null = null;

    login(credentials: LoginCredentials, townhouseSlug: string): Observable<AuthTokens> {
        return this._httpClient.post<AuthTokens>(`${API_BASE_URL}/auth/login`, credentials).pipe(
            tap((tokens) => {
                this._authSessionService.save(tokens, townhouseSlug);
            }),
        );
    }

    refreshAccessToken(): Observable<AccessToken> {
        if (this._refreshRequest) {
            return this._refreshRequest;
        }

        const refreshToken = this._authSessionService.refreshToken;

        if (!refreshToken) {
            return throwError(() => new Error('Refresh token não encontrado.'));
        }

        this._refreshRequest = this._httpClient.post<AccessToken>(`${API_BASE_URL}/auth/refresh`, { refreshToken }).pipe(
            tap(({ accessToken }) => {
                this._authSessionService.updateAccessToken(accessToken);
            }),
            finalize(() => {
                this._refreshRequest = null;
            }),
            shareReplay({ bufferSize: 1, refCount: false }),
        );

        return this._refreshRequest;
    }

    logout(): void {
        this._authSessionService.clear();
    }
}
