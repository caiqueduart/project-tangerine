import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { HashService } from '../common/services/hash.service';
import { ProvisionalPasswordService } from '../common/services/provisional-password.service';
import { House } from '../house/entities/house.entity';
import { Resident } from './entities/resident.entity';
import { UserAudit } from './entities/user-audit.entity';
import { User } from './entities/user.entity';
import { UserAuditAction } from './enums/user-audit-action';
import { UserRole } from './enums/user-role';
import { UserSituation } from './enums/user-situation';
import { UserService } from './user.service';

describe('UserService', () => {
    const systemAdmin: AuthenticatedActor = {
        userId: 'admin-id',
        role: UserRole.SYSTEM_ADMIN,
        situation: UserSituation.ACTIVE,
        managedTownhouseIds: [],
    };
    const managerActor: AuthenticatedActor = {
        userId: 'manager-id',
        role: UserRole.USER,
        situation: UserSituation.ACTIVE,
        houseId: 7,
        residentialTownhouseId: 8,
        managedTownhouseIds: [2],
    };
    const entityManager = {
        create: jest.fn((entity: { name: string }, data: object) => ({ ...data, entity: entity.name })),
        findOne: jest.fn(),
        remove: jest.fn(),
        save: jest.fn((entity: { entity?: string; id?: string }) =>
            Promise.resolve(entity.entity === User.name ? { ...entity, id: entity.id ?? 'new-user-id' } : entity),
        ),
    };
    const userRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        manager: {
            transaction: jest.fn((operation: (manager: typeof entityManager) => unknown) => operation(entityManager)),
        },
    };
    const userAuditRepository = {
        find: jest.fn(),
    };
    const hashService = {
        hash: jest.fn().mockResolvedValue('password-hash'),
        compare: jest.fn(),
    };
    const provisionalPasswordService = {
        generate: jest.fn().mockReturnValue('Casa2748'),
    };
    const townhousePolicy = {
        assertCanManage: jest.fn(),
    };

    let service: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        hashService.hash.mockResolvedValue('password-hash');
        provisionalPasswordService.generate.mockReturnValue('Casa2748');
        service = new UserService(
            userRepository as unknown as Repository<User>,
            userAuditRepository as unknown as Repository<UserAudit>,
            hashService as unknown as HashService,
            provisionalPasswordService as unknown as ProvisionalPasswordService,
            townhousePolicy as unknown as TownhousePolicy,
        );
    });

    it('pré-cadastra um usuário pendente sem vínculo pelo administrador do sistema', async () => {
        const result = await service.create(
            {
                firstName: 'Ana',
                lastName: 'Silva',
                phone: '11999999999',
                email: 'ana@example.com',
            },
            systemAdmin,
        );

        expect(provisionalPasswordService.generate).toHaveBeenCalled();
        expect(hashService.hash).toHaveBeenCalledWith('Casa2748');
        expect(entityManager.create).toHaveBeenCalledWith(
            User,
            expect.objectContaining({
                passwordHash: 'password-hash',
                situation: UserSituation.PENDING,
                role: UserRole.USER,
            }),
        );
        expect(entityManager.create).toHaveBeenCalledWith(UserAudit, {
            userId: 'new-user-id',
            action: UserAuditAction.CREATED,
            actorUserId: systemAdmin.userId,
        });
        expect(result.provisionalPassword).toBe('Casa2748');
        expect(result).not.toHaveProperty('passwordHash');
    });

    it('exige vínculo residencial no pré-cadastro realizado por gestor', async () => {
        await expect(
            service.create(
                {
                    firstName: 'Ana',
                    lastName: 'Silva',
                    phone: '11999999999',
                },
                managerActor,
            ),
        ).rejects.toThrow(ForbiddenException);
        expect(provisionalPasswordService.generate).not.toHaveBeenCalled();
    });

    it('valida que a casa pertence ao condomínio no pré-cadastro', async () => {
        entityManager.findOne.mockResolvedValue({
            id: 10,
            identifier: 'Casa 10',
            townhouse: { id: 2, name: 'Corumbá II', slug: 'corumba-ii' },
        });

        await service.create(
            {
                firstName: 'Ana',
                lastName: 'Silva',
                phone: '11999999999',
                townhouseId: 2,
                houseId: 10,
            },
            managerActor,
        );

        expect(townhousePolicy.assertCanManage).toHaveBeenCalledWith(managerActor, 2);
        expect(entityManager.findOne).toHaveBeenCalledWith(House, {
            where: { id: 10, townhouse: { id: 2 } },
            relations: { townhouse: true },
        });
    });

    it('renova a data de criação do vínculo ao trocar o usuário de casa', async () => {
        const originalCreatedAt = new Date('2025-01-01T00:00:00.000Z');
        const user = createUser({
            resident: {
                userId: 'user-id',
                houseId: 7,
                house: {
                    id: 7,
                    townhouse: { id: 1 },
                },
                createdAt: originalCreatedAt,
            } as Resident,
        });
        userRepository.findOne.mockResolvedValue(user);
        entityManager.findOne.mockResolvedValue({
            id: 10,
            identifier: 'Casa 10',
            townhouse: { id: 2, name: 'Corumbá II', slug: 'corumba-ii' },
        });

        await service.update(user.id, { townhouseId: 2, houseId: 10 }, systemAdmin);

        expect(user.resident?.houseId).toBe(10);
        expect(user.resident?.createdAt).toEqual(expect.any(Date));
        expect(user.resident?.createdAt).not.toEqual(originalCreatedAt);
    });

    it('não permite que o administrador aprove manualmente um usuário pendente', async () => {
        userRepository.findOne.mockResolvedValue(createUser({ situation: UserSituation.PENDING }));

        await expect(service.update('user-id', { situation: UserSituation.ACTIVE }, systemAdmin)).rejects.toThrow(
            ConflictException,
        );
    });

    it('substitui a senha e ativa o usuário no primeiro acesso com duas auditorias', async () => {
        const user = createUser({ situation: UserSituation.PENDING, passwordHash: 'temporary-hash' });
        userRepository.findOne.mockResolvedValue(user);

        const result = await service.completeFirstAccess(user.id, 'MinhaSenha9');

        expect(hashService.hash).toHaveBeenCalledWith('MinhaSenha9');
        expect(result.passwordHash).toBe('password-hash');
        expect(result.situation).toBe(UserSituation.ACTIVE);
        expect(entityManager.create).toHaveBeenCalledWith(UserAudit, {
            userId: user.id,
            action: UserAuditAction.PASSWORD_CHANGED,
            actorUserId: user.id,
        });
        expect(entityManager.create).toHaveBeenCalledWith(UserAudit, {
            userId: user.id,
            action: UserAuditAction.ACTIVATED,
            actorUserId: user.id,
        });
    });

    it('regenera e audita a senha somente para usuário pendente', async () => {
        const user = createUser({ situation: UserSituation.PENDING, passwordHash: 'old-hash' });
        userRepository.findOne.mockResolvedValue(user);

        await expect(service.regenerateProvisionalPassword(user.id, systemAdmin)).resolves.toEqual({
            provisionalPassword: 'Casa2748',
        });
        expect(user.passwordHash).toBe('password-hash');
        expect(entityManager.create).toHaveBeenCalledWith(UserAudit, {
            userId: user.id,
            action: UserAuditAction.PASSWORD_CHANGED,
            actorUserId: systemAdmin.userId,
        });

        userRepository.findOne.mockResolvedValue(createUser({ situation: UserSituation.ACTIVE }));
        await expect(service.regenerateProvisionalPassword(user.id, systemAdmin)).rejects.toThrow(ConflictException);
    });

    it('audita a alteração de senha feita por usuário ativo', async () => {
        const user = createUser({ situation: UserSituation.ACTIVE, passwordHash: 'old-hash' });
        userRepository.findOne.mockResolvedValue(user);
        hashService.compare.mockResolvedValue(true);

        await service.changePassword(user.id, 'SenhaAntiga8', 'SenhaNova9');

        expect(hashService.compare).toHaveBeenCalledWith('SenhaAntiga8', 'old-hash');
        expect(entityManager.create).toHaveBeenCalledWith(UserAudit, {
            userId: user.id,
            action: UserAuditAction.PASSWORD_CHANGED,
            actorUserId: user.id,
        });
    });
});

function createUser(overrides: Partial<User> = {}): User {
    return {
        id: 'user-id',
        firstName: 'Ana',
        lastName: 'Silva',
        phone: '11999999999',
        email: null,
        passwordHash: 'password-hash',
        situation: UserSituation.ACTIVE,
        role: UserRole.USER,
        managerPermissions: [],
        ...overrides,
    } as User;
}
