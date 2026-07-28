import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './jwt.config';
import * as config from '@nestjs/config';
import { LoginUserInfoDto } from './dto/login.dto';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

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
            const payload: LoginUserInfoDto = await this._jwtService.verifyAsync(token, this._jwtConfiguration);
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
