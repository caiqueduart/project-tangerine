import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);
    const slug = getTownhouseSlug(route);
    const loginUrl = createLoginUrl(router, slug, state);

    if (!slug || authSessionService.townhouseSlug !== slug) {
        return loginUrl;
    }

    if (authSessionService.hasValidAccessToken()) {
        return true;
    }

    if (!authSessionService.hasValidRefreshToken()) {
        authService.logout();
        return loginUrl;
    }

    return authService.refreshAccessToken().pipe(
        map(() => true),
        catchError(() => {
            authService.logout();
            return of(loginUrl);
        }),
    );
};

function getTownhouseSlug(route: ActivatedRouteSnapshot): string | null {
    let currentRoute: ActivatedRouteSnapshot | null = route;

    while (currentRoute) {
        const slug = currentRoute.paramMap.get('slug');

        if (slug) {
            return slug.trim().toLowerCase();
        }

        currentRoute = currentRoute.parent;
    }

    return null;
}

function createLoginUrl(router: Router, slug: string | null, state: RouterStateSnapshot): UrlTree {
    if (!slug) {
        return router.parseUrl('/404');
    }

    return router.createUrlTree(['/', slug, 'auth', 'login'], {
        queryParams: { returnUrl: state.url },
    });
}
