import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CurrentActor } from '../authorization/decorators/current-actor.decorator';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { Permission } from '../authorization/enums/permission';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import type { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { GrantManagerPermissionDto, ManagerPermissionDto } from './dtos/manager-permission.dto';
import { ManagerPermissionService } from './manager-permission.service';

@UseGuards(PermissionsGuard)
@Controller('townhouse/:townhouseId/manager-permission')
export class ManagerPermissionController {
    constructor(private readonly _managerPermissionService: ManagerPermissionService) {}

    @RequirePermissions(Permission.MANAGER_PERMISSION_READ)
    @Get()
    getActiveByTownhouse(
        @Param('townhouseId', ParseIntPipe) townhouseId: number,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<ManagerPermissionDto[]> {
        return this._managerPermissionService.getActiveByTownhouse(townhouseId, actor);
    }

    @RequirePermissions(Permission.MANAGER_PERMISSION_CREATE)
    @Post()
    grant(
        @Param('townhouseId', ParseIntPipe) townhouseId: number,
        @Body() body: GrantManagerPermissionDto,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<ManagerPermissionDto> {
        return this._managerPermissionService.grant(body.userId, townhouseId, actor);
    }

    @RequirePermissions(Permission.MANAGER_PERMISSION_DELETE)
    @Delete(':userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    revoke(
        @Param('townhouseId', ParseIntPipe) townhouseId: number,
        @Param('userId', ParseUUIDPipe) userId: string,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<void> {
        return this._managerPermissionService.revoke(userId, townhouseId, actor);
    }
}
