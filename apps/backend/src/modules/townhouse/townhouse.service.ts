import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateTownhouseDto,
    GetTownhouseDto,
    TownhouseDetailsDto,
    TownhouseListItemDto,
    UpdateTownhouseDto,
} from './dtos/townhouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Townhouse } from './entities/townhouse.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class TownhouseService {
    constructor(@InjectRepository(Townhouse) private readonly _townhouseRepository: Repository<Townhouse>) {}

    async post(data: CreateTownhouseDto): Promise<TownhouseDetailsDto> {
        const townhouse = this._townhouseRepository.create({
            name: data.name.trim(),
            slug: data.slug.trim().toLowerCase(),
        });

        try {
            const savedTownhouse = await this._townhouseRepository.save(townhouse);

            return this._toDetailsDto({ ...savedTownhouse, houses: [] });
        } catch (error) {
            this._handleUniqueConstraint(error);
            throw error;
        }
    }

    async getOne(id: number): Promise<TownhouseDetailsDto> {
        const townhouse = await this._findOneWithRelations(id);

        return this._toDetailsDto(townhouse);
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

    async getAll(): Promise<TownhouseListItemDto[]> {
        const townhouses = await this._townhouseRepository.find({
            relations: { houses: { residents: true } },
            order: { name: 'ASC' },
        });

        return townhouses.map((townhouse) => this._toListItemDto(townhouse));
    }

    async deleteOne(id: number): Promise<void> {
        const townhouse = await this._findOneWithRelations(id);

        if (townhouse.houses.length > 0) {
            throw new ConflictException('Remova as casas antes de excluir o condomínio.');
        }

        await this._townhouseRepository.remove(townhouse);
    }

    async updateOne(id: number, data: UpdateTownhouseDto): Promise<TownhouseDetailsDto> {
        const townhouse = await this._findOneWithRelations(id);

        if (data.name !== undefined) {
            townhouse.name = data.name.trim();
        }

        if (data.slug !== undefined) {
            townhouse.slug = data.slug.trim().toLowerCase();
        }

        if (data.situation !== undefined) {
            townhouse.situation = data.situation;
        }

        try {
            await this._townhouseRepository.save(townhouse);
            return this._toDetailsDto(townhouse);
        } catch (error) {
            this._handleUniqueConstraint(error);
            throw error;
        }
    }

    private async _findOneWithRelations(id: number): Promise<Townhouse> {
        const townhouse = await this._townhouseRepository.findOne({
            where: { id },
            relations: { houses: { residents: true } },
            order: { houses: { identifier: 'ASC' } },
        });

        if (!townhouse) {
            throw new NotFoundException('Condomínio não encontrado.');
        }

        return townhouse;
    }

    private _toListItemDto(townhouse: Townhouse): TownhouseListItemDto {
        const houses = townhouse.houses ?? [];

        return {
            id: townhouse.id,
            name: townhouse.name,
            slug: townhouse.slug,
            situation: townhouse.situation,
            createdAt: townhouse.createdAt,
            houseCount: houses.length,
            residentCount: houses.reduce((total, house) => total + (house.residents?.length ?? 0), 0),
        };
    }

    private _toDetailsDto(townhouse: Townhouse): TownhouseDetailsDto {
        return {
            ...this._toListItemDto(townhouse),
            houses: (townhouse.houses ?? []).map((house) => ({
                id: house.id,
                identifier: house.identifier,
                residentCount: house.residents?.length ?? 0,
            })),
        };
    }

    private _handleUniqueConstraint(error: unknown): void {
        const driverError = error instanceof QueryFailedError ? (error.driverError as { code?: string }) : null;

        if (driverError?.code === '23505') {
            throw new ConflictException('Já existe um condomínio com esse identificador de acesso.');
        }
    }
}
