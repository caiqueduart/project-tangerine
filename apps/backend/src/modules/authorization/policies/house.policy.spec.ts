import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';
import { HousePolicy } from './house.policy';
import { UserSituation } from '../../user/enums/user-situation';

describe('HousePolicy', () => {
    const policy = new HousePolicy();
    const resident: AuthenticatedActor = {
        userId: 'resident-id',
        role: UserRole.RESIDENT,
        situation: UserSituation.ACTIVE,
        houseId: 7,
        townhouseId: 2,
    };

    it('permite que o usuário atue pela própria casa', () => {
        expect(() => policy.assertCanActForHouse(resident, 7)).not.toThrow();
    });

    it('rejeita uma ação em nome de outra casa', () => {
        expect(() => policy.assertCanActForHouse(resident, 8)).toThrow(ForbiddenException);
    });

    it('permite que o morador consulte somente a própria casa', () => {
        expect(() => policy.assertCanRead(resident, 7, 2)).not.toThrow();
        expect(() => policy.assertCanRead(resident, 8, 2)).toThrow(ForbiddenException);
    });

    it('permite que o gestor consulte casas somente no próprio condomínio', () => {
        const manager: AuthenticatedActor = {
            userId: 'manager-id',
            role: UserRole.TOWNHOUSE_MANAGER,
            situation: UserSituation.ACTIVE,
            townhouseId: 2,
        };

        expect(() => policy.assertCanRead(manager, 8, 2)).not.toThrow();
        expect(() => policy.assertCanRead(manager, 8, 3)).toThrow(ForbiddenException);
    });

    it('permite que o administrador do sistema consulte qualquer casa', () => {
        const systemAdmin: AuthenticatedActor = {
            userId: 'admin-id',
            role: UserRole.SYSTEM_ADMIN,
            situation: UserSituation.ACTIVE,
        };

        expect(() => policy.assertCanRead(systemAdmin, 8, 3)).not.toThrow();
    });
});
