import { Module } from '@nestjs/common';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {House} from "../entities/house.entity";
import {Townhouse} from "../entities/townhouse.entity";

@Module({
  imports: [TypeOrmModule.forFeature([House, Townhouse])],
  controllers: [HouseController],
  providers: [HouseService]
})
export class HouseModule {}
