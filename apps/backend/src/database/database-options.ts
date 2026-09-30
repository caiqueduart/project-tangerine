import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'node:path';
import { normalizeDatabaseEnvironment } from '../config/environment';
import { House } from '../modules/house/entities/house.entity';
import { ManagerPermission } from '../modules/manager-permission/entities/manager-permission.entity';
import { Townhouse } from '../modules/townhouse/entities/townhouse.entity';
import { Resident } from '../modules/user/entities/resident.entity';
import { UserAudit } from '../modules/user/entities/user-audit.entity';
import { User } from '../modules/user/entities/user.entity';

export function createDatabaseOptions(values: Record<string, unknown>): PostgresConnectionOptions {
    const environment = normalizeDatabaseEnvironment(values);

    return {
        type: 'postgres',
        ...(environment.DATABASE_URL
            ? { url: environment.DATABASE_URL }
            : {
                  host: environment.DATABASE_HOST as string,
                  port: environment.DATABASE_PORT,
                  username: environment.DATABASE_USERNAME as string,
                  password: environment.DATABASE_PASSWORD as string,
                  database: environment.DATABASE_NAME as string,
              }),
        ssl: environment.DATABASE_SSL
            ? { rejectUnauthorized: true, ...(environment.DATABASE_SSL_CA ? { ca: environment.DATABASE_SSL_CA } : {}) }
            : false,
        // gen_random_uuid() é nativa no PostgreSQL 13+, sem instalação de extensões pela aplicação.
        uuidExtension: 'pgcrypto',
        installExtensions: false,
        synchronize: environment.DATABASE_SYNCHRONIZE,
        entities: [Townhouse, House, User, Resident, UserAudit, ManagerPermission],
        migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    };
}
