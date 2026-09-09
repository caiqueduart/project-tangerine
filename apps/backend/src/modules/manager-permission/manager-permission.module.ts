import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module';
import { TownhouseModule } from '../townhouse/townhouse.module';
import { UserModule } from '../user/user.module';
import { ManagerPermission } from './entities/manager-permission.entity';
import { ManagerPermissionController } from './manager-permission.controller';
import { ManagerPermissionService } from './manager-permission.service';

@Module({
    imports: [AuthorizationModule, TownhouseModule, TypeOrmModule.forFeature([ManagerPermission]), UserModule],
    controllers: [ManagerPermissionController],
    providers: [ManagerPermissionService],
    exports: [ManagerPermissionService],
})
export class ManagerPermissionModule {}
