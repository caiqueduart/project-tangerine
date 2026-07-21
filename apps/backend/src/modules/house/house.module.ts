import { Module } from '@nestjs/common';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {House} from "./house.entity";
import {Townhouse} from "../townhouse/townhouse.entity";

@Module({
  imports: [TypeOrmModule.forFeature([House, Townhouse])],
  controllers: [HouseController],
  providers: [HouseService]
})
export class HouseModule {}
