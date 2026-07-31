import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';
import { AccessTokenDto } from './dtos/access-token.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @Public()
    @Post('login')
    login(@Body() credentials: LoginDto): Promise<LoginResponseDto> {
        return this._authService.login(credentials);
    }

    @Public()
    @Post('refresh')
    refreshAccessToken(@Body() token: RefreshTokenDTO): Promise<AccessTokenDto> {
        return this._authService.refreshAccessToken(token);
    }
}
