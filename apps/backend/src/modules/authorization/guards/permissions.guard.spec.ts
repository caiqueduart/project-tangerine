import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/enums/user-role';
import { AUTHENTICATED_ACTOR_KEY } from '../authorization.constants';
import { Permission } from '../enums/permission';
import { AuthenticatedActor } from '../models/authenticated-actor';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
    const reflector = {
        getAllAndOverride: jest.fn(),
    };
    const request: Record<string, unknown> = {};
    const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    const actor: AuthenticatedActor = {
        userId: 'manager-id',
        role: UserRole.TOWNHOUSE_MANAGER,
        houseId: 7,
        townhouseId: 2,
    };

    let guard: PermissionsGuard;

    beforeEach(() => {
        jest.clearAllMocks();
        Object.keys(request).forEach((key) => delete request[key]);
        guard = new PermissionsGuard(reflector as unknown as Reflector);
    });

    it('não interfere quando nenhuma permissão foi declarada', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        expect(guard.canActivate(context)).toBe(true);
    });

    it('autoriza quando a role possui todas as permissões exigidas', () => {
        reflector.getAllAndOverride.mockReturnValue([Permission.CONTRIBUTION_CREATE]);
        request[AUTHENTICATED_ACTOR_KEY] = actor;

        expect(guard.canActivate(context)).toBe(true);
    });

    it('rejeita quando a role não possui uma permissão exigida', () => {
        reflector.getAllAndOverride.mockReturnValue([Permission.USER_ROLE_UPDATE]);
        request[AUTHENTICATED_ACTOR_KEY] = actor;

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('rejeita quando não há identidade autenticada na requisição', () => {
        reflector.getAllAndOverride.mockReturnValue([Permission.CONTRIBUTION_CREATE]);

        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
});
