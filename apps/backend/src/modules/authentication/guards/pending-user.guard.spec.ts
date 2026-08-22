import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTHENTICATED_ACTOR_KEY } from '../../authorization/authorization.constants';
import { UserRole } from '../../user/enums/user-role';
import { UserSituation } from '../../user/enums/user-situation';
import { PendingUserGuard } from './pending-user.guard';

describe('PendingUserGuard', () => {
    const reflector = {
        getAllAndOverride: jest.fn(),
    };
    const request: Record<string, unknown> = {};
    const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    let guard: PendingUserGuard;

    beforeEach(() => {
        jest.clearAllMocks();
        Object.keys(request).forEach((key) => delete request[key]);
        guard = new PendingUserGuard(reflector as unknown as Reflector);
    });

    it('permite a rota de conclusão do primeiro acesso', () => {
        request[AUTHENTICATED_ACTOR_KEY] = {
            userId: 'pending-id',
            role: UserRole.RESIDENT,
            situation: UserSituation.PENDING,
        };
        reflector.getAllAndOverride.mockReturnValue(true);

        expect(guard.canActivate(context)).toBe(true);
    });

    it('bloqueia outras operações para usuário pendente', () => {
        request[AUTHENTICATED_ACTOR_KEY] = {
            userId: 'pending-id',
            role: UserRole.RESIDENT,
            situation: UserSituation.PENDING,
        };
        reflector.getAllAndOverride.mockReturnValue(false);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('não restringe usuário ativo', () => {
        request[AUTHENTICATED_ACTOR_KEY] = {
            userId: 'active-id',
            role: UserRole.RESIDENT,
            situation: UserSituation.ACTIVE,
        };

        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });
});
