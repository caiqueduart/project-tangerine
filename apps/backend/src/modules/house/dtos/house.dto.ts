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
import { PartialType, PickType } from '@nestjs/mapped-types';

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

// Uma casa não pode trocar de condomínio; somente a identificação é editável.
export class UpdateHouseDto extends PartialType(PickType(CreateHouseDto, ['identifier'] as const)) {}

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

export class HouseOptionDto {
    id: number;
    identifier: string;
}
