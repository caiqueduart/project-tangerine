import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/guards/admin.guard';
import { adminGuestGuard } from '../../core/auth/guards/admin-guest.guard';
import { APP_SEGMENTS } from '../../core/config/routes/app-routes.config';
import { SYSTEM_ADMIN_SEGMENTS } from '../../core/config/routes/system-admin-routes.config';

export const routes: Routes = [
    {
        path: SYSTEM_ADMIN_SEGMENTS.login,
        canActivate: [adminGuestGuard],
        loadComponent: () => import('./admin-login-page/admin-login-page').then((m) => m.AdminLoginPage),
    },
    {
        path: APP_SEGMENTS.empty,
        loadComponent: () => import('./system-admin-layout').then((m) => m.SystemAdminLayout),
        canActivate: [adminGuard],
        canActivateChild: [adminGuard],
        children: [
            {
                path: APP_SEGMENTS.empty,
                pathMatch: 'full',
                loadComponent: () => import('./admin-home/admin-home').then((m) => m.AdminHome),
            },
            {
                path: SYSTEM_ADMIN_SEGMENTS.townhouses,
                loadComponent: () =>
                    import('./admin-list-townhouses/admin-list-townhouses').then((m) => m.AdminListTownhouses),
            },
            {
                path: `${SYSTEM_ADMIN_SEGMENTS.townhouses}/:townhouseId`,
                loadComponent: () =>
                    import('./admin-townhouse-details/admin-townhouse-details').then((m) => m.AdminTownhouseDetails),
            },
        ],
    },
    {
        path: APP_SEGMENTS.wildcard,
        loadComponent: () => import('../errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
    },
];
