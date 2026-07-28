import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { HashServiceProtocol } from './hash.model';
import { BcryptService } from './services/bcrypt.service';

@Module({
    controllers: [AuthController],
    exports: [BcryptService],
    providers: [
        AuthService,
        BcryptService,
        {
            provide: HashServiceProtocol,
            useClass: BcryptService,
        },
    ],
})
export class AuthModule {}
