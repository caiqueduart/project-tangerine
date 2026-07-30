import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../configs/jwt.config';
import * as config from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { AccessTokenPayloadDto, AuthTokenType } from '../dtos/token-payload.dto';
import { Request } from 'express';

type RequestWithTokenPayload = Request & Partial<Record<typeof TOKEN_PAYLOAD_KEY, AccessTokenPayloadDto>>;

@Injectable()
export class ValidTokenGuard implements CanActivate {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<RequestWithTokenPayload>();
        const authorization = request.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException();

        const token = authorization.slice('Bearer '.length).trim();

        if (!token) throw new UnauthorizedException();

        try {
            const payload = await this._jwtService.verifyAsync<AccessTokenPayloadDto>(token, {
                audience: this._jwtConfiguration.audience,
                issuer: this._jwtConfiguration.issuer,
                secret: this._jwtConfiguration.secret,
            });

            if (payload.tokenType !== AuthTokenType.ACCESS) throw new UnauthorizedException();

            request[TOKEN_PAYLOAD_KEY] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
