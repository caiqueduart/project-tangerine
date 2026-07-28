import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../common/common.module';
import { AuthService } from './services/auth.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [CommonModule, UserModule, ConfigModule.forFeature(jwtConfig), JwtModule.registerAsync(jwtConfig.asProvider())],
    controllers: [AuthController],
    exports: [],
    providers: [AuthService],
})
export class AuthModule {}
