export const APP_SEGMENTS = {
    empty: '',
    notFound: '404',
    password: 'alterar-senha',
    wildcard: '**',
} as const;

export const APP_ROUTES = {
    notFound: ['/', APP_SEGMENTS.notFound] as const,
    password: ['/', APP_SEGMENTS.password] as const,
} as const;
