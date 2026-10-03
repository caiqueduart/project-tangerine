import { ConfigService } from '@nestjs/config';
import { PASSWORD_PATTERN } from '../../user/dtos/password.dto';
import { ProvisionalPasswordService } from './provisional-password.service';

describe('ProvisionalPasswordService', () => {
    const configService = {
        getOrThrow: jest.fn().mockReturnValue(72),
    };
    const service = new ProvisionalPasswordService(configService as unknown as ConfigService);

    it('gera senhas de 10 caracteres sem ambiguidade e dentro da regra de senha do sistema', () => {
        for (let index = 0; index < 200; index += 1) {
            const password = service.generate();

            expect(password).toMatch(/^[A-HJ-NP-Za-km-np-z2-9]{10}$/);
            expect(password).toMatch(PASSWORD_PATTERN);
        }
    });

    it('calcula a expiração a partir da validade configurada', () => {
        const from = new Date('2026-10-03T12:00:00.000Z');

        expect(service.getExpirationDate(from)).toEqual(new Date('2026-10-06T12:00:00.000Z'));
        expect(configService.getOrThrow).toHaveBeenCalledWith('PROVISIONAL_PASSWORD_TTL_HOURS');
    });
});
