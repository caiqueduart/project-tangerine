import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../../user/user.service';
import { HashService } from '../../common/services/hash.service';

@Injectable()
export class AuthService {
    constructor(
        private _hashService: HashService,
        private _userService: UserService,
    ) {}

    async login(credentials: LoginDto) {
        const user = await this._userService.findUserByLogin(credentials.uid);
        let throwException = false;

        if (!user) throwException = true;

        if (user) {
            const isPasswordValid = await this._hashService.compare(credentials.password, user.passwordHash);
            if (!isPasswordValid) throwException = true;
        }

        if (throwException) {
            return new UnauthorizedException('Usuário ou senha não inválidos.');
        } else if (user) {
            const { firstName, lastName, email, phone, situation } = user;

            return { firstName, lastName, email, phone, situation };
        }
    }
}
