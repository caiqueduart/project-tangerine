import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @Public()
    @Post('login')
    login(@Body() credentials: LoginDto): Promise<object> {
        return this._authService.login(credentials);
    }

    @Post('refresh')
    refreshTokens(@Body() token: RefreshTokenDTO) {
        return this._authService.refreshTokens(token);
    }
}
