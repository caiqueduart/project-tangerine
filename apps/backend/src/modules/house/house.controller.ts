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
    Query,
    UseGuards,
} from '@nestjs/common';
import { HouseService } from './house.service';
import { CreateHouseDto, CreateHousesBatchDto, GetHouseDto, HouseOptionDto, UpdateHouseDto } from './dtos/house.dto';
import { CurrentActor } from '../authorization/decorators/current-actor.decorator';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { Permission } from '../authorization/enums/permission';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import type { AuthenticatedActor } from '../authorization/models/authenticated-actor';

@UseGuards(PermissionsGuard)
@Controller('house')
export class HouseController {
    constructor(private _houseService: HouseService) {}

    @RequirePermissions(Permission.HOUSE_CREATE)
    @Post()
    post(@Body() house: CreateHouseDto, @CurrentActor() actor: AuthenticatedActor): Promise<GetHouseDto> {
        return this._houseService.register(house, actor);
    }

    @RequirePermissions(Permission.HOUSE_CREATE)
    @Post('batch')
    postBatch(@Body() houses: CreateHousesBatchDto, @CurrentActor() actor: AuthenticatedActor): Promise<GetHouseDto[]> {
        return this._houseService.registerBatch(houses, actor);
    }

    @RequirePermissions(Permission.HOUSE_READ)
    @Get('options')
    getOptions(
        @Query('townhouseId', ParseIntPipe) townhouseId: number,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<HouseOptionDto[]> {
        return this._houseService.getOptions(townhouseId, actor);
    }

    @RequirePermissions(Permission.HOUSE_READ)
    @Get(':houseId')
    getOne(
        @Param('houseId', ParseIntPipe) id: number,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<GetHouseDto> {
        return this._houseService.getOne(id, actor);
    }

    @RequirePermissions(Permission.HOUSE_UPDATE)
    @Patch(':houseId')
    updateOne(
        @Param('houseId', ParseIntPipe) id: number,
        @Body() house: UpdateHouseDto,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<GetHouseDto> {
        return this._houseService.updateOne(id, house, actor);
    }

    @RequirePermissions(Permission.HOUSE_DELETE)
    @Delete(':houseId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteOne(@Param('houseId', ParseIntPipe) id: number, @CurrentActor() actor: AuthenticatedActor): Promise<void> {
        return this._houseService.deleteOne(id, actor);
    }
}
