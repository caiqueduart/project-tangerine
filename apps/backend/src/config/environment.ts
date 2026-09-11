export interface EnvironmentVariables extends Record<string, unknown> {
    NODE_ENV: string;
    PORT: number;
    CORS_ORIGINS: string[];
    DATABASE_PORT: number;
    DATABASE_SYNCHRONIZE: boolean;
}

export function normalizeEnvironment(values: Record<string, unknown>): EnvironmentVariables {
    const nodeEnvironment = String(values.NODE_ENV ?? 'development');
    const synchronize = parseBoolean(values.DATABASE_SYNCHRONIZE);

    if (nodeEnvironment === 'production' && synchronize) {
        throw new Error('DATABASE_SYNCHRONIZE não pode ser habilitado em produção.');
    }

    return {
        ...values,
        NODE_ENV: nodeEnvironment,
        PORT: Number(values.PORT ?? 3000),
        CORS_ORIGINS: String(values.CORS_ORIGINS ?? 'http://localhost:4200')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
        DATABASE_PORT: Number(values.DATABASE_PORT ?? 5432),
        DATABASE_SYNCHRONIZE: synchronize,
    };
}

function parseBoolean(value: unknown): boolean {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'boolean') return value;

    const normalizedValue = String(value).trim().toLowerCase();

    if (['true', '1'].includes(normalizedValue)) return true;
    if (['false', '0'].includes(normalizedValue)) return false;

    throw new Error('DATABASE_SYNCHRONIZE deve ser true, false, 1 ou 0.');
}
