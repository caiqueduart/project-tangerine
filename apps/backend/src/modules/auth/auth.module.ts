import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../common/common.module';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './configs/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ValidTokenGuard } from './guards/valid-token.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [CommonModule, UserModule, ConfigModule.forFeature(jwtConfig), JwtModule.registerAsync(jwtConfig.asProvider())],
    providers: [AuthService, ValidTokenGuard, { provide: APP_GUARD, useExisting: ValidTokenGuard }],
    controllers: [AuthController],
    exports: [ValidTokenGuard],
})
export class AuthModule {}
