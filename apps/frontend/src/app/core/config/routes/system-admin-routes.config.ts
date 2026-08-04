import { RouteSegment } from '../models/route-config.model';

export function buildFromSystemAdmin<TSegments extends readonly RouteSegment[]>(...segments: TSegments) {
    return ['/', SYSTEM_ADMIN_SEGMENTS.root, ...segments] as const;
}

export const SYSTEM_ADMIN_SEGMENTS = {
    root: 'admin',
    login: 'login',
} as const;

export const SYSTEM_ADMIN_ROUTES = {
    root: buildFromSystemAdmin(),
    login: buildFromSystemAdmin(SYSTEM_ADMIN_SEGMENTS.login),
} as const;
