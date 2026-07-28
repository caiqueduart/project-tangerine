import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @Public()
    @Post('login')
    login(@Body() credentials: LoginDto): Promise<string> {
        return this._authService.login(credentials);
    }
}
