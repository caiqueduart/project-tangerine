import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SYSTEM_ADMIN_ROUTES } from '../../config/routes/system-admin-routes.config';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../../config/routes/app-routes.config';
import { UserRole } from '../../../shared/enums/user-role.enum';

export const adminGuestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);
    const adminRootUrl = router.createUrlTree(SYSTEM_ADMIN_ROUTES.root);

    const session = authSessionService.session();

    if (!session) {
        return true;
    }

    if (session.user.situation === 'PENDING') {
        return router.createUrlTree(APP_ROUTES.password);
    }

    if (session.user.role !== UserRole.SYSTEM_ADMIN) {
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
