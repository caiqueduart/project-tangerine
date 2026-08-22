import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SYSTEM_ADMIN_ROUTES } from '../../config/routes/system-admin-routes.config';
import { AuthSessionService } from '../services/auth-session.service';
import { APP_ROUTES } from '../../config/routes/app-routes.config';
import { TOWNHOUSE_ROUTES } from '../../config/routes/townhouse-routes.config';
import { UserRole } from '../../../shared/enums/user-role.enum';

export const adminGuard: CanActivateFn = (_route, state) => {
    const authSessionService = inject(AuthSessionService);
    const router = inject(Router);

    const session = authSessionService.session();

    if (session?.user.situation === 'PENDING') {
        return router.createUrlTree(APP_ROUTES.password);
    }

    if (session?.user.role === UserRole.SYSTEM_ADMIN) {
        return true;
    }

    if (session?.house) {
        return router.createUrlTree(TOWNHOUSE_ROUTES.home(session.house.townhouse.slug));
    }

    return router.createUrlTree(SYSTEM_ADMIN_ROUTES.login, {
        queryParams: { returnUrl: state.url },
    });
};
