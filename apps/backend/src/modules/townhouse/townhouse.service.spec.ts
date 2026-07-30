import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TownhouseService } from './townhouse.service';
import { Townhouse } from './entities/townhouse.entity';

describe('TownhouseService', () => {
    const townhouseRepository = {
        findOne: jest.fn(),
    };

    let service: TownhouseService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TownhouseService(townhouseRepository as unknown as Repository<Townhouse>);
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
});
