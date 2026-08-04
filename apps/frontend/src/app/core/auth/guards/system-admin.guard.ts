import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SYSTEM_ADMIN_ROUTES } from '../../config/routes/system-admin-routes.config';
import { AuthSessionService } from '../services/auth-session.service';

export const systemAdminGuard: CanActivateFn = (_route, state) => {
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);

    if (authSessionService.session()) {
        return true;
    }

    return router.createUrlTree(SYSTEM_ADMIN_ROUTES.login, {
        queryParams: { returnUrl: state.url },
    });
};
