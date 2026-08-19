import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../authentication/decorators/public.decorator';
import { CurrentActor } from '../authorization/decorators/current-actor.decorator';
import type { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Public()
    @Post('register')
    register(@Body() body: CreateUserDto) {
        return this._userService.register(body);
    }

    @Post()
    create(@Body() body: CreateUserDto, @CurrentActor() actor: AuthenticatedActor) {
        return this._userService.register(body, actor.userId);
    }

    @Get('all')
    getAll(@Query('townhouseId') townhouseId?: string) {
        return this._userService.getAll(townhouseId ? Number(townhouseId) : undefined);
    }

    @Get(':id/details')
    getDetails(@Param('id') id: string) {
        return this._userService.getDetails(id);
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this._userService.get(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateUserDto, @CurrentActor() actor: AuthenticatedActor) {
        return this._userService.update(id, body, actor.userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    reject(@Param('id') id: string, @CurrentActor() actor: AuthenticatedActor): Promise<void> {
        return this._userService.reject(id, actor.userId);
    }
}
