import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTownhouseDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string;
}

export class UpdateTownhouseDto extends PartialType(CreateTownhouseDto) {}

export class GetTownhouseDto {
    id: number;
    name: string;
}
