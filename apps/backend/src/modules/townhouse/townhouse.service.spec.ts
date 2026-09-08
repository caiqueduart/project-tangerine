import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TownhouseService } from './townhouse.service';
import { Townhouse } from './entities/townhouse.entity';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { UserRole } from '../user/enums/user-role';
import { UserSituation } from '../user/enums/user-situation';

describe('TownhouseService', () => {
    const townhouseRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
    };

    let service: TownhouseService;
    const systemAdmin: AuthenticatedActor = {
        userId: 'admin-id',
        role: UserRole.SYSTEM_ADMIN,
        situation: UserSituation.ACTIVE,
    };
    const manager: AuthenticatedActor = {
        userId: 'manager-id',
        role: UserRole.TOWNHOUSE_MANAGER,
        situation: UserSituation.ACTIVE,
        townhouseId: 2,
    };
    const resident: AuthenticatedActor = {
        userId: 'resident-id',
        role: UserRole.RESIDENT,
        situation: UserSituation.ACTIVE,
        houseId: 7,
        townhouseId: 2,
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
            where: { id: 2 },
            order: { name: 'ASC' },
        });
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
