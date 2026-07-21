import {Controller, Get, Param} from '@nestjs/common';
import {TownhouseService} from "./townhouse.service";

@Controller('townhouse')
export class TownhouseController {
  constructor(private readonly _townhouseService: TownhouseService) {}

  @Get(':thId')
  get(@Param('thId') id: number ): string {
    return `Olá, ${id}`;
  }
}
