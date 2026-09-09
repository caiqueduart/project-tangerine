import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '../user/user.service';
import { HashService } from '../common/services/hash.service';
import jwtConfig from './configs/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayloadDto, AuthenticationTokenType, RefreshTokenPayloadDto } from './dtos/token-payload.dto';
import { AuthenticationTokensDto } from './dtos/authentication-tokens.dto';
import { User } from '../user/entities/user.entity';
import { AccessTokenDto } from './dtos/access-token.dto';
import { AuthenticationSessionDto } from './dtos/authentication-session.dto';
import { LoginResultDto } from './dtos/login-result.dto';
import { UserSituation } from '../user/enums/user-situation';
import { ChangePasswordDto, CompleteFirstAccessDto } from '../user/dtos/password.dto';
import { ManagerPermissionSituation } from '../manager-permission/enums/manager-permission-situation';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _hashService: HashService,
        private readonly _userService: UserService,
    ) {}

    async login(credentials: LoginDto): Promise<LoginResultDto> {
        const user = await this._userService.findUserByLogin(credentials.uid);
        const unauthorizedMessage = 'Usuário ou senha inválidos.';

        if (!user) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const isPasswordValid = await this._hashService.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        if (![UserSituation.ACTIVE, UserSituation.PENDING].includes(user.situation)) {
            throw new UnauthorizedException('Acesso inativo ou bloqueado.');
        }

        const tokens = await this._generateRefreshAndAccessTokens(user);

        return {
            ...tokens,
            session: this._generateAuthenticationSessionData(user),
        };
    }

    async refreshAccessToken(refreshToken: string | undefined): Promise<AccessTokenDto> {
        const unauthorizedMessage = 'Refresh token inválido ou expirado.';
        let payload: RefreshTokenPayloadDto;

        if (!refreshToken) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        try {
            payload = await this._jwtService.verifyAsync<RefreshTokenPayloadDto>(refreshToken, {
                audience: this._jwtConfiguration.audience,
                issuer: this._jwtConfiguration.issuer,
                secret: this._jwtConfiguration.refreshSecret,
            });
        } catch {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        if (payload.tokenType !== AuthenticationTokenType.REFRESH || !payload.id) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        try {
            const user = await this._userService.get(payload.id);

            if (![UserSituation.ACTIVE, UserSituation.PENDING].includes(user.situation)) {
                throw new UnauthorizedException(unauthorizedMessage);
            }
        } catch {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const accessTokenPayload: AccessTokenPayloadDto = {
            id: payload.id,
            tokenType: AuthenticationTokenType.ACCESS,
        };

        const accessToken = await this._generateToken(
            this._jwtConfiguration.ttl,
            accessTokenPayload,
            this._jwtConfiguration.secret,
        );

        return { accessToken };
    }

    async completeFirstAccess(userId: string, dto: CompleteFirstAccessDto): Promise<LoginResultDto> {
        const user = await this._userService.completeFirstAccess(userId, dto.newPassword);
        const tokens = await this._generateRefreshAndAccessTokens(user);

        return {
            ...tokens,
            session: this._generateAuthenticationSessionData(user),
        };
    }

    changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
        return this._userService.changePassword(userId, dto.currentPassword, dto.newPassword);
    }

    private async _generateRefreshAndAccessTokens(user: Pick<User, 'id'>): Promise<AuthenticationTokensDto> {
        const accessTokenPayload: AccessTokenPayloadDto = {
            id: user.id,
            tokenType: AuthenticationTokenType.ACCESS,
        };

        const refreshTokenPayload: RefreshTokenPayloadDto = {
            id: user.id,
            tokenType: AuthenticationTokenType.REFRESH,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this._generateToken(this._jwtConfiguration.ttl, accessTokenPayload, this._jwtConfiguration.secret),
            this._generateToken(
                this._jwtConfiguration.refreshTtl,
                refreshTokenPayload,
                this._jwtConfiguration.refreshSecret,
            ),
        ]);

        return { accessToken, refreshToken };
    }

    private _generateAuthenticationSessionData(user: User): AuthenticationSessionDto {
        const house = user.resident?.house;

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                situation: user.situation,
            },
            managerPermissions: (user.managerPermissions ?? [])
                .filter((permission) => permission.situation === ManagerPermissionSituation.ACTIVE)
                .map((permission) => ({
                    townhouse: {
                        id: permission.townhouse.id,
                        name: permission.townhouse.name,
                        slug: permission.townhouse.slug,
                    },
                })),
            house: house
                ? {
                      id: house.id,
                      identifier: house.identifier,
                      townhouse: {
                          id: house.townhouse.id,
                          name: house.townhouse.name,
                          slug: house.townhouse.slug,
                      },
                  }
                : null,
        };
    }

    private async _generateToken(
        expiresIn: number,
        payload: AccessTokenPayloadDto | RefreshTokenPayloadDto,
        secret: string,
    ): Promise<string> {
        return this._jwtService.signAsync(payload, {
            audience: this._jwtConfiguration.audience,
            issuer: this._jwtConfiguration.issuer,
            secret,
            expiresIn: expiresIn,
        });
    }
}
