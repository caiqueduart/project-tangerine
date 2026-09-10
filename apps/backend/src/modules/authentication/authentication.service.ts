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
import { TownhouseService } from '../townhouse/townhouse.service';
import { UserRole } from '../user/enums/user-role';
import {
    getActiveManagedTownhouseIds,
    getActiveResidentialTownhouseId,
    hasActiveTownhouseAccess,
} from '../user/user-townhouse-access';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _hashService: HashService,
        private readonly _userService: UserService,
        private readonly _townhouseService: TownhouseService,
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

        const townhouseId = await this._resolveTownhouseContext(user, credentials.townhouseSlug);
        const tokens = await this._generateRefreshAndAccessTokens(user, townhouseId);

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
            const user = await this._userService.findAuthenticatableUserById(payload.id);

            if (!user) {
                throw new UnauthorizedException(unauthorizedMessage);
            }

            if (user.role !== UserRole.SYSTEM_ADMIN) {
                const townhouseId = payload.townhouseId;

                if (!townhouseId || !hasActiveTownhouseAccess(user, townhouseId)) {
                    throw new UnauthorizedException(unauthorizedMessage);
                }
            }
        } catch {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const accessTokenPayload: AccessTokenPayloadDto = {
            id: payload.id,
            tokenType: AuthenticationTokenType.ACCESS,
            townhouseId: payload.townhouseId,
        };

        const accessToken = await this._generateToken(
            this._jwtConfiguration.ttl,
            accessTokenPayload,
            this._jwtConfiguration.secret,
        );

        return { accessToken };
    }

    async completeFirstAccess(actor: AuthenticatedActor, dto: CompleteFirstAccessDto): Promise<LoginResultDto> {
        const user = await this._userService.completeFirstAccess(actor.userId, dto.newPassword);
        const tokens = await this._generateRefreshAndAccessTokens(user, actor.townhouseId);

        return {
            ...tokens,
            session: this._generateAuthenticationSessionData(user),
        };
    }

    changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
        return this._userService.changePassword(userId, dto.currentPassword, dto.newPassword);
    }

    private async _generateRefreshAndAccessTokens(
        user: Pick<User, 'id'>,
        townhouseId?: number,
    ): Promise<AuthenticationTokensDto> {
        const accessTokenPayload: AccessTokenPayloadDto = {
            id: user.id,
            tokenType: AuthenticationTokenType.ACCESS,
            townhouseId,
        };

        const refreshTokenPayload: RefreshTokenPayloadDto = {
            id: user.id,
            tokenType: AuthenticationTokenType.REFRESH,
            townhouseId,
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
        const activeResidentialTownhouseId = getActiveResidentialTownhouseId(user);
        const activeManagedTownhouseIds = new Set(getActiveManagedTownhouseIds(user));

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                situation: user.situation,
            },
            managerPermissions: (user.managerPermissions ?? [])
                .filter(
                    (permission) =>
                        permission.situation === ManagerPermissionSituation.ACTIVE &&
                        activeManagedTownhouseIds.has(permission.townhouseId),
                )
                .map((permission) => ({
                    townhouse: {
                        id: permission.townhouse.id,
                        name: permission.townhouse.name,
                        slug: permission.townhouse.slug,
                    },
                })),
            house:
                house && house.townhouse.id === activeResidentialTownhouseId
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

    private async _resolveTownhouseContext(user: User, townhouseSlug?: string): Promise<number | undefined> {
        if (!townhouseSlug) {
            if (user.role === UserRole.SYSTEM_ADMIN) return undefined;

            throw new UnauthorizedException();
        }

        const townhouse = await this._townhouseService.getOneBySlug(townhouseSlug);

        if (user.role === UserRole.SYSTEM_ADMIN || hasActiveTownhouseAccess(user, townhouse.id)) {
            return townhouse.id;
        }

        throw new UnauthorizedException('Usuário ou senha inválidos.');
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
