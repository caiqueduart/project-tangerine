import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';
import { TownhousePolicy } from './townhouse.policy';
import { UserSituation } from '../../user/enums/user-situation';

describe('TownhousePolicy', () => {
    const policy = new TownhousePolicy();

    const systemAdmin: AuthenticatedActor = {
        userId: 'admin-id',
        role: UserRole.SYSTEM_ADMIN,
        situation: UserSituation.ACTIVE,
    };

    const manager: AuthenticatedActor = {
        userId: 'manager-id',
        role: UserRole.TOWNHOUSE_MANAGER,
        situation: UserSituation.ACTIVE,
        houseId: 7,
        townhouseId: 2,
    };

    const resident: AuthenticatedActor = {
        userId: 'resident-id',
        role: UserRole.RESIDENT,
        situation: UserSituation.ACTIVE,
        houseId: 7,
        townhouseId: 2,
    };

    it('permite que o administrador do sistema gerencie qualquer condomínio', () => {
        expect(() => policy.assertCanManage(systemAdmin, 10)).not.toThrow();
    });

    it('permite que o gestor gerencie seu condomínio', () => {
        expect(() => policy.assertCanManage(manager, 2)).not.toThrow();
    });

    it('rejeita um gestor tentando administrar outro condomínio', () => {
        expect(() => policy.assertCanManage(manager, 3)).toThrow(ForbiddenException);
    });

    it('rejeita a administração por um morador comum', () => {
        expect(() => policy.assertCanManage(resident, 2)).toThrow(ForbiddenException);
    });

    it('permite somente ao administrador do sistema criar condomínios', () => {
        expect(() => policy.assertCanCreate(systemAdmin)).not.toThrow();
        expect(() => policy.assertCanCreate(manager)).toThrow(ForbiddenException);
        expect(() => policy.assertCanCreate(resident)).toThrow(ForbiddenException);
    });

    it('limita a listagem do gestor ao próprio condomínio', () => {
        expect(policy.getManagementScope(systemAdmin)).toBeUndefined();
        expect(policy.getManagementScope(manager)).toBe(2);
        expect(() => policy.getManagementScope(resident)).toThrow(ForbiddenException);
    });
});
