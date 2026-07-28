import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @Post('login')
    login(@Body() credentials: LoginDto) {
        console.log(credentials);
        return this._authService.login(credentials);
    }
}
