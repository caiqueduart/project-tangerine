import { normalizeDatabaseEnvironment, normalizeEnvironment } from './environment';

describe('normalizeEnvironment', () => {
    const values = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/tangerine',
        JWT_SECRET: 'a'.repeat(32),
    };

    it('normaliza os valores usados pela aplicação', () => {
        const environment = normalizeEnvironment({
            ...values,
            PORT: '3001',
            DATABASE_PORT: '5432',
            DATABASE_SYNCHRONIZE: 'false',
            CORS_ORIGINS: 'https://app.example.com, https://admin.example.com',
        });

        expect(environment.PORT).toBe(3001);
        expect(environment.DATABASE_PORT).toBe(5432);
        expect(environment.DATABASE_SYNCHRONIZE).toBe(false);
        expect(environment.CORS_ORIGINS).toEqual(['https://app.example.com', 'https://admin.example.com']);
        expect(environment.API_PREFIX).toBe('');
    });

    it('rejeita synchronize habilitado em produção', () => {
        expect(() =>
            normalizeEnvironment({
                NODE_ENV: 'production',
                DATABASE_SYNCHRONIZE: 'true',
            }),
        ).toThrow('DATABASE_SYNCHRONIZE não pode ser habilitado em produção.');
    });

    it('usa /api e TLS por padrão em produção', () => {
        const environment = normalizeEnvironment({
            ...values,
            NODE_ENV: 'production',
            CORS_ORIGINS: 'https://frontend.example.com',
        });

        expect(environment.API_PREFIX).toBe('api');
        expect(environment.DATABASE_SSL).toBe(true);
        expect(environment.JWT_TTL).toBe(900);
        expect(environment.JWT_REFRESH_TTL).toBe(3600);
        expect(environment.PROVISIONAL_PASSWORD_TTL_HOURS).toBe(72);
    });

    it.each([
        ['PORT', 'invalid'],
        ['PORT', '65536'],
        ['DATABASE_PORT', '-1'],
        ['JWT_TTL', 'NaN'],
        ['JWT_REFRESH_TTL', '0'],
        ['JWT_TTL', '1.5'],
        ['PROVISIONAL_PASSWORD_TTL_HOURS', '0'],
        ['NODE_ENV', 'prod'],
        ['API_PREFIX', '/api/'],
        ['DATABASE_SSL', 'maybe'],
        ['JWT_SECRET', ''],
        ['CORS_ORIGINS', '*'],
        ['CORS_ORIGINS', 'https://frontend.example.com/path'],
    ])('rejeita %s inválido (%s)', (name, value) => {
        expect(() => normalizeEnvironment({ ...values, [name]: value })).toThrow(name);
    });

    it.each([
        { CORS_ORIGINS: '' },
        { CORS_ORIGINS: 'http://frontend.example.com' },
        { JWT_SECRET: 'short' },
        { JWT_REFRESH_SECRET: 'short' },
    ])('rejeita configuração incompleta ou inválida de produção: %o', (overrides) => {
        expect(() =>
            normalizeEnvironment({
                ...values,
                NODE_ENV: 'production',
                CORS_ORIGINS: 'https://frontend.example.com',
                ...overrides,
            }),
        ).toThrow();
    });
});

describe('normalizeDatabaseEnvironment', () => {
    it('permite executar migrations sem configuração HTTP ou JWT', () => {
        expect(
            normalizeDatabaseEnvironment({
                NODE_ENV: 'production',
                DATABASE_URL: 'postgresql://user:password@localhost:5432/tangerine',
            }).DATABASE_SSL,
        ).toBe(true);
    });

    it('aceita parâmetros separados para o banco local', () => {
        expect(
            normalizeDatabaseEnvironment({
                DATABASE_HOST: 'localhost',
                DATABASE_USERNAME: 'postgres',
                DATABASE_PASSWORD: 'password',
                DATABASE_NAME: 'tangerine',
            }).DATABASE_SSL,
        ).toBe(false);
    });

    it('rejeita credenciais ausentes', () => {
        expect(() => normalizeDatabaseEnvironment({})).toThrow('DATABASE_HOST');
    });

    it.each(['invalid', 'https://example.com/db', 'postgresql://localhost/db', 'postgresql://user@localhost'])(
        'rejeita DATABASE_URL inválida: %s',
        (DATABASE_URL) => {
            expect(() => normalizeDatabaseEnvironment({ DATABASE_URL })).toThrow('DATABASE_URL');
        },
    );

    it('impede que parâmetros da URL sobrescrevam a validação TLS do driver', () => {
        expect(() =>
            normalizeDatabaseEnvironment({ DATABASE_URL: 'postgresql://user@localhost/db?sslmode=no-verify' }),
        ).toThrow('DATABASE_SSL');
    });
});
