import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
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
    @IsEmail()
    @IsOptional()
    email?: string | null;

    @IsInt()
    @IsPositive()
    @IsOptional()
    townhouseId?: number | null;

    @IsInt()
    @IsPositive()
    @IsOptional()
    houseId?: number | null;
}
