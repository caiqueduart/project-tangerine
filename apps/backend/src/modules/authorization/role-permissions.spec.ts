import { UserRole } from '../user/enums/user-role';
import { Permission } from './enums/permission';
import { ROLE_PERMISSIONS } from './role-permissions';

describe('ROLE_PERMISSIONS', () => {
    it('mantém as permissões residenciais para gestores de condomínio', () => {
        expect(ROLE_PERMISSIONS[UserRole.TOWNHOUSE_MANAGER]).toEqual(
            expect.arrayContaining(ROLE_PERMISSIONS[UserRole.RESIDENT]),
        );
    });

    it('restringe a alteração de roles ao administrador do sistema', () => {
        expect(ROLE_PERMISSIONS[UserRole.RESIDENT]).not.toContain(Permission.USER_ROLE_UPDATE);
        expect(ROLE_PERMISSIONS[UserRole.TOWNHOUSE_MANAGER]).not.toContain(Permission.USER_ROLE_UPDATE);
        expect(ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]).toContain(Permission.USER_ROLE_UPDATE);
    });
});
