import { createDatabaseOptions } from './database-options';

describe('createDatabaseOptions', () => {
    it('prioriza a URL do Supabase sobre parâmetros locais e verifica o certificado TLS', () => {
        const url = 'postgresql://postgres.project:password@pooler.example.com:5432/postgres';
        const options = createDatabaseOptions({
            NODE_ENV: 'production',
            DATABASE_URL: url,
            DATABASE_HOST: 'localhost',
            DATABASE_USERNAME: 'local-user',
            DATABASE_NAME: 'local-database',
        });

        expect(options.url).toBe(url);
        expect(options.host).toBeUndefined();
        expect(options.username).toBeUndefined();
        expect(options.database).toBeUndefined();
        expect(options.ssl).toEqual({ rejectUnauthorized: true });
        expect(options.synchronize).toBe(false);
        expect(options.installExtensions).toBe(false);
    });

    it('encaminha a CA configurada sem desabilitar a verificação TLS', () => {
        const options = createDatabaseOptions({
            DATABASE_URL: 'postgresql://user@localhost/db',
            DATABASE_SSL: 'true',
            DATABASE_SSL_CA: '-----BEGIN CERTIFICATE-----\\ncertificate\\n-----END CERTIFICATE-----',
        });

        expect(options.ssl).toEqual({
            rejectUnauthorized: true,
            ca: '-----BEGIN CERTIFICATE-----\ncertificate\n-----END CERTIFICATE-----',
        });
    });
});
