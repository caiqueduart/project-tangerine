import {
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHouseDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    identifier: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    townhouseId: number;
}

export class UpdateHouseDto extends PartialType(CreateHouseDto) {}

export class CreateHousesBatchDto {
    @IsNumber()
    @IsPositive()
    townhouseId: number;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @MaxLength(50, { each: true })
    identifiers: string[];
}

export class GetHouseDto {
    id: number;
    townhouseId: number;
    identifier: string;
    residentCount: number;
}
