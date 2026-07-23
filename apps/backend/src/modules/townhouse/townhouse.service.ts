import { Injectable } from '@nestjs/common';
import { CreateTownhouseDto, UpdateTownhouseDto } from './townhouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Townhouse } from './townhouse.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TownhouseService {
    constructor(@InjectRepository(Townhouse) private _townhouseRepository: Repository<Townhouse>) {}

    post(data: CreateTownhouseDto): Promise<Townhouse> {
        const townhouse = this._townhouseRepository.create(data);

        return this._townhouseRepository.save(townhouse);
    }

    getOne(id: number): Promise<Townhouse | null> {
        return this._townhouseRepository.findOne({ where: { id: id } });
    }

    getAll(): Promise<Townhouse[]> {
        return this._townhouseRepository.find();
    }

    deleteOne(id: number) {
        return this._townhouseRepository.delete(id);
    }

    updateOne(id: number, data: UpdateTownhouseDto) {
        return this._townhouseRepository.update(id, data);
    }
}
