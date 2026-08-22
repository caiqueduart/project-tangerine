import { ProvisionalPasswordService } from './provisional-password.service';

describe('ProvisionalPasswordService', () => {
    it('generates an eight-character familiar password with letters and unambiguous digits', () => {
        const service = new ProvisionalPasswordService();

        for (let index = 0; index < 100; index += 1) {
            expect(service.generate()).toMatch(/^[A-Z][a-z]{3}[2-9]{4}$/);
        }
    });
});
