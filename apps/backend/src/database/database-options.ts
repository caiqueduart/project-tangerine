import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { normalizeEnvironment } from '../config/environment';
import { House } from '../modules/house/entities/house.entity';
import { ManagerPermission } from '../modules/manager-permission/entities/manager-permission.entity';
import { Townhouse } from '../modules/townhouse/entities/townhouse.entity';
import { Resident } from '../modules/user/entities/resident.entity';
import { UserAudit } from '../modules/user/entities/user-audit.entity';
import { User } from '../modules/user/entities/user.entity';

export function createDatabaseOptions(values: Record<string, unknown>): PostgresConnectionOptions {
    const environment = normalizeEnvironment(values);

    return {
        type: 'postgres',
        host: environment.DATABASE_HOST as string,
        port: environment.DATABASE_PORT,
        username: environment.DATABASE_USERNAME as string,
        password: environment.DATABASE_PASSWORD as string,
        database: environment.DATABASE_NAME as string,
        synchronize: environment.DATABASE_SYNCHRONIZE,
        entities: [Townhouse, House, User, Resident, UserAudit, ManagerPermission],
        migrations: [],
    };
}
