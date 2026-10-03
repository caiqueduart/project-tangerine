import { Module } from '@nestjs/common';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from './entities/house.entity';
import { AuthorizationModule } from '../authorization/authorization.module';
import { TownhouseModule } from '../townhouse/townhouse.module';

@Module({
    imports: [AuthorizationModule, TownhouseModule, TypeOrmModule.forFeature([House])],
    controllers: [HouseController],
    providers: [HouseService],
    exports: [HouseService],
})
export class HouseModule {}
