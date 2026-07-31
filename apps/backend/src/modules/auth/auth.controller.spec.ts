import { Request, Response } from 'express';
import { ConfigType } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';
import jwtConfig from './configs/jwt.config';

describe('AuthController', () => {
    const authService = {
        login: jest.fn(),
        refreshAccessToken: jest.fn(),
    };
    const jwtConfiguration = {
        refreshTtl: 3600,
    };
    const response = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
    };

    let controller: AuthController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new AuthController(
            authService as unknown as AuthService,
            jwtConfiguration as unknown as ConfigType<typeof jwtConfig>,
        );
    });

    it('grava o refresh token em cookie HttpOnly e não o retorna no login', async () => {
        authService.login.mockResolvedValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            session: {
                user: {
                    id: 'user-id',
                    firstName: 'Maria',
                    lastName: 'Silva',
                },
                house: null,
            },
        });

        const result = await controller.login(
            { uid: 'maria@email.com', password: '1234' },
            response as unknown as Response,
        );

        expect(response.cookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, 'refresh-token', {
            httpOnly: true,
            maxAge: 3_600_000,
            path: '/auth',
            sameSite: 'strict',
            secure: false,
        });
        expect(result).toEqual({
            accessToken: 'access-token',
            session: {
                user: {
                    id: 'user-id',
                    firstName: 'Maria',
                    lastName: 'Silva',
                },
                house: null,
            },
        });
    });

    it('renova o access token usando o refresh token do cookie', async () => {
        authService.refreshAccessToken.mockResolvedValue({ accessToken: 'new-access-token' });
        const request = {
            cookies: {
                [REFRESH_TOKEN_COOKIE]: 'refresh-token',
            },
        } as unknown as Request;

        const result = await controller.refreshAccessToken(request);

        expect(authService.refreshAccessToken).toHaveBeenCalledWith('refresh-token');
        expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('remove o cookie no logout', () => {
        controller.logout(response as unknown as Response);

        expect(response.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, {
            httpOnly: true,
            path: '/auth',
            sameSite: 'strict',
            secure: false,
        });
    });
});
