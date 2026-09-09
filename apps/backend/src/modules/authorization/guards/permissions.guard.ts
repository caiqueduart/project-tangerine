import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AUTHENTICATED_ACTOR_KEY, REQUIRED_PERMISSIONS_KEY } from '../authorization.constants';
import { Permission } from '../enums/permission';
import { AuthenticatedActor } from '../models/authenticated-actor';
import { getActorPermissions } from '../role-permissions';

type AuthorizationRequest = Request & Partial<Record<typeof AUTHENTICATED_ACTOR_KEY, AuthenticatedActor>>;

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly _reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this._reflector.getAllAndOverride<Permission[]>(REQUIRED_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions?.length) return true;

        const request = context.switchToHttp().getRequest<AuthorizationRequest>();
        const actor = request[AUTHENTICATED_ACTOR_KEY];

        if (!actor) throw new UnauthorizedException();

        const grantedPermissions = getActorPermissions(actor);
        const isAuthorized = requiredPermissions.every((permission) => grantedPermissions.includes(permission));

        if (!isAuthorized) throw new ForbiddenException();

        return true;
    }
}
