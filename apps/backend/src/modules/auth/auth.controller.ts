import { Body, Controller, Inject, Post, Req, Res } from '@nestjs/common';
import * as config from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Public } from './decorators/public.decorator';
import { AccessTokenDto } from './dtos/access-token.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';
import jwtConfig from './configs/jwt.config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly _authService: AuthService,
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    ) {}

    @Public()
    @Post('login')
    async login(
        @Body() credentials: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponseDto> {
        const { refreshToken, ...loginResponse } = await this._authService.login(credentials);

        response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
            ...this._refreshTokenCookieOptions,
            maxAge: this._jwtConfiguration.refreshTtl * 1000,
        });

        return loginResponse;
    }

    @Public()
    @Post('refresh')
    refreshAccessToken(@Req() request: Request): Promise<AccessTokenDto> {
        return this._authService.refreshAccessToken(request.cookies?.[REFRESH_TOKEN_COOKIE]);
    }

    @Public()
    @Post('logout')
    logout(@Res({ passthrough: true }) response: Response): void {
        response.clearCookie(REFRESH_TOKEN_COOKIE, this._refreshTokenCookieOptions);
    }

    private get _refreshTokenCookieOptions(): CookieOptions {
        return {
            httpOnly: true,
            path: '/auth',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        };
    }
}
