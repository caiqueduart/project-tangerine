import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

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
                loadComponent: () => import('./layout/public-layout/public-layout').then((m) => m.PublicLayout),
                canActivate: [guestGuard],
                canActivateChild: [guestGuard],
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./features/auth/auth.routes').then((r) => r.routes),
                    },
                ],
            },
            {
                path: '',
                loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
                canActivate: [authGuard],
                canActivateChild: [authGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        loadComponent: () => import('./features/home/home').then((m) => m.Home),
                    },
                ],
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
