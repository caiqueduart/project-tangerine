import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '../user/user.service';
import { HashService } from '../common/services/hash.service';
import jwtConfig from './configs/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';
import { AccessTokenPayloadDto, AuthTokenType, RefreshTokenPayloadDto } from './dtos/token-payload.dto';
import { AuthTokensDto } from './dtos/auth-tokens.dto';
import { User } from '../user/entities/user.entity';
import { GetUserDto } from '../user/dtos/user.dto';
import { AccessTokenDto } from './dtos/access-token.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _hashService: HashService,
        private readonly _userService: UserService,
    ) {}

    async login(credentials: LoginDto): Promise<AuthTokensDto> {
        const user = await this._userService.findUserByLogin(credentials.uid);
        const unauthorizedMessage = 'Usuário ou senha inválidos.';

        if (!user) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const isPasswordValid = await this._hashService.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        return this._generateRefreshAndAccessTokens(user);
    }

    async refreshAccessToken(token: RefreshTokenDTO): Promise<AccessTokenDto> {
        const unauthorizedMessage = 'Refresh token inválido ou expirado.';
        let payload: RefreshTokenPayloadDto;

        try {
            payload = await this._jwtService.verifyAsync<RefreshTokenPayloadDto>(token.refreshToken, {
                audience: this._jwtConfiguration.audience,
                issuer: this._jwtConfiguration.issuer,
                secret: this._jwtConfiguration.refreshSecret,
            });
        } catch {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        if (payload.tokenType !== AuthTokenType.REFRESH || !payload.id) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        let user: GetUserDto;

        try {
            user = await this._userService.get(payload.id);
        } catch {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const accessTokenPayload: AccessTokenPayloadDto = {
            id: payload.id,
            firstName: user.firstName,
            situation: user.situation,
            tokenType: AuthTokenType.ACCESS,
        };

        const accessToken = await this._generateToken(this._jwtConfiguration.ttl, accessTokenPayload, this._jwtConfiguration.secret);

        return { accessToken };
    }

    private async _generateRefreshAndAccessTokens(user: Pick<User, 'id' | 'firstName' | 'situation'>): Promise<AuthTokensDto> {
        const accessTokenPayload: AccessTokenPayloadDto = {
            id: user.id,
            situation: user.situation,
            firstName: user.firstName,
            tokenType: AuthTokenType.ACCESS,
        };

        const refreshTokenPayload: RefreshTokenPayloadDto = {
            id: user.id,
            tokenType: AuthTokenType.REFRESH,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this._generateToken(this._jwtConfiguration.ttl, accessTokenPayload, this._jwtConfiguration.secret),
            this._generateToken(this._jwtConfiguration.refreshTtl, refreshTokenPayload, this._jwtConfiguration.refreshSecret),
        ]);

        return { accessToken, refreshToken };
    }

    private async _generateToken(expiresIn: number, payload: AccessTokenPayloadDto | RefreshTokenPayloadDto, secret: string): Promise<string> {
        return this._jwtService.signAsync(payload, {
            audience: this._jwtConfiguration.audience,
            issuer: this._jwtConfiguration.issuer,
            secret,
            expiresIn: expiresIn,
        });
    }
}
