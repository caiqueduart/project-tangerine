import { UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationTokenType } from './dtos/token-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../common/services/hash.service';
import { UserService } from '../user/user.service';
import { UserSituation } from '../user/enums/user-situation';
import { UserRole } from '../user/enums/user-role';

describe('AuthenticationService', () => {
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
        completeFirstAccess: jest.fn(),
        changePassword: jest.fn(),
    };

    let service: AuthenticationService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AuthenticationService(
            jwtConfiguration,
            jwtService as unknown as JwtService,
            hashService as unknown as HashService,
            userService as unknown as UserService,
        );
    });

    it('retorna access e refresh tokens no login', async () => {
        userService.findUserByLogin.mockResolvedValue({
            id: 'user-id',
            firstName: 'Maria',
            lastName: 'Silva',
            passwordHash: 'password-hash',
            situation: UserSituation.ACTIVE,
            role: UserRole.USER,
            managerPermissions: [
                {
                    townhouseId: 4,
                    situation: 'ACTIVE',
                    townhouse: {
                        id: 4,
                        name: 'Condomínio das Flores',
                        slug: 'flores',
                    },
                },
            ],
            resident: {
                house: {
                    id: 7,
                    identifier: 'Casa 7',
                    townhouse: {
                        id: 2,
                        name: 'Condomínio Corumbá II',
                        slug: 'corumba-ii',
                    },
                },
            },
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
            session: {
                user: {
                    id: 'user-id',
                    firstName: 'Maria',
                    lastName: 'Silva',
                    role: UserRole.USER,
                    situation: UserSituation.ACTIVE,
                },
                managerPermissions: [
                    {
                        townhouse: {
                            id: 4,
                            name: 'Condomínio das Flores',
                            slug: 'flores',
                        },
                    },
                ],
                house: {
                    id: 7,
                    identifier: 'Casa 7',
                    townhouse: {
                        id: 2,
                        name: 'Condomínio Corumbá II',
                        slug: 'corumba-ii',
                    },
                },
            },
        });
        expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
        expect(jwtService.signAsync).toHaveBeenNthCalledWith(
            1,
            {
                id: 'user-id',
                tokenType: AuthenticationTokenType.ACCESS,
            },
            {
                audience: jwtConfiguration.audience,
                issuer: jwtConfiguration.issuer,
                secret: jwtConfiguration.secret,
                expiresIn: jwtConfiguration.ttl,
            },
        );
        expect(jwtService.signAsync).toHaveBeenNthCalledWith(
            2,
            {
                id: 'user-id',
                tokenType: AuthenticationTokenType.REFRESH,
            },
            {
                audience: jwtConfiguration.audience,
                issuer: jwtConfiguration.issuer,
                secret: jwtConfiguration.refreshSecret,
                expiresIn: jwtConfiguration.refreshTtl,
            },
        );
    });

    it('gera somente um novo access token quando o refresh token é válido', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'user-id',
            tokenType: AuthenticationTokenType.REFRESH,
        });
        userService.get.mockResolvedValue({ id: 'user-id', situation: UserSituation.ACTIVE });
        jwtService.signAsync.mockResolvedValueOnce('new-access-token');

        const result = await service.refreshAccessToken('valid-refresh-token');

        expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
            audience: jwtConfiguration.audience,
            issuer: jwtConfiguration.issuer,
            secret: jwtConfiguration.refreshSecret,
        });
        expect(userService.get).toHaveBeenCalledWith('user-id');
        expect(jwtService.signAsync).toHaveBeenCalledWith(
            {
                id: 'user-id',
                tokenType: AuthenticationTokenType.ACCESS,
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

    it('permite login e renovação de token para usuário pendente', async () => {
        userService.findUserByLogin.mockResolvedValue({
            id: 'pending-id',
            firstName: 'Ana',
            lastName: 'Souza',
            passwordHash: 'temporary-hash',
            situation: UserSituation.PENDING,
            role: UserRole.USER,
            managerPermissions: [],
        });
        hashService.compare.mockResolvedValue(true);
        jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

        const login = await service.login({ uid: '11999999999', password: 'CasaSol2748' });

        expect(login.session.user.situation).toBe(UserSituation.PENDING);

        jest.clearAllMocks();
        jwtService.verifyAsync.mockResolvedValue({
            id: 'pending-id',
            tokenType: AuthenticationTokenType.REFRESH,
        });
        userService.get.mockResolvedValue({ id: 'pending-id', situation: UserSituation.PENDING });
        jwtService.signAsync.mockResolvedValue('new-access-token');

        await expect(service.refreshAccessToken('refresh-token')).resolves.toEqual({
            accessToken: 'new-access-token',
        });
    });

    it('rejeita um access token enviado como refresh token', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'user-id',
            tokenType: AuthenticationTokenType.ACCESS,
        });

        await expect(service.refreshAccessToken('access-token')).rejects.toThrow(UnauthorizedException);
        expect(userService.get).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita refresh token inválido ou expirado', async () => {
        jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

        await expect(service.refreshAccessToken('invalid-refresh-token')).rejects.toThrow(UnauthorizedException);
        expect(userService.get).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita refresh token de usuário que não existe mais', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'removed-user-id',
            tokenType: AuthenticationTokenType.REFRESH,
        });
        userService.get.mockRejectedValue(new Error('user not found'));

        await expect(service.refreshAccessToken('valid-refresh-token')).rejects.toThrow(UnauthorizedException);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita login de usuário inativo mesmo quando a senha é válida', async () => {
        userService.findUserByLogin.mockResolvedValue({
            id: 'inactive-user-id',
            passwordHash: 'password-hash',
            situation: UserSituation.INACTIVE,
        });
        hashService.compare.mockResolvedValue(true);

        await expect(service.login({ uid: 'inativo@email.com', password: '1234' })).rejects.toThrow(
            UnauthorizedException,
        );
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita refresh token de usuário que deixou de estar ativo', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            id: 'inactive-user-id',
            tokenType: AuthenticationTokenType.REFRESH,
        });
        userService.get.mockResolvedValue({ id: 'inactive-user-id', situation: UserSituation.INACTIVE });

        await expect(service.refreshAccessToken('valid-refresh-token')).rejects.toThrow(UnauthorizedException);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejeita refresh sem cookie', async () => {
        await expect(service.refreshAccessToken(undefined)).rejects.toThrow(UnauthorizedException);
        expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
});
