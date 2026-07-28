import { Injectable } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private _bCryptService: BcryptService) {}

    login(credentials: LoginDto) {}
}
