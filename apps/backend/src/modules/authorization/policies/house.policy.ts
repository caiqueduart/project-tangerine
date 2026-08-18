import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedActor } from '../models/authenticated-actor';

@Injectable()
export class HousePolicy {
    assertCanActForHouse(actor: AuthenticatedActor, houseId: number): void {
        if (actor.houseId === houseId) return;

        throw new ForbiddenException();
    }
}
