import { GUARDS_METADATA } from '@nestjs/common/constants';
import { REQUIRED_PERMISSIONS_KEY } from '../authorization/authorization.constants';
import { Permission } from '../authorization/enums/permission';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { HouseController } from './house.controller';

describe('HouseController', () => {
    it('protege o controller com o guard de permissões', () => {
        expect(Reflect.getMetadata(GUARDS_METADATA, HouseController)).toContain(PermissionsGuard);
    });

    it.each([
        ['post', Permission.HOUSE_CREATE],
        ['postBatch', Permission.HOUSE_CREATE],
        ['getOptions', Permission.HOUSE_READ],
        ['getOne', Permission.HOUSE_READ],
        ['updateOne', Permission.HOUSE_UPDATE],
        ['deleteOne', Permission.HOUSE_DELETE],
    ] as const)('exige %s na operação %s', (methodName, permission) => {
        expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, HouseController.prototype[methodName])).toEqual([
            permission,
        ]);
    });
});
