import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserSituation } from './user-situation';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    @MaxLength(20)
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @MaxLength(80)
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @MaxLength(20)
    @IsString()
    phone: string;

    @MaxLength(255)
    @IsString()
    @IsOptional()
    email: string;
}

export class GetUserDto {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    situation: UserSituation;
}
