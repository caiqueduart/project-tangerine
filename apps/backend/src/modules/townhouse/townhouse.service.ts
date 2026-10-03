import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateTownhouseDto,
    GetTownhouseDto,
    TownhouseDetailsDto,
    TownhouseHouseDto,
    TownhouseListItemDto,
    TownhouseOptionDto,
    UpdateTownhouseDto,
} from './dtos/townhouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Townhouse } from './entities/townhouse.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { TownhouseSituation } from './enums/townhouse-situation.enum';

interface TownhouseCounts {
    readonly houseCount: number;
    readonly residentCount: number;
}

const EMPTY_COUNTS: TownhouseCounts = { houseCount: 0, residentCount: 0 };

@Injectable()
export class TownhouseService {
    constructor(
        @InjectRepository(Townhouse) private readonly _townhouseRepository: Repository<Townhouse>,
        private readonly _townhousePolicy: TownhousePolicy,
    ) {}

    async post(data: CreateTownhouseDto, actor: AuthenticatedActor): Promise<TownhouseDetailsDto> {
        this._townhousePolicy.assertCanCreate(actor);

        const townhouse = this._townhouseRepository.create({
            name: data.name.trim(),
            slug: data.slug.trim().toLowerCase(),
        });

        try {
            const savedTownhouse = await this._townhouseRepository.save(townhouse);

            return { ...this._toListItemDto(savedTownhouse, EMPTY_COUNTS), houses: [] };
        } catch (error) {
            this._handleUniqueConstraint(error);
            throw error;
        }
    }

    async getOne(id: number, actor: AuthenticatedActor): Promise<TownhouseDetailsDto> {
        this._townhousePolicy.assertCanManage(actor, id);

        return this._getDetails(await this._findOne(id));
    }

    async getOneBySlug(slug: string): Promise<GetTownhouseDto> {
        const townhouse = await this._townhouseRepository.findOne({
            where: { slug: slug.toLowerCase() },
        });

        if (!townhouse) {
            throw new NotFoundException('Condomínio não encontrado.');
        }

        if (townhouse.situation === TownhouseSituation.INACTIVE) {
            throw new ForbiddenException('Condomínio inativo.');
        }

        return {
            id: townhouse.id,
            name: townhouse.name,
            slug: townhouse.slug,
        };
    }

    async getActiveForManagerPermission(id: number): Promise<Townhouse> {
        const townhouse = await this._townhouseRepository.findOne({
            where: { id, situation: TownhouseSituation.ACTIVE },
        });

        if (!townhouse) {
            throw new NotFoundException('Condomínio ativo não encontrado.');
        }

        return townhouse;
    }

    async assertExists(id: number): Promise<void> {
        const exists = await this._townhouseRepository.existsBy({ id });

        if (!exists) {
            throw new NotFoundException('Condomínio não encontrado.');
        }
    }

    async getAll(actor: AuthenticatedActor): Promise<TownhouseListItemDto[]> {
        const townhouseIds = this._townhousePolicy.getManagementScope(actor);
        const townhouses = await this._townhouseRepository.find({
            where: townhouseIds ? { id: In([...townhouseIds]) } : {},
            order: { name: 'ASC' },
        });
        const countsByTownhouseId = await this._getCounts(townhouses.map(({ id }) => id));

        return townhouses.map((townhouse) =>
            this._toListItemDto(townhouse, countsByTownhouseId.get(townhouse.id) ?? EMPTY_COUNTS),
        );
    }

    async getOptions(actor: AuthenticatedActor): Promise<TownhouseOptionDto[]> {
        const townhouseIds = this._townhousePolicy.getManagementScope(actor);
        const townhouses = await this._townhouseRepository.find({
            select: { id: true, name: true },
            where: townhouseIds ? { id: In([...townhouseIds]) } : {},
            order: { name: 'ASC' },
        });

        return townhouses.map(({ id, name }) => ({ id, name }));
    }

    async deleteOne(id: number, actor: AuthenticatedActor): Promise<void> {
        this._townhousePolicy.assertCanManage(actor, id);

        const townhouse = await this._findOne(id);
        const counts = (await this._getCounts([id])).get(id) ?? EMPTY_COUNTS;

        if (counts.houseCount > 0) {
            throw new ConflictException('Remova as casas antes de excluir o condomínio.');
        }

        await this._townhouseRepository.remove(townhouse);
    }

    async updateOne(id: number, data: UpdateTownhouseDto, actor: AuthenticatedActor): Promise<TownhouseDetailsDto> {
        this._townhousePolicy.assertCanManage(actor, id);

        const townhouse = await this._findOne(id);

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
        } catch (error) {
            this._handleUniqueConstraint(error);
            throw error;
        }

        return this._getDetails(townhouse);
    }

    private async _findOne(id: number): Promise<Townhouse> {
        const townhouse = await this._townhouseRepository.findOne({ where: { id } });

        if (!townhouse) {
            throw new NotFoundException('Condomínio não encontrado.');
        }

        return townhouse;
    }

    private async _getDetails(townhouse: Townhouse): Promise<TownhouseDetailsDto> {
        const houses = await this._getHouses(townhouse.id);

        return {
            ...this._toListItemDto(townhouse, {
                houseCount: houses.length,
                residentCount: houses.reduce((total, house) => total + house.residentCount, 0),
            }),
            houses,
        };
    }

    // Conta casas e moradores no banco em vez de carregar todos os registros relacionados.
    private async _getCounts(townhouseIds: readonly number[]): Promise<Map<number, TownhouseCounts>> {
        if (!townhouseIds.length) return new Map();

        const rows = await this._townhouseRepository
            .createQueryBuilder('townhouse')
            .leftJoin('townhouse.houses', 'house')
            .leftJoin('house.residents', 'resident')
            .select('townhouse.id', 'id')
            .addSelect('COUNT(DISTINCT house.id)', 'houseCount')
            .addSelect('COUNT(resident.userId)', 'residentCount')
            .where('townhouse.id IN (:...townhouseIds)', { townhouseIds })
            .groupBy('townhouse.id')
            .getRawMany<{ id: number; houseCount: string; residentCount: string }>();

        return new Map(
            rows.map((row) => [
                Number(row.id),
                { houseCount: Number(row.houseCount), residentCount: Number(row.residentCount) },
            ]),
        );
    }

    private async _getHouses(townhouseId: number): Promise<TownhouseHouseDto[]> {
        const rows = await this._townhouseRepository
            .createQueryBuilder('townhouse')
            .innerJoin('townhouse.houses', 'house')
            .leftJoin('house.residents', 'resident')
            .select('house.id', 'id')
            .addSelect('house.identifier', 'identifier')
            .addSelect('COUNT(resident.userId)', 'residentCount')
            .where('townhouse.id = :townhouseId', { townhouseId })
            .groupBy('house.id')
            .addGroupBy('house.identifier')
            .orderBy('house.identifier', 'ASC')
            .getRawMany<{ id: number; identifier: string; residentCount: string }>();

        return rows.map((row) => ({
            id: Number(row.id),
            identifier: row.identifier,
            residentCount: Number(row.residentCount),
        }));
    }

    private _toListItemDto(townhouse: Townhouse, counts: TownhouseCounts): TownhouseListItemDto {
        return {
            id: townhouse.id,
            name: townhouse.name,
            slug: townhouse.slug,
            situation: townhouse.situation,
            createdAt: townhouse.createdAt,
            houseCount: counts.houseCount,
            residentCount: counts.residentCount,
        };
    }

    private _handleUniqueConstraint(error: unknown): void {
        const driverError = error instanceof QueryFailedError ? (error.driverError as { code?: string }) : null;

        if (driverError?.code === '23505') {
            throw new ConflictException('Já existe um condomínio com esse identificador de acesso.');
        }
    }
}
