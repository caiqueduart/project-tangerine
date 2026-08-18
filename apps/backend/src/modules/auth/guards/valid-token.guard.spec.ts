import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AUTHENTICATED_ACTOR_KEY } from '../../authorization/authorization.constants';
import { UserRole } from '../../user/enums/user-role';
import { UserService } from '../../user/user.service';
import { TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { AuthTokenType } from '../dtos/token-payload.dto';
import { ValidTokenGuard } from './valid-token.guard';

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
        findActiveUserById: jest.fn(),
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
        expect(userService.findActiveUserById).not.toHaveBeenCalled();
    });

    it('anexa o payload e o ator ativo à requisição', async () => {
        const payload = {
            id: 'manager-id',
            tokenType: AuthTokenType.ACCESS,
        };
        reflector.getAllAndOverride.mockReturnValue(false);
        request.headers.authorization = 'Bearer access-token';
        jwtService.verifyAsync.mockResolvedValue(payload);
        userService.findActiveUserById.mockResolvedValue({
            id: payload.id,
            role: UserRole.TOWNHOUSE_MANAGER,
            resident: {
                house: {
                    id: 7,
                    townhouse: { id: 2 },
                },
            },
        });

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(userService.findActiveUserById).toHaveBeenCalledWith(payload.id);
        expect(request[TOKEN_PAYLOAD_KEY]).toBe(payload);
        expect(request[AUTHENTICATED_ACTOR_KEY]).toEqual({
            userId: payload.id,
            role: UserRole.TOWNHOUSE_MANAGER,
            houseId: 7,
            townhouseId: 2,
        });
    });

    it('rejeita um token inválido antes de consultar o usuário', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        request.headers.authorization = 'Bearer invalid-token';
        jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        expect(userService.findActiveUserById).not.toHaveBeenCalled();
    });

    it('rejeita um token válido cujo usuário não está mais ativo', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        request.headers.authorization = 'Bearer access-token';
        jwtService.verifyAsync.mockResolvedValue({
            id: 'inactive-id',
            tokenType: AuthTokenType.ACCESS,
        });
        userService.findActiveUserById.mockResolvedValue(null);

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});
