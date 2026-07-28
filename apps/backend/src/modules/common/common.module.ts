import { Module } from '@nestjs/common';
import { HashService, HashServiceProtocol } from './services/hash.service';

@Module({
    exports: [HashService, HashServiceProtocol],
    providers: [
        HashService,
        {
            provide: HashServiceProtocol,
            useClass: HashService,
        },
    ],
})
export class CommonModule {}
