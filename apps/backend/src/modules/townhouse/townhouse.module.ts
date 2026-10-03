import { Module } from '@nestjs/common';
import { TownhouseController } from './townhouse.controller';
import { TownhouseService } from './townhouse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Townhouse } from './entities/townhouse.entity';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
    imports: [AuthorizationModule, TypeOrmModule.forFeature([Townhouse])],
    controllers: [TownhouseController],
    providers: [TownhouseService],
    exports: [TownhouseService],
})
export class TownhouseModule {}
