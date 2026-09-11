import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database-options';

export default new DataSource({
    ...createDatabaseOptions(process.env),
    synchronize: false,
});
