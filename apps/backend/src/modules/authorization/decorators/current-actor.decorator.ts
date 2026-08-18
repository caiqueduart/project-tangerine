import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AUTHENTICATED_ACTOR_KEY } from '../authorization.constants';
import { AuthenticatedActor } from '../models/authenticated-actor';

type RequestWithAuthenticatedActor = Request & Partial<Record<typeof AUTHENTICATED_ACTOR_KEY, AuthenticatedActor>>;

export const CurrentActor = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedActor => {
    const request = context.switchToHttp().getRequest<RequestWithAuthenticatedActor>();
    const actor = request[AUTHENTICATED_ACTOR_KEY];

    if (!actor) throw new UnauthorizedException();

    return actor;
});
