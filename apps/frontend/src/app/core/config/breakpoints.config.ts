export const BREAKPOINTS = {
    lg: 1024,
} as const;

export const BREAKPOINT_QUERIES = {
    lg: `(width >= ${BREAKPOINTS.lg}px)`,
} as const;
