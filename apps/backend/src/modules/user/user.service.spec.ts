import { Repository } from 'typeorm';
import { HashService } from '../common/services/hash.service';
import { UserAudit } from './entities/user-audit.entity';
import { User } from './entities/user.entity';
import { UserAuditAction } from './enums/user-audit-action';
import { UserSituation } from './enums/user-situation';
import { UserService } from './user.service';

describe('UserService', () => {
    const manager = {
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
            transaction: jest.fn((operation: (entityManager: typeof manager) => unknown) => operation(manager)),
        },
    };
    const userAuditRepository = {
        find: jest.fn(),
    };
    const hashService = {
        hash: jest.fn().mockResolvedValue('password-hash'),
    };

    let service: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UserService(
            userRepository as unknown as Repository<User>,
            userAuditRepository as unknown as Repository<UserAudit>,
            hashService as unknown as HashService,
        );
    });

    it('registra como pendente um usuário criado pelo administrador', async () => {
        await service.register(
            {
                firstName: 'Ana',
                lastName: 'Silva',
                phone: '11999999999',
                email: 'ana@example.com',
                password: 'password',
            },
            'admin-id',
        );

        expect(manager.create).toHaveBeenCalledWith(
            User,
            expect.objectContaining({ situation: UserSituation.PENDING }),
        );

        expect(manager.create).toHaveBeenCalledWith(UserAudit, {
            userId: 'new-user-id',
            action: UserAuditAction.CREATED,
            actorUserId: 'admin-id',
        });
        expect(manager.create).not.toHaveBeenCalledWith(
            UserAudit,
            expect.objectContaining({ action: UserAuditAction.APPROVED }),
        );
    });

    it('registra uma solicitação pública pendente com o próprio usuário como autor', async () => {
        await service.register({
            firstName: 'Ana',
            lastName: 'Silva',
            phone: '11999999999',
            password: 'password',
        });

        expect(manager.create).toHaveBeenCalledWith(UserAudit, {
            userId: 'new-user-id',
            action: UserAuditAction.REGISTRATION_REQUESTED,
            actorUserId: 'new-user-id',
        });
    });

    it('registra somente aprovação quando a única alteração ativa um cadastro pendente', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 'user-id',
            firstName: 'Ana',
            lastName: 'Silva',
            phone: '11999999999',
            email: null,
            situation: UserSituation.PENDING,
        });

        await service.update('user-id', { situation: UserSituation.ACTIVE }, 'admin-id');

        expect(manager.create).toHaveBeenCalledWith(UserAudit, {
            userId: 'user-id',
            action: UserAuditAction.APPROVED,
            actorUserId: 'admin-id',
        });
        expect(manager.create).not.toHaveBeenCalledWith(
            UserAudit,
            expect.objectContaining({ action: UserAuditAction.UPDATED }),
        );
    });

    it('registra uma atualização com o responsável pela ação', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 'user-id',
            firstName: 'Ana',
            lastName: 'Silva',
            phone: '11999999999',
            email: null,
            situation: UserSituation.ACTIVE,
        });

        await service.update('user-id', { firstName: 'Beatriz' }, 'admin-id');

        expect(manager.create).toHaveBeenCalledWith(UserAudit, {
            userId: 'user-id',
            action: UserAuditAction.UPDATED,
            actorUserId: 'admin-id',
        });
    });

    it('consulta um usuário ativo com seu vínculo residencial', async () => {
        const user = {
            id: 'user-id',
            situation: UserSituation.ACTIVE,
        };
        userRepository.findOne.mockResolvedValue(user);

        await expect(service.findActiveUserById('user-id')).resolves.toBe(user);
        expect(userRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'user-id', situation: UserSituation.ACTIVE },
            relations: { resident: { house: { townhouse: true } } },
        });
    });

    it('retorna detalhes e histórico sem expor o hash da senha', async () => {
        const createdAt = new Date('2026-08-12T12:00:00.000Z');
        userRepository.findOne.mockResolvedValue({
            id: 'user-id',
            firstName: 'Ana',
            lastName: 'Silva',
            phone: '11999999999',
            email: 'ana@example.com',
            passwordHash: 'secret-hash',
            situation: UserSituation.ACTIVE,
        });
        userAuditRepository.find.mockResolvedValue([
            {
                id: 'audit-id',
                userId: 'user-id',
                action: UserAuditAction.UPDATED,
                actorUserId: 'admin-id',
                createdAt,
            },
        ]);
        userRepository.find.mockResolvedValue([{ id: 'admin-id', firstName: 'Admin', lastName: 'Sistema' }]);

        const result = await service.getDetails('user-id');

        expect(result).toEqual({
            id: 'user-id',
            firstName: 'Ana',
            lastName: 'Silva',
            phone: '11999999999',
            email: 'ana@example.com',
            situation: UserSituation.ACTIVE,
            house: null,
            audits: [
                {
                    id: 'audit-id',
                    action: UserAuditAction.UPDATED,
                    actorUserId: 'admin-id',
                    actor: { id: 'admin-id', firstName: 'Admin', lastName: 'Sistema' },
                    createdAt,
                },
            ],
        });
        expect(result).not.toHaveProperty('passwordHash');
    });
});
