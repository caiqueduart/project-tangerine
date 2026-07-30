export const APP_SEGMENTS = {
    notFound: '404',
    wildcard: '**',
} as const;

export const APP_ROUTES = {
    notFound: ['/', APP_SEGMENTS.notFound] as const,
} as const;
