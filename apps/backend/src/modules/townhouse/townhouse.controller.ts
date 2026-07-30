import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TownhouseService } from './townhouse.service';
import { CreateTownhouseDto, GetTownhouseDto, UpdateTownhouseDto } from './dtos/townhouse.dto';
import { Townhouse } from './entities/townhouse.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('townhouse')
export class TownhouseController {
    constructor(private readonly _townhouseService: TownhouseService) {}

    @Get()
    getAll(): Promise<Townhouse[]> {
        return this._townhouseService.getAll();
    }

    @Public()
    @Get('by-slug/:slug')
    getOneBySlug(@Param('slug') slug: string): Promise<GetTownhouseDto> {
        return this._townhouseService.getOneBySlug(slug);
    }

    @Get(':thId')
    getOne(@Param('thId') id: number): Promise<Townhouse | null> {
        return this._townhouseService.getOne(id);
    }

    @Post()
    post(@Body() data: CreateTownhouseDto): Promise<Townhouse> {
        return this._townhouseService.post(data);
    }

    @Patch(':thId')
    updateOne(@Param('thId') id: number, @Body() data: UpdateTownhouseDto) {
        return this._townhouseService.updateOne(id, data);
    }

    @Delete(':thId')
    deleteOne(@Param('thId') id: number) {
        return this._townhouseService.deleteOne(id);
    }
}
