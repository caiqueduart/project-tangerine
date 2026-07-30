import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { TOWNHOUSE_PARAMS, TOWNHOUSE_ROUTES } from '../../config/routes/townhouse-routes.config';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);
    const slug = getTownhouseSlug(route);

    if (!slug || authSessionService.townhouseSlug !== slug) {
        return true;
    }

    const homeUrl = router.createUrlTree(TOWNHOUSE_ROUTES.home(slug));

    if (authSessionService.hasValidAccessToken()) {
        return homeUrl;
    }

    if (!authSessionService.hasValidRefreshToken()) {
        authService.logout();
        return true;
    }

    return authService.refreshAccessToken().pipe(
        map(() => homeUrl),
        catchError(() => {
            authService.logout();
            return of(true);
        }),
    );
};

function getTownhouseSlug(route: ActivatedRouteSnapshot): string | null {
    let currentRoute: ActivatedRouteSnapshot | null = route;

    while (currentRoute) {
        const slug = currentRoute.paramMap.get(TOWNHOUSE_PARAMS.slug);

        if (slug) {
            return slug.trim().toLowerCase();
        }

        currentRoute = currentRoute.parent;
    }

    return null;
}
