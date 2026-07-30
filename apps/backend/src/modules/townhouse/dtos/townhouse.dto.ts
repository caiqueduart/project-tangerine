import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTownhouseDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string;

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'slug deve conter apenas letras minúsculas, números e hífens.',
    })
    slug: string;
}

export class UpdateTownhouseDto extends PartialType(CreateTownhouseDto) {}

export class GetTownhouseDto {
    id: number;
    name: string;
    slug: string;
}
