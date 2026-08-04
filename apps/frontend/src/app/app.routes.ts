import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { APP_SEGMENTS } from './core/config/routes/app-routes.config';
import { AUTH_SEGMENTS } from './core/config/routes/auth-routes.config';
import { SYSTEM_ADMIN_SEGMENTS } from './core/config/routes/system-admin-routes.config';
import { TOWNHOUSE_SEGMENTS } from './core/config/routes/townhouse-routes.config';

export const routes: Routes = [
    {
        path: APP_SEGMENTS.notFound,
        loadComponent: () =>
            import('./features/errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
    },
    {
        path: SYSTEM_ADMIN_SEGMENTS.root,
        loadChildren: () => import('./features/system-admin/system-admin.routes').then((r) => r.routes),
    },
    {
        path: TOWNHOUSE_SEGMENTS.root,
        loadComponent: () => import('./core/townhouse/townhouse-shell/townhouse-shell').then((m) => m.TownhouseShell),
        children: [
            {
                path: AUTH_SEGMENTS.root,
                loadComponent: () => import('./layout/public-layout/public-layout').then((m) => m.PublicLayout),
                canActivate: [guestGuard],
                canActivateChild: [guestGuard],
                children: [
                    {
                        path: APP_SEGMENTS.empty,
                        loadChildren: () => import('./features/auth/auth.routes').then((r) => r.routes),
                    },
                ],
            },
            {
                path: APP_SEGMENTS.empty,
                loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
                canActivate: [authGuard],
                canActivateChild: [authGuard],
                children: [
                    {
                        path: TOWNHOUSE_SEGMENTS.home,
                        pathMatch: 'full',
                        loadComponent: () => import('./features/home/home').then((m) => m.Home),
                    },
                ],
            },
            {
                path: APP_SEGMENTS.wildcard,
                loadComponent: () =>
                    import('./features/errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
            },
        ],
    },
    {
        path: APP_SEGMENTS.wildcard,
        loadComponent: () =>
            import('./features/errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
    },
];
