import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {HouseService} from "./house.service";
import {CreateHouseDto} from "../dtos/house.dto";

@Controller('house')
export class HouseController {
    constructor(private _houseService: HouseService) {}

    @Post()
    post(@Body() house: CreateHouseDto) {
        this._houseService.register(house);
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        this._houseService.getOne(Number(id));
    }
}
