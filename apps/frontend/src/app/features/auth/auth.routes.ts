import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { APP_SEGMENTS } from '../../core/config/routes/app-routes.config';
import { AUTH_SEGMENTS } from '../../core/config/routes/auth-routes.config';
import { LOGIN_PAGE_ROUTE_DATA_KEY, TOWNHOUSE_LOGIN_PAGE_CONFIG } from './login-page/login-page.config';

export const routes: Routes = [
    {
        path: APP_SEGMENTS.empty,
        redirectTo: AUTH_SEGMENTS.login,
        pathMatch: 'full',
    },
    {
        path: AUTH_SEGMENTS.login,
        component: LoginPage,
        data: {
            [LOGIN_PAGE_ROUTE_DATA_KEY]: TOWNHOUSE_LOGIN_PAGE_CONFIG,
        },
    },
];
