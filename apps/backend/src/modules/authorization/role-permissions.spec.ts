import { UserRole } from '../user/enums/user-role';
import { Permission } from './enums/permission';
import { getActorPermissions, ROLE_PERMISSIONS } from './role-permissions';
import { UserSituation } from '../user/enums/user-situation';

describe('ROLE_PERMISSIONS', () => {
    it('adiciona permissões administrativas quando há uma permissão de gestor ativa', () => {
        const permissions = getActorPermissions({
            userId: 'manager-id',
            role: UserRole.USER,
            situation: UserSituation.ACTIVE,
            managedTownhouseIds: [2],
        });

        expect(permissions).toEqual(expect.arrayContaining(ROLE_PERMISSIONS[UserRole.USER]));
        expect(permissions).toContain(Permission.HOUSE_CREATE);
    });

    it('restringe a alteração de roles ao administrador do sistema', () => {
        expect(ROLE_PERMISSIONS[UserRole.USER]).not.toContain(Permission.USER_ROLE_UPDATE);
        expect(ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]).toContain(Permission.USER_ROLE_UPDATE);
    });
});
