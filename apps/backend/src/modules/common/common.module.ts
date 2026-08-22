import { Module } from '@nestjs/common';
import { HashService, HashServiceProtocol } from './services/hash.service';
import { ProvisionalPasswordService } from './services/provisional-password.service';

@Module({
    exports: [HashService, HashServiceProtocol, ProvisionalPasswordService],
    providers: [
        HashService,
        ProvisionalPasswordService,
        {
            provide: HashServiceProtocol,
            useClass: HashService,
        },
    ],
})
export class CommonModule {}
