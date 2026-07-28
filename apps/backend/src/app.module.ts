import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TownhouseModule } from './modules/townhouse/townhouse.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        AuthModule,
        UserModule,
        TownhouseModule,
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            autoLoadEntities: Boolean(process.env.DATABASE_AUTO_LOAD_ENTITIES),
            synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
