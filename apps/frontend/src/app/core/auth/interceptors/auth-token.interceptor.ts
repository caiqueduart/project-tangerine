import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { APP_ROUTES } from '../../config/routes/app-routes.config';
import { AUTH_API_ROUTES, AUTH_ROUTES } from '../../config/routes/auth-routes.config';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
    const authSessionService = inject(AuthSessionService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const accessToken = authSessionService.accessToken;
    const requestWithToken = accessToken ? addAccessToken(request, accessToken) : request;

    return next(requestWithToken).pipe(
        catchError((error: unknown) => {
            if (!shouldHandleUnauthorizedRequest(request, error)) {
                return throwError(() => error);
            }

            if (!authSessionService.hasValidRefreshToken()) {
                redirectToLogin(authService, authSessionService, router);
                return throwError(() => error);
            }

            return authService.refreshAccessToken().pipe(
                catchError((refreshError: unknown) => {
                    redirectToLogin(authService, authSessionService, router);
                    return throwError(() => refreshError);
                }),
                switchMap(({ accessToken: refreshedAccessToken }) =>
                    next(addAccessToken(request, refreshedAccessToken)).pipe(
                        catchError((retryError: unknown) => {
                            if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                                redirectToLogin(authService, authSessionService, router);
                            }

                            return throwError(() => retryError);
                        }),
                    ),
                ),
            );
        }),
    );
};

function addAccessToken(request: HttpRequest<unknown>, accessToken: string): HttpRequest<unknown> {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

function shouldHandleUnauthorizedRequest(request: HttpRequest<unknown>, error: unknown): error is HttpErrorResponse {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !request.url.startsWith(API_BASE_URL)) {
        return false;
    }

    return request.url !== AUTH_API_ROUTES.login && request.url !== AUTH_API_ROUTES.refresh;
}

function redirectToLogin(authService: AuthService, authSessionService: AuthSessionService, router: Router): void {
    const slug = authSessionService.townhouseSlug;
    const returnUrl = router.url;

    authService.logout();

    if (!slug) {
        void router.navigate(APP_ROUTES.notFound);
        return;
    }

    const authenticationRootUrl = router.serializeUrl(router.createUrlTree(AUTH_ROUTES.root(slug)));
    const isAuthenticationRoute = isWithinRoute(returnUrl, authenticationRootUrl);

    void router.navigate(AUTH_ROUTES.login(slug), {
        queryParams: isAuthenticationRoute ? undefined : { returnUrl },
    });
}

function isWithinRoute(url: string, routeRootUrl: string): boolean {
    return url === routeRootUrl || url.startsWith(`${routeRootUrl}/`) || url.startsWith(`${routeRootUrl}?`);
}
