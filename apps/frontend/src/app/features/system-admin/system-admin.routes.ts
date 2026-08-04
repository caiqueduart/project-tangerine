import { Routes } from '@angular/router';
import { systemAdminGuard } from '../../core/auth/guards/system-admin.guard';
import { APP_SEGMENTS } from '../../core/config/routes/app-routes.config';
import { SYSTEM_ADMIN_SEGMENTS } from '../../core/config/routes/system-admin-routes.config';

export const routes: Routes = [
    {
        path: SYSTEM_ADMIN_SEGMENTS.login,
        loadComponent: () =>
            import('./system-admin-login-page/system-admin-login-page').then((m) => m.SystemAdminLoginPage),
    },
    {
        path: APP_SEGMENTS.empty,
        loadComponent: () => import('./system-admin-layout/system-admin-layout').then((m) => m.SystemAdminLayout),
        canActivate: [systemAdminGuard],
        canActivateChild: [systemAdminGuard],
        children: [
            {
                path: APP_SEGMENTS.empty,
                pathMatch: 'full',
                loadComponent: () => import('./system-admin-home/system-admin-home').then((m) => m.SystemAdminHome),
            },
        ],
    },
    {
        path: APP_SEGMENTS.wildcard,
        loadComponent: () => import('../errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
    },
];
