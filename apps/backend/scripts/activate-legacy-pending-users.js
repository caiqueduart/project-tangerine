const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

function loadEnvironment() {
    const environmentPath = path.resolve(__dirname, '..', '.env');
    const content = fs.readFileSync(environmentPath, 'utf8');

    return Object.fromEntries(
        content
            .split(/\r?\n/)
            .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
            .map((line) => {
                const separatorIndex = line.indexOf('=');
                return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
            }),
    );
}

async function activateLegacyPendingUsers() {
    const environment = loadEnvironment();
    const client = new Client({
        host: environment.DATABASE_HOST,
        port: Number(environment.DATABASE_PORT),
        user: environment.DATABASE_USERNAME,
        password: environment.DATABASE_PASSWORD,
        database: environment.DATABASE_NAME,
    });

    await client.connect();

    try {
        const result = await client.query("UPDATE \"user\" SET situation = 'ACTIVE' WHERE situation = 'PENDING'");
        console.log(`Registros de teste ativados: ${result.rowCount ?? 0}`);
    } finally {
        await client.end();
    }
}

activateLegacyPendingUsers().catch((error) => {
    console.error('Não foi possível ativar os registros pendentes.', error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
