import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { HouseService } from './house.service';
import { CreateHouseDto, CreateHousesBatchDto, GetHouseDto, UpdateHouseDto } from './dtos/house.dto';

@Controller('house')
export class HouseController {
    constructor(private _houseService: HouseService) {}

    @Post()
    post(@Body() house: CreateHouseDto): Promise<GetHouseDto> {
        return this._houseService.register(house);
    }

    @Post('batch')
    postBatch(@Body() houses: CreateHousesBatchDto): Promise<GetHouseDto[]> {
        return this._houseService.registerBatch(houses);
    }

    @Get(':houseId')
    getOne(@Param('houseId', ParseIntPipe) id: number): Promise<GetHouseDto> {
        return this._houseService.getOne(id);
    }

    @Patch(':houseId')
    updateOne(@Param('houseId', ParseIntPipe) id: number, @Body() house: UpdateHouseDto): Promise<GetHouseDto> {
        return this._houseService.updateOne(id, house);
    }

    @Delete(':houseId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteOne(@Param('houseId', ParseIntPipe) id: number): Promise<void> {
        return this._houseService.deleteOne(id);
    }
}
