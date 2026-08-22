import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentActor } from '../authorization/decorators/current-actor.decorator';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { Permission } from '../authorization/enums/permission';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import type { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateUserResultDto, GetUserDetailsDto, GetUserDto } from './dtos/get-user.dto';
import { ProvisionalPasswordDto } from './dtos/password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';

@UseGuards(PermissionsGuard)
@Controller('user')
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @RequirePermissions(Permission.USER_CREATE)
    @Post()
    create(@Body() body: CreateUserDto, @CurrentActor() actor: AuthenticatedActor): Promise<CreateUserResultDto> {
        return this._userService.create(body, actor);
    }

    @RequirePermissions(Permission.USER_READ)
    @Get('all')
    getAll(
        @CurrentActor() actor: AuthenticatedActor,
        @Query('townhouseId') townhouseId?: string,
    ): Promise<GetUserDto[]> {
        return this._userService.getAll(actor, townhouseId ? Number(townhouseId) : undefined);
    }

    @RequirePermissions(Permission.USER_READ)
    @Get(':id/details')
    getDetails(@Param('id') id: string, @CurrentActor() actor: AuthenticatedActor): Promise<GetUserDetailsDto> {
        return this._userService.getDetails(id, actor);
    }

    @RequirePermissions(Permission.USER_PROVISIONAL_PASSWORD_CREATE)
    @Post(':id/provisional-password')
    regenerateProvisionalPassword(
        @Param('id') id: string,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<ProvisionalPasswordDto> {
        return this._userService.regenerateProvisionalPassword(id, actor);
    }

    @RequirePermissions(Permission.USER_READ)
    @Get(':id')
    getOne(@Param('id') id: string, @CurrentActor() actor: AuthenticatedActor): Promise<GetUserDto> {
        return this._userService.getForActor(id, actor);
    }

    @RequirePermissions(Permission.USER_UPDATE)
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto,
        @CurrentActor() actor: AuthenticatedActor,
    ): Promise<GetUserDto> {
        return this._userService.update(id, body, actor);
    }
}
