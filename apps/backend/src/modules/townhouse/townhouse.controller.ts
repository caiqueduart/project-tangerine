import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TownhouseService } from './townhouse.service';
import {
    CreateTownhouseDto,
    GetTownhouseDto,
    TownhouseDetailsDto,
    TownhouseListItemDto,
    TownhouseOptionDto,
    UpdateTownhouseDto,
} from './dtos/townhouse.dto';
import { Public } from '../authentication/decorators/public.decorator';
import { CurrentActor } from '../authorization/decorators/current-actor.decorator';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { Permission } from '../authorization/enums/permission';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import type { AuthenticatedActor } from '../authorization/models/authenticated-actor';

@UseGuards(PermissionsGuard)
@Controller('townhouse')
export class TownhouseController {
    constructor(private readonly _townhouseService: TownhouseService) {}

    @RequirePermissions(Permission.TOWNHOUSE_READ)
    @Get()
    getAll(@CurrentActor() actor: AuthenticatedActor): Promise<TownhouseListItemDto[]> {
        return this._townhouseService.getAll(actor);
    }

    @RequirePermissions(Permission.TOWNHOUSE_READ)
    @Get('options')
    getOptions(@CurrentActor() actor: AuthenticatedActor): Promise<TownhouseOptionDto[]> {
        return this._townhouseService.getOptions(actor);
    }

    @Public()
    @Get('by-slug/:slug')
    getOneBySlug(@Param('slug') slug: string): Promise<GetTownhouseDto> {
        return this._townhouseService.getOneBySlug(slug);
    }

    @RequirePermissions(Permission.TOWNHOUSE_READ)
    @Get(':thId')
    getOne(
        @Param('thId', ParseIntPipe) id: number,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<TownhouseDetailsDto> {
        return this._townhouseService.getOne(id, actor);
    }

    @RequirePermissions(Permission.TOWNHOUSE_CREATE)
    @Post()
    post(@Body() data: CreateTownhouseDto, @CurrentActor() actor: AuthenticatedActor): Promise<TownhouseDetailsDto> {
        return this._townhouseService.post(data, actor);
    }

    @RequirePermissions(Permission.TOWNHOUSE_UPDATE)
    @Patch(':thId')
    updateOne(
        @Param('thId', ParseIntPipe) id: number,
        @Body() data: UpdateTownhouseDto,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<TownhouseDetailsDto> {
        return this._townhouseService.updateOne(id, data, actor);
    }

    @RequirePermissions(Permission.TOWNHOUSE_DELETE)
    @Delete(':thId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteOne(@Param('thId', ParseIntPipe) id: number, @CurrentActor() actor: AuthenticatedActor): Promise<void> {
        return this._townhouseService.deleteOne(id, actor);
    }
}
