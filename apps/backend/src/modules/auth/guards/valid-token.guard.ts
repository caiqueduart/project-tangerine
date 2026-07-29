import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../configs/jwt.config';
import * as config from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { TokenPayloadDto } from '../dtos/token-payload.dto';

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

        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;

        if (!authorization) throw new UnauthorizedException();

        const token = authorization.split(' ')[1];

        try {
            request[TOKEN_PAYLOAD_KEY] = (await this._jwtService.verifyAsync(token, this._jwtConfiguration)) as TokenPayloadDto;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
