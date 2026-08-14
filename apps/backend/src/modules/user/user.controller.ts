import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenPayloadDto } from '../auth/dtos/token-payload.dto';
import { TOKEN_PAYLOAD_KEY } from '../auth/auth.constants';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserSituation } from './enums/user-situation';

type AuthenticatedRequest = Request & Record<typeof TOKEN_PAYLOAD_KEY, AccessTokenPayloadDto>;

@Controller('user')
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Post('register')
    register(@Body() body: CreateUserDto) {
        return this._userService.register(body);
    }

    @Post()
    create(@Body() body: CreateUserDto, @Req() request: AuthenticatedRequest) {
        return this._userService.register(body, UserSituation.ACTIVE, request[TOKEN_PAYLOAD_KEY].id);
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
    update(@Param('id') id: string, @Body() body: UpdateUserDto, @Req() request: AuthenticatedRequest) {
        return this._userService.update(id, body, request[TOKEN_PAYLOAD_KEY].id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    reject(@Param('id') id: string, @Req() request: AuthenticatedRequest): Promise<void> {
        return this._userService.reject(id, request[TOKEN_PAYLOAD_KEY].id);
    }
}
