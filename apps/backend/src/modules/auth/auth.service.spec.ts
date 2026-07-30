import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthTokenType } from './dtos/token-payload.dto';
import { UserSituation } from '../user/enums/user-situation';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../common/services/hash.service';
import { UserService } from '../user/user.service';

describe('AuthService', () => {
    const jwtConfiguration = {
        secret: 'access-secret',
        refreshSecret: 'refresh-secret',
        audience: 'test-audience',
        issuer: 'test-issuer',
        ttl: 900,
        refreshTtl: 3600,
    };

    const jwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };
    const hashService = {
        compare: jest.fn(),
    };
    const userService = {
        findUserByLogin: jest.fn(),
        get: jest.fn(),
    };

    let service: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AuthService(jwtConfiguration, jwtService as unknown as JwtService, hashService as unknown as HashService, userService as unknown as UserService);
    });

    it('retorna access e refresh tokens no login', async () => {
        userService.findUserByLogin.mockResolvedValue({
            id: 'user-id',
            firstName: 'Maria',
            situation: UserSituation.ACTIVE,
            passwordHash: 'password-hash',
        });
        hashService.compare.mockResolvedValue(true);
        jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

        const result = await service.login({
            uid: 'maria@email.com',
            password: '1234',
        });

        expect(result).toEqual({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        });
        expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('gera somente um novo access token quando o refresh token é válido', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'user-id',
            tokenType: AuthTokenType.REFRESH,
        });
        userService.get.mockResolvedValue({
            firstName: 'Maria',
            situation: UserSituation.ACTIVE,
        });
        jwtService.signAsync.mockResolvedValueOnce('new-access-token');

        const result = await service.refreshAccessToken({ refreshToken: 'valid-refresh-token' });

        expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
            audience: jwtConfiguration.audience,
            issuer: jwtConfiguration.issuer,
            secret: jwtConfiguration.refreshSecret,
        });
        expect(userService.get).toHaveBeenCalledWith('user-id');
        expect(jwtService.signAsync).toHaveBeenCalledWith(
            {
                id: 'user-id',
                situation: UserSituation.ACTIVE,
                firstName: 'Maria',
                tokenType: AuthTokenType.ACCESS,
            },
            {
                audience: jwtConfiguration.audience,
                issuer: jwtConfiguration.issuer,
                secret: jwtConfiguration.secret,
                expiresIn: jwtConfiguration.ttl,
            },
        );
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('rejeita um access token enviado como refresh token', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'user-id',
            tokenType: AuthTokenType.ACCESS,
        });

        await expect(service.refreshAccessToken({ refreshToken: 'access-token' })).rejects.toThrow(UnauthorizedException);
        expect(userService.get).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita refresh token inválido ou expirado', async () => {
        jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

        await expect(service.refreshAccessToken({ refreshToken: 'invalid-refresh-token' })).rejects.toThrow(UnauthorizedException);
        expect(userService.get).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita refresh token de usuário que não existe mais', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'removed-user-id',
            tokenType: AuthTokenType.REFRESH,
        });
        userService.get.mockRejectedValue(new Error('user not found'));

        await expect(service.refreshAccessToken({ refreshToken: 'valid-refresh-token' })).rejects.toThrow(UnauthorizedException);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
});
