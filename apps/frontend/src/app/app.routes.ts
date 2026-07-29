import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '404',
        loadComponent: () => import('./features/errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
    },
    {
        path: ':slug',
        loadComponent: () => import('./core/townhouse/townhouse-shell/townhouse-shell').then((m) => m.TownhouseShell),
        children: [
            {
                path: 'auth',
                loadChildren: () => import('./features/auth/auth.routes').then((r) => r.routes),
            },
            {
                path: '**',
                loadComponent: () => import('./features/errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
            },
        ],
    },
    {
        path: '**',
        loadComponent: () => import('./features/errors/not-found-screen/not-found-screen').then((m) => m.NotFoundScreen),
    },
];
