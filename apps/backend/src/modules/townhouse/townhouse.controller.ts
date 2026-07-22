import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {TownhouseService} from "./townhouse.service";
import {CreateTownhouseDto, UpdateTownhouseDto} from "./townhouse.dto";
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

  @Patch(':thId')
  updateOne(@Param('thId') id: number, @Body() data: UpdateTownhouseDto) {
    return this._townhouseService.updateOne(id, data)
  }

  @Delete(':thId')
  deleteOne(@Param('thId') id: number) {
    return this._townhouseService.deleteOne(id);
  }
}
