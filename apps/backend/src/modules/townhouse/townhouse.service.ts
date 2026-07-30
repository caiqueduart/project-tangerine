import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTownhouseDto, GetTownhouseDto, UpdateTownhouseDto } from './dtos/townhouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Townhouse } from './entities/townhouse.entity';
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

    async getOneBySlug(slug: string): Promise<GetTownhouseDto> {
        const townhouse = await this._townhouseRepository.findOne({
            where: { slug: slug.toLowerCase() },
        });

        if (!townhouse) {
            throw new NotFoundException('Condomínio não encontrado.');
        }

        return {
            id: townhouse.id,
            name: townhouse.name,
            slug: townhouse.slug,
        };
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
