import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import * as config from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dtos/login.dto';
import { Public } from './decorators/public.decorator';
import { AccessTokenDto } from './dtos/access-token.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { REFRESH_TOKEN_COOKIE } from './authentication.constants';
import jwtConfig from './configs/jwt.config';
import { AllowPendingUser } from './decorators/allow-pending-user.decorator';
import { CurrentActor } from '../authorization/decorators/current-actor.decorator';
import type { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { ChangePasswordDto, CompleteFirstAccessDto } from '../user/dtos/password.dto';

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly _authenticationService: AuthenticationService,
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    ) {}

    @Public()
    @Post('login')
    async login(
        @Body() credentials: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponseDto> {
        const { refreshToken, ...loginResponse } = await this._authenticationService.login(credentials);

        response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
            ...this._refreshTokenCookieOptions,
            maxAge: this._jwtConfiguration.refreshTtl * 1000,
        });

        return loginResponse;
    }

    @Public()
    @Post('refresh')
    refreshAccessToken(@Req() request: Request): Promise<AccessTokenDto> {
        const cookies = request.cookies as Record<string, string | undefined> | undefined;
        return this._authenticationService.refreshAccessToken(cookies?.[REFRESH_TOKEN_COOKIE]);
    }

    @Public()
    @Post('logout')
    logout(@Res({ passthrough: true }) response: Response): void {
        response.clearCookie(REFRESH_TOKEN_COOKIE, this._refreshTokenCookieOptions);
    }

    @AllowPendingUser()
    @Post('complete-first-access')
    async completeFirstAccess(
        @Body() body: CompleteFirstAccessDto,
        @CurrentActor() actor: AuthenticatedActor,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponseDto> {
        const { refreshToken, ...loginResponse } = await this._authenticationService.completeFirstAccess(
            actor.userId,
            body,
        );

        response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
            ...this._refreshTokenCookieOptions,
            maxAge: this._jwtConfiguration.refreshTtl * 1000,
        });

        return loginResponse;
    }

    @Post('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    changePassword(@Body() body: ChangePasswordDto, @CurrentActor() actor: AuthenticatedActor): Promise<void> {
        return this._authenticationService.changePassword(actor.userId, body);
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
