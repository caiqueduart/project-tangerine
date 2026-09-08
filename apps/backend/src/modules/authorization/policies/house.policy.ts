import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';

@Injectable()
export class HousePolicy {
    assertCanActForHouse(actor: AuthenticatedActor, houseId: number): void {
        if (actor.houseId === houseId) return;

        throw new ForbiddenException();
    }

    assertCanRead(actor: AuthenticatedActor, houseId: number, townhouseId: number): void {
        if (actor.role === UserRole.SYSTEM_ADMIN) return;

        if (actor.role === UserRole.TOWNHOUSE_MANAGER && actor.townhouseId === townhouseId) return;

        if (actor.role === UserRole.RESIDENT && actor.houseId === houseId) return;

        throw new ForbiddenException();
    }
}
