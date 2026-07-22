import { Injectable } from '@nestjs/common';
import {CreateTownhouseDto} from "./townhouse.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Townhouse} from "./townhouse.entity";
import {Repository} from "typeorm";

@Injectable()
export class TownhouseService {
    constructor( @InjectRepository(Townhouse) private _townhouseRepository: Repository<Townhouse>) {}

    async post(data: CreateTownhouseDto): Promise<Townhouse> {
        const townhouse = this._townhouseRepository.create(data);

        return this._townhouseRepository.save(townhouse);
    }

    async getOne(id: number): Promise<Townhouse | null> {
        return this._townhouseRepository.findOne({where: {id: id}});
    }

    async getAll(): Promise<Townhouse[]> {
        return this._townhouseRepository.find();
    }

    async deleteOne(id: number) {
        return this._townhouseRepository.delete(id)
    }
}
