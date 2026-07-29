import { Routes } from '@angular/router';
import { LoginScreen } from './login-screen/login-screen';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'login',
        component: LoginScreen,
    },
];
