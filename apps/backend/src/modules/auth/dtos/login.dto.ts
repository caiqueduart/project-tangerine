import { IsNotEmpty, IsString } from 'class-validator';
import { UserSituation } from '../../user/enums/user-situation';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    uid: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class LoginUserInfoDto {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    situation: UserSituation;
}
