import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

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
    email?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    houseId?: number;
}
