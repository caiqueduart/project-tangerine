import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { Townhouse } from '../townhouse/entities/townhouse.entity';
import { TownhouseService } from '../townhouse/townhouse.service';
import { User } from '../user/entities/user.entity';
import { UserAuditAction } from '../user/enums/user-audit-action';
import { UserRole } from '../user/enums/user-role';
import { UserSituation } from '../user/enums/user-situation';
import { UserService } from '../user/user.service';
import { ManagerPermission } from './entities/manager-permission.entity';
import { ManagerPermissionSituation } from './enums/manager-permission-situation';
import { ManagerPermissionService } from './manager-permission.service';

describe('ManagerPermissionService', () => {
    const actor: AuthenticatedActor = {
        userId: '4de33229-257f-4d71-bc71-577771bd1704',
        role: UserRole.SYSTEM_ADMIN,
        situation: UserSituation.ACTIVE,
        managedTownhouseIds: [],
    };
    const user = {
        id: 'c78dfeb3-bf44-44f5-bd64-1fbffce5a52b',
        firstName: 'Ana',
        lastName: 'Silva',
        phone: '11999999999',
        email: 'ana@example.com',
        role: UserRole.USER,
        situation: UserSituation.ACTIVE,
    } as User;
    const townhouse = { id: 2, name: 'Corumbá II', slug: 'corumba-ii' } as Townhouse;
    const managerPermissionRepository = {
        create: jest.fn((data: object) => data),
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn((permission: ManagerPermission) => Promise.resolve({ id: 'permission-id', ...permission })),
    };
    const townhousePolicy = { assertCanManage: jest.fn() };
    const townhouseService = { getActiveForManagerPermission: jest.fn() };
    const userService = { getActiveForManagerPermission: jest.fn(), recordAudit: jest.fn() };

    let service: ManagerPermissionService;

    beforeEach(() => {
        jest.clearAllMocks();
        managerPermissionRepository.findOne.mockResolvedValue(null);
        townhouseService.getActiveForManagerPermission.mockResolvedValue(townhouse);
        userService.getActiveForManagerPermission.mockResolvedValue(user);
        service = new ManagerPermissionService(
            managerPermissionRepository as unknown as Repository<ManagerPermission>,
            townhousePolicy as unknown as TownhousePolicy,
            townhouseService as unknown as TownhouseService,
            userService as unknown as UserService,
        );
    });

    it('concede uma permissão sem depender do vínculo residencial', async () => {
        const result = await service.grant(user.id, townhouse.id, actor);

        expect(userService.getActiveForManagerPermission).toHaveBeenCalledWith(user.id);
        expect(townhouseService.getActiveForManagerPermission).toHaveBeenCalledWith(townhouse.id);
        expect(managerPermissionRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: user.id,
                townhouseId: townhouse.id,
            }),
        );
        expect(userService.recordAudit).toHaveBeenCalledWith(
            user.id,
            UserAuditAction.MANAGER_PERMISSION_GRANTED,
            actor.userId,
        );
        expect(result).toEqual(
            expect.objectContaining({
                userId: user.id,
                townhouseId: townhouse.id,
                situation: ManagerPermissionSituation.ACTIVE,
            }),
        );
    });

    it('não duplica uma permissão ativa para o mesmo usuário e condomínio', async () => {
        managerPermissionRepository.findOne.mockResolvedValue({
            userId: user.id,
            townhouseId: townhouse.id,
            situation: ManagerPermissionSituation.ACTIVE,
        });

        await expect(service.grant(user.id, townhouse.id, actor)).rejects.toThrow(ConflictException);
        expect(managerPermissionRepository.save).not.toHaveBeenCalled();
    });

    it('reativa uma permissão anteriormente revogada', async () => {
        const revokedPermission = {
            userId: user.id,
            townhouseId: townhouse.id,
            situation: ManagerPermissionSituation.REVOKED,
            revokedAt: new Date(),
            revokedByUserId: actor.userId,
        } as ManagerPermission;
        managerPermissionRepository.findOne.mockResolvedValue(revokedPermission);

        await service.grant(user.id, townhouse.id, actor);

        expect(managerPermissionRepository.create).not.toHaveBeenCalled();
        expect(revokedPermission.situation).toBe(ManagerPermissionSituation.ACTIVE);
        expect(revokedPermission.revokedAt).toBeNull();
        expect(revokedPermission.revokedByUserId).toBeNull();
    });

    it('revoga somente a permissão do condomínio informado', async () => {
        const permission = {
            userId: user.id,
            townhouseId: townhouse.id,
            situation: ManagerPermissionSituation.ACTIVE,
        } as ManagerPermission;
        managerPermissionRepository.findOne.mockResolvedValue(permission);

        await service.revoke(user.id, townhouse.id, actor);

        expect(permission.situation).toBe(ManagerPermissionSituation.REVOKED);
        expect(permission.revokedByUserId).toBe(actor.userId);
        expect(permission.revokedAt).toBeInstanceOf(Date);
        expect(userService.recordAudit).toHaveBeenCalledWith(
            user.id,
            UserAuditAction.MANAGER_PERMISSION_REVOKED,
            actor.userId,
        );
    });

    it('informa quando não existe permissão ativa para revogar', async () => {
        await expect(service.revoke(user.id, townhouse.id, actor)).rejects.toThrow(NotFoundException);
    });

    it('não permite que um gestor conceda novas permissões', async () => {
        const manager: AuthenticatedActor = {
            userId: user.id,
            role: UserRole.USER,
            situation: UserSituation.ACTIVE,
            managedTownhouseIds: [townhouse.id],
        };

        await expect(service.grant(user.id, townhouse.id, manager)).rejects.toThrow(ForbiddenException);
    });
});
