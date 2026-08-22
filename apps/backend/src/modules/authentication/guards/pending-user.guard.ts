import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AUTHENTICATED_ACTOR_KEY } from '../../authorization/authorization.constants';
import { AuthenticatedActor } from '../../authorization/models/authenticated-actor';
import { UserSituation } from '../../user/enums/user-situation';
import { ALLOW_PENDING_USER_KEY } from '../authentication.constants';

type AuthenticatedRequest = Request & Partial<Record<typeof AUTHENTICATED_ACTOR_KEY, AuthenticatedActor>>;

@Injectable()
export class PendingUserGuard implements CanActivate {
    constructor(private readonly _reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const actor = request[AUTHENTICATED_ACTOR_KEY];

        if (!actor || actor.situation !== UserSituation.PENDING) return true;

        const isAllowed = this._reflector.getAllAndOverride<boolean>(ALLOW_PENDING_USER_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isAllowed) return true;

        throw new ForbiddenException('Altere sua senha provisória para continuar.');
    }
}
