import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, LoginUserInfoDto } from '../dto/login.dto';
import { UserService } from '../../user/user.service';
import { HashService } from '../../common/services/hash.service';

@Injectable()
export class AuthService {
    constructor(
        private _hashService: HashService,
        private _userService: UserService,
    ) {}

    async login(credentials: LoginDto): Promise<LoginUserInfoDto> {
        const user = await this._userService.findUserByLogin(credentials.uid);
        const unauthorizedMessage = 'Usuário ou senha inválidos.';

        if (!user) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const isPasswordValid = await this._hashService.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const { firstName, lastName, email, phone, situation } = user;
        return { firstName, lastName, email, phone, situation };
    }
}
