import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    uid: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    townhouseSlug?: string;
}
