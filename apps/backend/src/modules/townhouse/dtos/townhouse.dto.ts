import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TownhouseSituation } from '../enums/townhouse-situation.enum';

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

export class UpdateTownhouseDto extends PartialType(CreateTownhouseDto) {
    @IsOptional()
    @IsEnum(TownhouseSituation)
    situation?: TownhouseSituation;
}

export class GetTownhouseDto {
    id: number;
    name: string;
    slug: string;
}

export class TownhouseListItemDto extends GetTownhouseDto {
    situation: TownhouseSituation;
    createdAt: Date;
    houseCount: number;
    residentCount: number;
}

export class TownhouseHouseDto {
    id: number;
    identifier: string;
    residentCount: number;
}

export class TownhouseDetailsDto extends TownhouseListItemDto {
    houses: TownhouseHouseDto[];
}
