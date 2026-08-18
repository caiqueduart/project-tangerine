import { Module } from '@nestjs/common';
import { PermissionsGuard } from './guards/permissions.guard';
import { HousePolicy } from './policies/house.policy';
import { TownhousePolicy } from './policies/townhouse.policy';

@Module({
    providers: [PermissionsGuard, HousePolicy, TownhousePolicy],
    exports: [PermissionsGuard, HousePolicy, TownhousePolicy],
})
export class AuthorizationModule {}
