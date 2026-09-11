import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { normalizeEnvironment } from './config/environment';
import { createDatabaseOptions } from './database/database-options';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { ManagerPermissionModule } from './modules/manager-permission/manager-permission.module';
import { TownhouseModule } from './modules/townhouse/townhouse.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            validate: normalizeEnvironment,
        }),
        TypeOrmModule.forRootAsync({
            useFactory: () => createDatabaseOptions(process.env),
        }),
        AuthenticationModule,
        UserModule,
        TownhouseModule,
        ManagerPermissionModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
