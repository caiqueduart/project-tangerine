import { RouteSegment } from '../models/route-config.model';
import { API_BASE_URL } from '../api.config';

export function buildFromTownhouse<TSegments extends readonly RouteSegment[]>(slug: string, ...segments: TSegments) {
    return ['/', slug, ...segments] as const;
}

export const TOWNHOUSE_PARAMS = {
    slug: 'townhouseSlug',
} as const;

export const TOWNHOUSE_SEGMENTS = {
    root: `:${TOWNHOUSE_PARAMS.slug}`,
    home: '',
    edit: 'editar',
} as const;

export const TOWNHOUSE_ROUTES = {
    home: (slug: string) => buildFromTownhouse(slug),
    edit: (slug: string) => buildFromTownhouse(slug, TOWNHOUSE_SEGMENTS.edit),
} as const;

export const TOWNHOUSE_API_ROUTES = {
    root: `${API_BASE_URL}/townhouse`,
    byId: (townhouseId: number) => `${API_BASE_URL}/townhouse/${townhouseId}`,
    bySlug: (slug: string) => `${API_BASE_URL}/townhouse/by-slug/${slug}`,
} as const;
