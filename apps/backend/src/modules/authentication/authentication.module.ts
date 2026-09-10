import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../common/common.module';
import { AuthenticationService } from './authentication.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './configs/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ValidTokenGuard } from './guards/valid-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { PendingUserGuard } from './guards/pending-user.guard';
import { TownhouseModule } from '../townhouse/townhouse.module';

@Module({
    imports: [
        CommonModule,
        UserModule,
        TownhouseModule,
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
    ],
    providers: [
        AuthenticationService,
        ValidTokenGuard,
        PendingUserGuard,
        { provide: APP_GUARD, useExisting: ValidTokenGuard },
        { provide: APP_GUARD, useExisting: PendingUserGuard },
    ],
    controllers: [AuthenticationController],
    exports: [ValidTokenGuard, PendingUserGuard],
})
export class AuthenticationModule {}
