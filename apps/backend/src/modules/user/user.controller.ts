import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Post('register')
    register(@Body() body: CreateUserDto) {
        return this._userService.register(body);
    }

    @Get('all')
    getAll() {
        return this._userService.getAll();
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this._userService.get(id);
    }
}
