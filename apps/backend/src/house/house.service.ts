import { Injectable } from '@nestjs/common';
import {CreateHouseDto, GetHouseDto} from "../dtos/house.dto";

@Injectable()
export class HouseService {
    register(house: CreateHouseDto): void { }

    getOne(id: number): GetHouseDto { return {id: 0, identifier: '', townhouseId: 1} }

    getAll(): GetHouseDto[] { return [] }
}
