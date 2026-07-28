import { IsNotEmpty, IsNumber, IsPositive, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHouseDto {
    @IsNumber()
    @IsNotEmpty()
    @MaxLength(50)
    identifier: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    townhouseId: number;
}

export class UpdateHouseDto extends PartialType(CreateHouseDto) {}

export class GetHouseDto {
    id: number;
    townhouseId: number;
    identifier: string;
}
