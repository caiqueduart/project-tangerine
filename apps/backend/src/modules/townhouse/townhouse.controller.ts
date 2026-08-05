import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TownhouseService } from './townhouse.service';
import {
    CreateTownhouseDto,
    GetTownhouseDto,
    TownhouseDetailsDto,
    TownhouseListItemDto,
    UpdateTownhouseDto,
} from './dtos/townhouse.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('townhouse')
export class TownhouseController {
    constructor(private readonly _townhouseService: TownhouseService) {}

    @Get()
    getAll(): Promise<TownhouseListItemDto[]> {
        return this._townhouseService.getAll();
    }

    @Public()
    @Get('by-slug/:slug')
    getOneBySlug(@Param('slug') slug: string): Promise<GetTownhouseDto> {
        return this._townhouseService.getOneBySlug(slug);
    }

    @Get(':thId')
    getOne(@Param('thId', ParseIntPipe) id: number): Promise<TownhouseDetailsDto> {
        return this._townhouseService.getOne(id);
    }

    @Post()
    post(@Body() data: CreateTownhouseDto): Promise<TownhouseDetailsDto> {
        return this._townhouseService.post(data);
    }

    @Patch(':thId')
    updateOne(@Param('thId', ParseIntPipe) id: number, @Body() data: UpdateTownhouseDto): Promise<TownhouseDetailsDto> {
        return this._townhouseService.updateOne(id, data);
    }

    @Delete(':thId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteOne(@Param('thId', ParseIntPipe) id: number): Promise<void> {
        return this._townhouseService.deleteOne(id);
    }
}
