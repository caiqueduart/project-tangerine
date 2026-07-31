import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, shareReplay, tap, throwError } from 'rxjs';
import { AUTH_API_ROUTES } from '../../config/routes/auth-routes.config';
import { AuthSessionService } from './auth-session.service';
import { AccessToken, LoginCredentials, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _httpClient = inject(HttpClient);
    private readonly _authSessionService = inject(AuthSessionService);
    private _refreshRequest: Observable<AccessToken> | null = null;

    login(credentials: LoginCredentials, townhouseSlug: string): Observable<LoginResponse> {
        return this._httpClient.post<LoginResponse>(AUTH_API_ROUTES.login, credentials).pipe(
            tap((response) => {
                this._authSessionService.save(response, townhouseSlug);
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

        this._refreshRequest = this._httpClient.post<AccessToken>(AUTH_API_ROUTES.refresh, { refreshToken }).pipe(
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
