import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, LoginUserInfoDto } from '../dto/login.dto';
import { UserService } from '../../user/user.service';
import { HashService } from '../../common/services/hash.service';
import jwtConfig from '../jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @Inject(jwtConfig.KEY) private readonly _jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly _jwtService: JwtService,
        private readonly _hashService: HashService,
        private readonly _userService: UserService,
    ) {}

    async login(credentials: LoginDto): Promise<string> {
        const user = await this._userService.findUserByLogin(credentials.uid);
        const unauthorizedMessage = 'Usuário ou senha inválidos.';

        if (!user) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const isPasswordValid = await this._hashService.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        return this._jwtService.signAsync(
            {
                id: user.id,
                situation: user.situation,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            {
                audience: this._jwtConfiguration.audience,
                issuer: this._jwtConfiguration.issuer,
                secret: this._jwtConfiguration.secret,
                expiresIn: this._jwtConfiguration.jwtTtl,
            },
        );
    }
}
