import { normalizeEnvironment } from './environment';

describe('normalizeEnvironment', () => {
    it('normaliza os valores usados pela aplicação', () => {
        const environment = normalizeEnvironment({
            PORT: '3001',
            DATABASE_PORT: '5432',
            DATABASE_SYNCHRONIZE: 'false',
            CORS_ORIGINS: 'https://app.example.com, https://admin.example.com',
        });

        expect(environment.PORT).toBe(3001);
        expect(environment.DATABASE_PORT).toBe(5432);
        expect(environment.DATABASE_SYNCHRONIZE).toBe(false);
        expect(environment.CORS_ORIGINS).toEqual(['https://app.example.com', 'https://admin.example.com']);
    });

    it('rejeita synchronize habilitado em produção', () => {
        expect(() =>
            normalizeEnvironment({
                NODE_ENV: 'production',
                DATABASE_SYNCHRONIZE: 'true',
            }),
        ).toThrow('DATABASE_SYNCHRONIZE não pode ser habilitado em produção.');
    });
});
