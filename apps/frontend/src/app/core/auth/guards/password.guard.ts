import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SYSTEM_ADMIN_ROUTES } from '../../config/routes/system-admin-routes.config';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';

export const passwordGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);

    if (!authSessionService.session()) {
        return router.createUrlTree(SYSTEM_ADMIN_ROUTES.login);
    }

    if (authSessionService.hasValidAccessToken()) {
        return true;
    }

    return authService.refreshAccessToken().pipe(
        map(() => true),
        catchError(() => {
            authService.logout();
            return of(router.createUrlTree(SYSTEM_ADMIN_ROUTES.login));
        }),
    );
};
