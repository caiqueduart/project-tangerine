import { Module } from '@nestjs/common';
import { TownhouseController } from './townhouse.controller';
import { TownhouseService } from './townhouse.service';
import { HouseModule } from '../house/house.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Townhouse } from './townhouse.entity';

@Module({
    imports: [HouseModule, TypeOrmModule.forFeature([Townhouse])],
    controllers: [TownhouseController],
    providers: [TownhouseService],
})
export class TownhouseModule {}
