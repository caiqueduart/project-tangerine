import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role';
import { AuthenticatedActor } from '../models/authenticated-actor';

@Injectable()
export class TownhousePolicy {
    assertCanCreate(actor: AuthenticatedActor): void {
        if (actor.role === UserRole.SYSTEM_ADMIN) return;

        throw new ForbiddenException();
    }

    assertCanManage(actor: AuthenticatedActor, townhouseId: number): void {
        if (actor.role === UserRole.SYSTEM_ADMIN) return;

        if (actor.managedTownhouseIds.includes(townhouseId)) return;

        throw new ForbiddenException();
    }

    getManagementScope(actor: AuthenticatedActor): readonly number[] | undefined {
        if (actor.role === UserRole.SYSTEM_ADMIN) return undefined;

        if (actor.managedTownhouseIds.length) return actor.managedTownhouseIds;

        throw new ForbiddenException();
    }
}
