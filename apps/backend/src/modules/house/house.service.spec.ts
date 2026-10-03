import { ForbiddenException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { HousePolicy } from '../authorization/policies/house.policy';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { TownhouseService } from '../townhouse/townhouse.service';
import { UserRole } from '../user/enums/user-role';
import { UserSituation } from '../user/enums/user-situation';
import { House } from './entities/house.entity';
import { HouseService } from './house.service';

describe('HouseService', () => {
    const houseRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
    };
    const townhouseService = { assertExists: jest.fn() };

    let service: HouseService;
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
        service = new HouseService(
            houseRepository as unknown as Repository<House>,
            new HousePolicy(),
            new TownhousePolicy(),
            townhouseService as unknown as TownhouseService,
        );
    });

    it('retorna somente id e identificador das casas do condomínio', async () => {
        houseRepository.find.mockResolvedValue([
            { id: 2, identifier: 'Casa 2' },
            { id: 1, identifier: 'Casa 1' },
        ]);

        await expect(service.getOptions(7, systemAdmin)).resolves.toEqual([
            { id: 2, identifier: 'Casa 2' },
            { id: 1, identifier: 'Casa 1' },
        ]);
        expect(houseRepository.find).toHaveBeenCalledWith({
            select: { id: true, identifier: true },
            where: { townhouse: { id: 7 } },
            order: { identifier: 'ASC' },
        });
    });

    it('permite que o morador consulte a própria casa', async () => {
        houseRepository.findOne.mockResolvedValue({
            id: 7,
            identifier: 'Casa 7',
            townhouse: { id: 2 },
            residents: [],
        });

        await expect(service.getOne(7, resident)).resolves.toEqual({
            id: 7,
            townhouseId: 2,
            identifier: 'Casa 7',
            residentCount: 0,
        });
    });

    it('impede que o morador consulte outra casa', async () => {
        houseRepository.findOne.mockResolvedValue({
            id: 8,
            identifier: 'Casa 8',
            townhouse: { id: 2 },
            residents: [],
        });

        await expect(service.getOne(8, resident)).rejects.toThrow(ForbiddenException);
    });

    it('atualiza somente a identificação, mantendo a casa no mesmo condomínio', async () => {
        houseRepository.findOne.mockResolvedValue({ id: 7, identifier: 'Casa 7', townhouse: { id: 2 }, residents: [] });
        houseRepository.save.mockImplementation((house: House) => Promise.resolve(house));

        await expect(service.updateOne(7, { identifier: ' Casa 7A ' }, manager)).resolves.toEqual({
            id: 7,
            townhouseId: 2,
            identifier: 'Casa 7A',
            residentCount: 0,
        });
    });

    it('busca a casa do condomínio usando o EntityManager da transação quando informado', async () => {
        const transactionalRepository = { findOne: jest.fn().mockResolvedValue({ id: 10, townhouse: { id: 2 } }) };
        const entityManager = { getRepository: jest.fn().mockReturnValue(transactionalRepository) };

        await service.findInTownhouse(10, 2, entityManager as unknown as EntityManager);

        expect(entityManager.getRepository).toHaveBeenCalledWith(House);
        expect(transactionalRepository.findOne).toHaveBeenCalledWith({
            where: { id: 10, townhouse: { id: 2 } },
            relations: { townhouse: true },
        });
        expect(houseRepository.findOne).not.toHaveBeenCalled();
    });

    it('impede que o gestor liste casas de outro condomínio', async () => {
        await expect(service.getOptions(3, manager)).rejects.toThrow(ForbiddenException);
        expect(houseRepository.find).not.toHaveBeenCalled();
    });
});
