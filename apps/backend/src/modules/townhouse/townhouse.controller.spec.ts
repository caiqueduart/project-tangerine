import { GUARDS_METADATA } from '@nestjs/common/constants';
import { REQUIRED_PERMISSIONS_KEY } from '../authorization/authorization.constants';
import { Permission } from '../authorization/enums/permission';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { TownhouseController } from './townhouse.controller';

describe('TownhouseController', () => {
    it('protege o controller com o guard de permissões', () => {
        expect(Reflect.getMetadata(GUARDS_METADATA, TownhouseController)).toContain(PermissionsGuard);
    });

    it.each([
        ['getAll', Permission.TOWNHOUSE_READ],
        ['getOptions', Permission.TOWNHOUSE_READ],
        ['getOne', Permission.TOWNHOUSE_READ],
        ['post', Permission.TOWNHOUSE_CREATE],
        ['updateOne', Permission.TOWNHOUSE_UPDATE],
        ['deleteOne', Permission.TOWNHOUSE_DELETE],
    ] as const)('exige %s na operação %s', (methodName, permission) => {
        expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, TownhouseController.prototype[methodName])).toEqual([
            permission,
        ]);
    });
});
