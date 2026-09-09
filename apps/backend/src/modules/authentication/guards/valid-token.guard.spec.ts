import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AUTHENTICATED_ACTOR_KEY } from '../../authorization/authorization.constants';
import { UserRole } from '../../user/enums/user-role';
import { UserService } from '../../user/user.service';
import { AuthenticationTokenType } from '../dtos/token-payload.dto';
import { ValidTokenGuard } from './valid-token.guard';
import { UserSituation } from '../../user/enums/user-situation';

describe('ValidTokenGuard', () => {
    const jwtConfiguration = {
        secret: 'access-secret',
        audience: 'test-audience',
        issuer: 'test-issuer',
    };
    const jwtService = {
        verifyAsync: jest.fn(),
    };
    const reflector = {
        getAllAndOverride: jest.fn(),
    };
    const userService = {
        findAuthenticatableUserById: jest.fn(),
    };
    const request: { headers: { authorization?: string }; [key: string]: unknown } = {
        headers: {},
    };
    const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    let guard: ValidTokenGuard;

    beforeEach(() => {
        jest.clearAllMocks();
        Object.keys(request).forEach((key) => delete request[key]);
        request.headers = {};
        guard = new ValidTokenGuard(
            jwtConfiguration,
            jwtService as unknown as JwtService,
            reflector as unknown as Reflector,
            userService as unknown as UserService,
        );
    });

    it('não autentica novamente uma rota pública', async () => {
        reflector.getAllAndOverride.mockReturnValue(true);

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(jwtService.verifyAsync).not.toHaveBeenCalled();
        expect(userService.findAuthenticatableUserById).not.toHaveBeenCalled();
    });

    it('anexa o ator ativo à requisição', async () => {
        const payload = {
            id: 'manager-id',
            tokenType: AuthenticationTokenType.ACCESS,
        };
        reflector.getAllAndOverride.mockReturnValue(false);
        request.headers.authorization = 'Bearer access-token';
        jwtService.verifyAsync.mockResolvedValue(payload);
        userService.findAuthenticatableUserById.mockResolvedValue({
            id: payload.id,
            role: UserRole.USER,
            situation: UserSituation.ACTIVE,
            resident: {
                house: {
                    id: 7,
                    townhouse: { id: 2 },
                },
            },
            managerPermissions: [
                {
                    townhouseId: 4,
                    situation: 'ACTIVE',
                },
            ],
        });

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(userService.findAuthenticatableUserById).toHaveBeenCalledWith(payload.id);
        expect(request[AUTHENTICATED_ACTOR_KEY]).toEqual({
            userId: payload.id,
            role: UserRole.USER,
            situation: UserSituation.ACTIVE,
            houseId: 7,
            residentialTownhouseId: 2,
            managedTownhouseIds: [4],
        });
    });

    it('rejeita um token inválido antes de consultar o usuário', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        request.headers.authorization = 'Bearer invalid-token';
        jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        expect(userService.findAuthenticatableUserById).not.toHaveBeenCalled();
    });

    it('rejeita um token válido cujo usuário não está mais ativo', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        request.headers.authorization = 'Bearer access-token';
        jwtService.verifyAsync.mockResolvedValue({
            id: 'inactive-id',
            tokenType: AuthenticationTokenType.ACCESS,
        });
        userService.findAuthenticatableUserById.mockResolvedValue(null);

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});
