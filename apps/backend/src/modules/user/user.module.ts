import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { CommonModule } from '../common/common.module';
import { Resident } from './entities/resident.entity';
import { UserAudit } from './entities/user-audit.entity';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
    imports: [AuthorizationModule, CommonModule, TypeOrmModule.forFeature([User, Resident, UserAudit])],
    exports: [UserService],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {}
