import { Module } from '@nestjs/common';
import {TownhouseController} from "./townhouse.controller";
import {TownhouseService} from "./townhouse.service";
import {HouseModule} from "../house/house.module";

@Module({
  imports: [HouseModule],
  controllers: [TownhouseController],
  providers: [TownhouseService],
})
export class TownhouseModule {}
