import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {TownhouseService} from "./townhouse.service";
import {CreateTownhouseDto} from "./townhouse.dto";
import {Townhouse} from "./townhouse.entity";

@Controller('townhouse')
export class TownhouseController {
  constructor(private readonly _townhouseService: TownhouseService) {}

  @Get()
  getAll(): Promise<Townhouse[]> {
    return this._townhouseService.getAll();
  }

  @Get(':thId')
  getOne(@Param('thId') id: number ): Promise<Townhouse | null> {
    return this._townhouseService.getOne(id);
  }

  @Post()
  post(@Body() data: CreateTownhouseDto): Promise<Townhouse> {
    return this._townhouseService.post(data);
  }

  @Delete(':thId')
  deleteOne(@Param('thId') id: number) {
    return this._townhouseService.deleteOne(id);
  }
}
