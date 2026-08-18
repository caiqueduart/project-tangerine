import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';
import { TownhousePolicy } from './townhouse.policy';

describe('TownhousePolicy', () => {
    const policy = new TownhousePolicy();

    it('permite que o administrador do sistema gerencie qualquer condomínio', () => {
        const actor: AuthenticatedActor = {
            userId: 'admin-id',
            role: UserRole.SYSTEM_ADMIN,
        };

        expect(() => policy.assertCanManage(actor, 10)).not.toThrow();
    });

    it('permite que o gestor gerencie seu condomínio', () => {
        const actor: AuthenticatedActor = {
            userId: 'manager-id',
            role: UserRole.TOWNHOUSE_MANAGER,
            houseId: 7,
            townhouseId: 2,
        };

        expect(() => policy.assertCanManage(actor, 2)).not.toThrow();
    });

    it('rejeita um gestor tentando administrar outro condomínio', () => {
        const actor: AuthenticatedActor = {
            userId: 'manager-id',
            role: UserRole.TOWNHOUSE_MANAGER,
            houseId: 7,
            townhouseId: 2,
        };

        expect(() => policy.assertCanManage(actor, 3)).toThrow(ForbiddenException);
    });

    it('rejeita a administração por um morador comum', () => {
        const actor: AuthenticatedActor = {
            userId: 'resident-id',
            role: UserRole.RESIDENT,
            houseId: 7,
            townhouseId: 2,
        };

        expect(() => policy.assertCanManage(actor, 2)).toThrow(ForbiddenException);
    });
});
