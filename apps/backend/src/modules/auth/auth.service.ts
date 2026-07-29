import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '../user/user.service';
import { HashService } from '../common/services/hash.service';
import jwtConfig from './configs/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _hashService: HashService,
        private readonly _userService: UserService,
    ) {}

    async login(credentials: LoginDto): Promise<object> {
        const user = await this._userService.findUserByLogin(credentials.uid);
        const unauthorizedMessage = 'Usuário ou senha inválidos.';

        if (!user) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const isPasswordValid = await this._hashService.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const accessToken = await this._generateToken(this._jwtConfiguration.ttl, {
            id: user.id,
            situation: user.situation,
            firstName: user.firstName,
        });

        const refreshToken = await this._generateToken(this._jwtConfiguration.refreshTtl, {
            id: user.id,
        });

        return { accessToken, refreshToken };
    }

    async refreshTokens(token: RefreshTokenDTO) {
        return;
    }

    private async _generateToken(expiresIn: number, payload: object): Promise<string> {
        return this._jwtService.signAsync(payload, {
            audience: this._jwtConfiguration.audience,
            issuer: this._jwtConfiguration.issuer,
            secret: this._jwtConfiguration.secret,
            expiresIn: expiresIn,
        });
    }
}
