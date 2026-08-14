import { Repository } from 'typeorm';
import { Townhouse } from '../townhouse/entities/townhouse.entity';
import { House } from './entities/house.entity';
import { HouseService } from './house.service';

describe('HouseService', () => {
    const houseRepository = {
        find: jest.fn(),
    };
    const townhouseRepository = {};

    let service: HouseService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new HouseService(
            houseRepository as unknown as Repository<House>,
            townhouseRepository as unknown as Repository<Townhouse>,
        );
    });

    it('retorna somente id e identificador das casas do condomínio', async () => {
        houseRepository.find.mockResolvedValue([
            { id: 2, identifier: 'Casa 2' },
            { id: 1, identifier: 'Casa 1' },
        ]);

        await expect(service.getOptions(7)).resolves.toEqual([
            { id: 2, identifier: 'Casa 2' },
            { id: 1, identifier: 'Casa 1' },
        ]);
        expect(houseRepository.find).toHaveBeenCalledWith({
            select: { id: true, identifier: true },
            where: { townhouse: { id: 7 } },
            order: { identifier: 'ASC' },
        });
    });
});
