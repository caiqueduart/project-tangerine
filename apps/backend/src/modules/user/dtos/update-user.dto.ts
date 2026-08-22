import { IsEmail, IsEnum, IsInt, IsOptional, IsPositive, IsString, MaxLength, ValidateIf } from 'class-validator';
import { UserSituation } from '../enums/user-situation';
import { UserRole } from '../enums/user-role';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(20)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    lastName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @ValidateIf((_object, value) => value !== null)
    @IsEmail()
    @MaxLength(255)
    email?: string | null;

    @IsOptional()
    @IsEnum(UserSituation)
    situation?: UserSituation;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @ValidateIf((_object, value) => value !== null)
    @IsInt()
    @IsPositive()
    townhouseId?: number | null;

    @IsOptional()
    @ValidateIf((_object, value) => value !== null)
    @IsInt()
    @IsPositive()
    houseId?: number | null;
}
