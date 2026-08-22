import { buildFromTownhouse } from './townhouse-routes.config';
import { API_BASE_URL } from '../api.config';

export const AUTH_SEGMENTS = {
    root: 'auth',
    login: 'login',
    forgotPassword: 'forgot-password',
} as const;

export const AUTH_ROUTES = {
    root: (slug: string) => buildFromTownhouse(slug, AUTH_SEGMENTS.root),
    login: (slug: string) => buildFromTownhouse(slug, AUTH_SEGMENTS.root, AUTH_SEGMENTS.login),
    forgotPassword: (slug: string) => buildFromTownhouse(slug, AUTH_SEGMENTS.root, AUTH_SEGMENTS.forgotPassword),
} as const;

export const AUTH_API_ROUTES = {
    login: `${API_BASE_URL}/auth/login`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
    completeFirstAccess: `${API_BASE_URL}/auth/complete-first-access`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
} as const;
