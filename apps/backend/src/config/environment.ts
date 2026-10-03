export interface DatabaseEnvironmentVariables extends Record<string, unknown> {
    NODE_ENV: string;
    DATABASE_URL?: string;
    DATABASE_PORT: number;
    DATABASE_SYNCHRONIZE: boolean;
    DATABASE_SSL: boolean;
    DATABASE_SSL_CA?: string;
}

export interface EnvironmentVariables extends DatabaseEnvironmentVariables {
    PORT: number;
    API_PREFIX: string;
    CORS_ORIGINS: string[];
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_TTL: number;
    JWT_REFRESH_TTL: number;
    PROVISIONAL_PASSWORD_TTL_HOURS: number;
}

export function normalizeEnvironment(values: Record<string, unknown>): EnvironmentVariables {
    const database = normalizeDatabaseEnvironment(values);
    const production = database.NODE_ENV === 'production';
    const secret = requiredString(values, 'JWT_SECRET');
    const refreshSecret = optionalString(values.JWT_REFRESH_SECRET) ?? secret;

    if (production && (secret.length < 32 || refreshSecret.length < 32)) {
        throw new Error('JWT_SECRET e JWT_REFRESH_SECRET devem ter pelo menos 32 caracteres em produção.');
    }

    const origins = optionalString(values.CORS_ORIGINS) ?? (production ? '' : 'http://localhost:4200');
    const corsOrigins = origins.split(',').map((origin) => origin.trim());

    if (corsOrigins.some((origin) => !isOrigin(origin, production))) {
        throw new Error('CORS_ORIGINS deve conter origens HTTP válidas, sem caminhos; em produção, use HTTPS.');
    }

    const apiPrefix = values.API_PREFIX ?? (production ? 'api' : '');

    if (
        typeof apiPrefix !== 'string' ||
        (apiPrefix !== '' && !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(apiPrefix))
    ) {
        throw new Error('API_PREFIX deve ser um caminho sem barras nas extremidades, ou vazio.');
    }

    return {
        ...database,
        PORT: parsePositiveInteger(values.PORT, 'PORT', 3000, 65535),
        API_PREFIX: apiPrefix,
        CORS_ORIGINS: corsOrigins.map((origin) => new URL(origin).origin),
        JWT_SECRET: secret,
        JWT_REFRESH_SECRET: refreshSecret,
        JWT_TTL: parsePositiveInteger(values.JWT_TTL, 'JWT_TTL', 900),
        JWT_REFRESH_TTL: parsePositiveInteger(values.JWT_REFRESH_TTL, 'JWT_REFRESH_TTL', 3600),
        PROVISIONAL_PASSWORD_TTL_HOURS: parsePositiveInteger(
            values.PROVISIONAL_PASSWORD_TTL_HOURS,
            'PROVISIONAL_PASSWORD_TTL_HOURS',
            72,
        ),
    };
}

// A CLI de migrations precisa somente da configuração do banco, sem segredos de autenticação.
export function normalizeDatabaseEnvironment(values: Record<string, unknown>): DatabaseEnvironmentVariables {
    const nodeEnvironment = values.NODE_ENV ?? 'development';
    const synchronize = parseBoolean(values.DATABASE_SYNCHRONIZE, 'DATABASE_SYNCHRONIZE');

    if (typeof nodeEnvironment !== 'string' || !['development', 'test', 'production'].includes(nodeEnvironment)) {
        throw new Error('NODE_ENV deve ser development, test ou production.');
    }

    if (nodeEnvironment === 'production' && synchronize) {
        throw new Error('DATABASE_SYNCHRONIZE não pode ser habilitado em produção.');
    }

    const databaseUrl = optionalString(values.DATABASE_URL);

    if (databaseUrl) {
        let url: URL;

        try {
            url = new URL(databaseUrl);
        } catch {
            throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida.');
        }

        if (
            !['postgres:', 'postgresql:'].includes(url.protocol) ||
            !url.hostname ||
            !url.username ||
            url.pathname.length < 2
        ) {
            throw new Error('DATABASE_URL deve incluir protocolo PostgreSQL, host, usuário e banco.');
        }

        if ([...url.searchParams.keys()].some((key) => key.toLowerCase().startsWith('ssl'))) {
            throw new Error('Configure TLS com DATABASE_SSL e DATABASE_SSL_CA, sem parâmetros ssl na DATABASE_URL.');
        }
    } else {
        for (const name of ['DATABASE_HOST', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME']) {
            requiredString(values, name);
        }
    }

    const ssl = parseBoolean(values.DATABASE_SSL, 'DATABASE_SSL', nodeEnvironment === 'production');
    const sslCa = optionalString(values.DATABASE_SSL_CA)?.replace(/\\n/g, '\n');

    if (sslCa && (!ssl || !sslCa.includes('-----BEGIN CERTIFICATE-----'))) {
        throw new Error('DATABASE_SSL_CA requer DATABASE_SSL=true e um certificado PEM.');
    }

    return {
        ...values,
        NODE_ENV: nodeEnvironment,
        DATABASE_URL: databaseUrl,
        DATABASE_PORT: parsePositiveInteger(values.DATABASE_PORT, 'DATABASE_PORT', 5432, 65535),
        DATABASE_SYNCHRONIZE: synchronize,
        DATABASE_SSL: ssl,
        DATABASE_SSL_CA: sslCa,
    };
}

function parseBoolean(value: unknown, name: string, defaultValue = false): boolean {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;

    if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`${name} deve ser true, false, 1 ou 0.`);
    }

    const normalizedValue = String(value).trim().toLowerCase();

    if (['true', '1'].includes(normalizedValue)) return true;
    if (['false', '0'].includes(normalizedValue)) return false;

    throw new Error(`${name} deve ser true, false, 1 ou 0.`);
}

function parsePositiveInteger(
    value: unknown,
    name: string,
    defaultValue: number,
    maximum = Number.MAX_SAFE_INTEGER,
): number {
    if (value !== undefined && value !== null && typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`${name} deve ser um inteiro entre 1 e ${maximum}.`);
    }

    const parsed = value === undefined || value === null || value === '' ? defaultValue : Number(value);

    if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > maximum) {
        throw new Error(`${name} deve ser um inteiro entre 1 e ${maximum}.`);
    }

    return parsed;
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

function requiredString(values: Record<string, unknown>, name: string): string {
    const value = optionalString(values[name]);

    if (!value) throw new Error(`${name} não foi configurado.`);
    return value;
}

function isOrigin(origin: string, production: boolean): boolean {
    try {
        const url = new URL(origin);
        return (
            (production ? url.protocol === 'https:' : ['http:', 'https:'].includes(url.protocol)) &&
            !url.username &&
            !url.password &&
            url.pathname === '/' &&
            !url.search &&
            !url.hash
        );
    } catch {
        return false;
    }
}
