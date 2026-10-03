import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { TownhouseService } from './townhouse.service';
import { Townhouse } from './entities/townhouse.entity';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { UserRole } from '../user/enums/user-role';
import { UserSituation } from '../user/enums/user-situation';
import { TownhouseSituation } from './enums/townhouse-situation.enum';

describe('TownhouseService', () => {
    const townhouseRepository = {
        createQueryBuilder: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };

    let service: TownhouseService;
    const systemAdmin: AuthenticatedActor = {
        userId: 'admin-id',
        role: UserRole.SYSTEM_ADMIN,
        situation: UserSituation.ACTIVE,
        managedTownhouseIds: [],
    };
    const manager: AuthenticatedActor = {
        userId: 'manager-id',
        role: UserRole.USER,
        situation: UserSituation.ACTIVE,
        managedTownhouseIds: [2],
    };
    const resident: AuthenticatedActor = {
        userId: 'resident-id',
        role: UserRole.USER,
        situation: UserSituation.ACTIVE,
        houseId: 7,
        residentialTownhouseId: 2,
        managedTownhouseIds: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TownhouseService(townhouseRepository as unknown as Repository<Townhouse>, new TownhousePolicy());
    });

    it('retorna o condomínio correspondente ao slug', async () => {
        townhouseRepository.findOne.mockResolvedValue({
            id: 1,
            name: 'Condomínio Corumbá',
            slug: 'corumba',
            situation: TownhouseSituation.ACTIVE,
        });

        await expect(service.getOneBySlug('CORUMBA')).resolves.toEqual({
            id: 1,
            name: 'Condomínio Corumbá',
            slug: 'corumba',
        });
        expect(townhouseRepository.findOne).toHaveBeenCalledWith({
            where: { slug: 'corumba' },
        });
    });

    it('retorna 404 quando o slug não pertence a um condomínio', async () => {
        townhouseRepository.findOne.mockResolvedValue(null);

        await expect(service.getOneBySlug('inexistente')).rejects.toThrow(NotFoundException);
    });

    it('retorna 403 quando o slug pertence a um condomínio inativo', async () => {
        townhouseRepository.findOne.mockResolvedValue({
            id: 1,
            name: 'Condomínio Corumbá',
            slug: 'corumba',
            situation: TownhouseSituation.INACTIVE,
        });

        await expect(service.getOneBySlug('corumba')).rejects.toThrow(ForbiddenException);
    });

    it('retorna somente id e nome nas opções de condomínio', async () => {
        townhouseRepository.find.mockResolvedValue([
            { id: 2, name: 'Condomínio B' },
            { id: 1, name: 'Condomínio A' },
        ]);

        await expect(service.getOptions(systemAdmin)).resolves.toEqual([
            { id: 2, name: 'Condomínio B' },
            { id: 1, name: 'Condomínio A' },
        ]);
        expect(townhouseRepository.find).toHaveBeenCalledWith({
            select: { id: true, name: true },
            where: {},
            order: { name: 'ASC' },
        });
    });

    it('limita as opções do gestor ao próprio condomínio', async () => {
        townhouseRepository.find.mockResolvedValue([{ id: 2, name: 'Condomínio B' }]);

        await expect(service.getOptions(manager)).resolves.toEqual([{ id: 2, name: 'Condomínio B' }]);
        expect(townhouseRepository.find).toHaveBeenCalledWith({
            select: { id: true, name: true },
            where: { id: In([2]) },
            order: { name: 'ASC' },
        });
    });

    it('lista condomínios com contagens agregadas no banco, sem carregar casas e moradores', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        const countsQuery = createRawQueryBuilder([{ id: 2, houseCount: '3', residentCount: '5' }]);
        townhouseRepository.find.mockResolvedValue([
            { id: 1, name: 'Condomínio A', slug: 'a', situation: TownhouseSituation.ACTIVE, createdAt },
            { id: 2, name: 'Condomínio B', slug: 'b', situation: TownhouseSituation.ACTIVE, createdAt },
        ]);
        townhouseRepository.createQueryBuilder.mockReturnValue(countsQuery);

        const result = await service.getAll(systemAdmin);

        expect(townhouseRepository.find).toHaveBeenCalledWith({ where: {}, order: { name: 'ASC' } });
        expect(countsQuery.where).toHaveBeenCalledWith('townhouse.id IN (:...townhouseIds)', { townhouseIds: [1, 2] });
        expect(result.map(({ id, houseCount, residentCount }) => ({ id, houseCount, residentCount }))).toEqual([
            { id: 1, houseCount: 0, residentCount: 0 },
            { id: 2, houseCount: 3, residentCount: 5 },
        ]);
    });

    it('impede que morador use listagens administrativas de condomínios', async () => {
        await expect(service.getAll(resident)).rejects.toThrow(ForbiddenException);
        expect(townhouseRepository.find).not.toHaveBeenCalled();
    });

    it('impede que gestor consulte os detalhes de outro condomínio', async () => {
        await expect(service.getOne(3, manager)).rejects.toThrow(ForbiddenException);
        expect(townhouseRepository.findOne).not.toHaveBeenCalled();
    });
});

function createRawQueryBuilder(rows: unknown[]) {
    const query = {
        leftJoin: jest.fn(),
        innerJoin: jest.fn(),
        select: jest.fn(),
        addSelect: jest.fn(),
        where: jest.fn(),
        groupBy: jest.fn(),
        addGroupBy: jest.fn(),
        orderBy: jest.fn(),
        getRawMany: jest.fn().mockResolvedValue(rows),
    };

    for (const method of [
        'leftJoin',
        'innerJoin',
        'select',
        'addSelect',
        'where',
        'groupBy',
        'addGroupBy',
        'orderBy',
    ] as const) {
        query[method].mockReturnValue(query);
    }

    return query;
}
