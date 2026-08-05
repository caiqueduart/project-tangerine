import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateHouseDto, CreateHousesBatchDto, GetHouseDto, UpdateHouseDto } from './dtos/house.dto';
import { House } from './entities/house.entity';
import { Townhouse } from '../townhouse/entities/townhouse.entity';

@Injectable()
export class HouseService {
    constructor(
        @InjectRepository(House) private readonly _houseRepository: Repository<House>,
        @InjectRepository(Townhouse) private readonly _townhouseRepository: Repository<Townhouse>,
    ) {}

    async register(data: CreateHouseDto): Promise<GetHouseDto> {
        await this._ensureTownhouseExists(data.townhouseId);

        const house = this._houseRepository.create({
            identifier: data.identifier.trim(),
            townhouse: { id: data.townhouseId },
        });

        return this._save(house);
    }

    async registerBatch(data: CreateHousesBatchDto): Promise<GetHouseDto[]> {
        await this._ensureTownhouseExists(data.townhouseId);

        const identifiers = data.identifiers.map((identifier) => identifier.trim());
        const normalizedIdentifiers = identifiers.map((identifier) => identifier.toLocaleLowerCase('pt-BR'));

        if (new Set(normalizedIdentifiers).size !== normalizedIdentifiers.length) {
            throw new ConflictException('A lista contém identificações de casas duplicadas.');
        }

        const houses = identifiers.map((identifier) =>
            this._houseRepository.create({
                identifier,
                townhouse: { id: data.townhouseId },
            }),
        );

        try {
            const savedHouses = await this._houseRepository.save(houses);

            return savedHouses.map((house) => this._toDto(house));
        } catch (error) {
            this._handleUniqueConstraint(error);
            throw error;
        }
    }

    async getOne(id: number): Promise<GetHouseDto> {
        const house = await this._findOne(id);

        return this._toDto(house);
    }

    async updateOne(id: number, data: UpdateHouseDto): Promise<GetHouseDto> {
        const house = await this._findOne(id);

        if (data.townhouseId !== undefined && data.townhouseId !== house.townhouse.id) {
            await this._ensureTownhouseExists(data.townhouseId);
            house.townhouse = { id: data.townhouseId } as Townhouse;
        }

        if (data.identifier !== undefined) {
            house.identifier = data.identifier.trim();
        }

        return this._save(house);
    }

    async deleteOne(id: number): Promise<void> {
        const house = await this._findOne(id);

        if ((house.residents?.length ?? 0) > 0) {
            throw new ConflictException('Não é possível excluir uma casa com moradores vinculados.');
        }

        await this._houseRepository.remove(house);
    }

    private async _findOne(id: number): Promise<House> {
        const house = await this._houseRepository.findOne({
            where: { id },
            relations: { townhouse: true, residents: true },
        });

        if (!house) {
            throw new NotFoundException('Casa não encontrada.');
        }

        return house;
    }

    private async _ensureTownhouseExists(id: number): Promise<void> {
        const exists = await this._townhouseRepository.existsBy({ id });

        if (!exists) {
            throw new NotFoundException('Condomínio não encontrado.');
        }
    }

    private async _save(house: House): Promise<GetHouseDto> {
        try {
            return this._toDto(await this._houseRepository.save(house));
        } catch (error) {
            this._handleUniqueConstraint(error);
            throw error;
        }
    }

    private _toDto(house: House): GetHouseDto {
        return {
            id: house.id,
            townhouseId: house.townhouse.id,
            identifier: house.identifier,
            residentCount: house.residents?.length ?? 0,
        };
    }

    private _handleUniqueConstraint(error: unknown): void {
        const driverError = error instanceof QueryFailedError ? (error.driverError as { code?: string }) : null;

        if (driverError?.code === '23505') {
            throw new ConflictException('Já existe uma casa com essa identificação no condomínio.');
        }
    }
}
