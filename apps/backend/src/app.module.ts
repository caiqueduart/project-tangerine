import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TownhouseModule } from './modules/townhouse/townhouse.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        AuthModule,
        TownhouseModule,
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: process.env.DATABASE_TYPE as 'postgres',
            database: process.env.DATABASE_PATH,
            autoLoadEntities: Boolean(process.env.DATABASE_AUTO_LOAD_ENTITIES),
            synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
