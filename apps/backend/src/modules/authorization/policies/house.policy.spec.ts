import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';
import { HousePolicy } from './house.policy';

describe('HousePolicy', () => {
    const policy = new HousePolicy();
    const actor: AuthenticatedActor = {
        userId: 'resident-id',
        role: UserRole.RESIDENT,
        houseId: 7,
        townhouseId: 2,
    };

    it('permite que o usuário atue pela própria casa', () => {
        expect(() => policy.assertCanActForHouse(actor, 7)).not.toThrow();
    });

    it('rejeita uma ação em nome de outra casa', () => {
        expect(() => policy.assertCanActForHouse(actor, 8)).toThrow(ForbiddenException);
    });
});
