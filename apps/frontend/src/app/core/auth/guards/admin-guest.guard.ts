import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SYSTEM_ADMIN_ROUTES } from '../../config/routes/system-admin-routes.config';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthService } from '../services/auth.service';

export const adminGuestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);
    const adminRootUrl = router.createUrlTree(SYSTEM_ADMIN_ROUTES.root);

    if (!authSessionService.session()) {
        return true;
    }

    if (authSessionService.hasValidAccessToken()) {
        return adminRootUrl;
    }

    return authService.refreshAccessToken().pipe(
        map(() => adminRootUrl),
        catchError(() => {
            authService.logout();
            return of(true);
        }),
    );
};
