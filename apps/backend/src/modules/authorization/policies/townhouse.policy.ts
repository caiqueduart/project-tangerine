import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';

@Injectable()
export class TownhousePolicy {
    assertCanManage(actor: AuthenticatedActor, townhouseId: number): void {
        if (actor.role === UserRole.SYSTEM_ADMIN) return;

        if (actor.role === UserRole.TOWNHOUSE_MANAGER && actor.townhouseId === townhouseId) return;

        throw new ForbiddenException();
    }
}
