import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../configs/jwt.config';
import * as config from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AccessTokenPayloadDto, AuthenticationTokenType } from '../dtos/token-payload.dto';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { AUTHENTICATED_ACTOR_KEY } from '../../authorization/authorization.constants';
import { AuthenticatedActor } from '../../authorization/models/authenticated-actor';

type AuthenticatedRequest = Request & Partial<Record<typeof AUTHENTICATED_ACTOR_KEY, AuthenticatedActor>>;

@Injectable()
export class ValidTokenGuard implements CanActivate {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _reflector: Reflector,
        private readonly _userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authorization = request.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException();

        const token = authorization.slice('Bearer '.length).trim();

        if (!token) throw new UnauthorizedException();

        let payload: AccessTokenPayloadDto;

        try {
            payload = await this._jwtService.verifyAsync<AccessTokenPayloadDto>(token, {
                audience: this._jwtConfiguration.audience,
                issuer: this._jwtConfiguration.issuer,
                secret: this._jwtConfiguration.secret,
            });
        } catch {
            throw new UnauthorizedException();
        }

        if (!payload.id || payload.tokenType !== AuthenticationTokenType.ACCESS) throw new UnauthorizedException();

        const user = await this._userService.findActiveUserById(payload.id);

        if (!user) throw new UnauthorizedException();

        const house = user.resident?.house;

        request[AUTHENTICATED_ACTOR_KEY] = {
            userId: user.id,
            role: user.role,
            houseId: house?.id,
            townhouseId: house?.townhouse.id,
        };

        return true;
    }
}
