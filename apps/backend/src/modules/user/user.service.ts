import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, QueryFailedError, Repository } from 'typeorm';
import { HashService } from '../common/services/hash.service';
import { House } from '../house/entities/house.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUserDetailsDto, GetUserDto } from './dtos/get-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Resident } from './entities/resident.entity';
import { User } from './entities/user.entity';
import { UserAudit } from './entities/user-audit.entity';
import { UserAuditAction } from './enums/user-audit-action';
import { UserSituation } from './enums/user-situation';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly _userRepository: Repository<User>,
        @InjectRepository(UserAudit) private readonly _userAuditRepository: Repository<UserAudit>,
        private readonly _hashService: HashService,
    ) {}

    async register(dto: CreateUserDto, actorUserId: string | null = null): Promise<GetUserDto> {
        try {
            const passwordHash = await this._hashService.hash(dto.password);

            return await this._userRepository.manager.transaction(async (manager) => {
                const user = manager.create(User, {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    passwordHash,
                    email: dto.email?.trim().toLowerCase() || null,
                    phone: dto.phone.trim(),
                    situation: UserSituation.PENDING,
                });
                const savedUser = await manager.save(user);
                const auditAction = actorUserId ? UserAuditAction.CREATED : UserAuditAction.REGISTRATION_REQUESTED;
                const auditActorUserId = actorUserId ?? savedUser.id;

                await this._saveAudit(manager, savedUser.id, auditAction, auditActorUserId);

                if (dto.houseId === undefined || dto.houseId === null) {
                    return this._toGetUserDto(savedUser);
                }

                savedUser.resident = await this._createResident(manager, savedUser, dto.houseId);
                return this._toGetUserDto(savedUser);
            });
        } catch (error) {
            this._handlePersistenceError(error, 'Erro ao registrar usuário.');
        }
    }

    async get(userId: string): Promise<GetUserDto> {
        return this._toGetUserDto(await this._findOne(userId));
    }

    async getDetails(userId: string): Promise<GetUserDetailsDto> {
        const [user, audits] = await Promise.all([
            this._findOne(userId),
            this._userAuditRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            }),
        ]);
        const actorUserIds = [...new Set(audits.flatMap(({ actorUserId }) => (actorUserId ? [actorUserId] : [])))];
        const actors = actorUserIds.length
            ? await this._userRepository.find({
                  select: { id: true, firstName: true, lastName: true },
                  where: { id: In(actorUserIds) },
              })
            : [];
        const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

        return {
            ...this._toGetUserDto(user),
            audits: audits.map((audit) => ({
                id: audit.id,
                action: audit.action,
                actorUserId: audit.actorUserId,
                actor: audit.actorUserId ? (actorsById.get(audit.actorUserId) ?? null) : null,
                createdAt: audit.createdAt,
            })),
        };
    }

    async getAll(townhouseId?: number): Promise<GetUserDto[]> {
        if (townhouseId !== undefined && (!Number.isInteger(townhouseId) || townhouseId <= 0)) {
            throw new BadRequestException('Condomínio inválido.');
        }

        try {
            const users = await this._userRepository.find({
                where: townhouseId ? { resident: { house: { townhouse: { id: townhouseId } } } } : {},
                relations: { resident: { house: { townhouse: true } } },
                order: { firstName: 'ASC', lastName: 'ASC' },
            });

            return users.map((user) => this._toGetUserDto(user));
        } catch {
            throw new InternalServerErrorException('Erro ao consultar usuários.');
        }
    }

    async update(userId: string, dto: UpdateUserDto, actorUserId: string): Promise<GetUserDto> {
        const user = await this._findOne(userId);
        const isApproval = user.situation === UserSituation.PENDING && dto.situation === UserSituation.ACTIVE;
        const isApprovalOnly = isApproval && Object.keys(dto).every((field) => field === 'situation');

        if (userId === actorUserId && dto.situation !== undefined && dto.situation !== UserSituation.ACTIVE) {
            throw new ForbiddenException('Você não pode inativar seu próprio usuário durante a sessão atual.');
        }

        try {
            return await this._userRepository.manager.transaction(async (manager) => {
                if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
                if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
                if (dto.phone !== undefined) user.phone = dto.phone.trim();
                if (dto.email !== undefined) user.email = dto.email?.trim().toLowerCase() || null;
                if (dto.situation !== undefined) user.situation = dto.situation;

                if (dto.houseId !== undefined) {
                    user.resident = await this._updateResident(manager, user, dto.houseId);
                }

                await manager.save(user);

                if (!isApprovalOnly) {
                    await this._saveAudit(manager, user.id, UserAuditAction.UPDATED, actorUserId);
                }

                if (isApproval) {
                    await this._saveAudit(manager, user.id, UserAuditAction.APPROVED, actorUserId);
                }

                return this._toGetUserDto(user);
            });
        } catch (error) {
            this._handlePersistenceError(error, 'Erro ao atualizar usuário.');
        }
    }

    async reject(userId: string, actorUserId: string): Promise<void> {
        if (userId === actorUserId) {
            throw new ForbiddenException('Você não pode excluir seu próprio usuário durante a sessão atual.');
        }

        const user = await this._findOne(userId);

        if (user.situation !== UserSituation.PENDING) {
            throw new ConflictException('Somente solicitações pendentes podem ser rejeitadas.');
        }

        await this._userRepository.remove(user);
    }

    async findUserByLogin(login: string): Promise<User | null> {
        try {
            return await this._userRepository.findOne({
                where: [{ email: login }, { phone: login }],
                relations: { resident: { house: { townhouse: true } } },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    async findActiveUserById(userId: string): Promise<User | null> {
        try {
            return await this._userRepository.findOne({
                where: { id: userId, situation: UserSituation.ACTIVE },
                relations: { resident: { house: { townhouse: true } } },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    private async _findOne(userId: string): Promise<User> {
        try {
            const user = await this._userRepository.findOne({
                where: { id: userId },
                relations: { resident: { house: { townhouse: true } } },
            });

            if (!user) throw new NotFoundException('Usuário não encontrado.');
            return user;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    private async _createResident(manager: EntityManager, user: User, houseId: number): Promise<Resident> {
        const house = await manager.findOne(House, {
            where: { id: houseId },
            relations: { townhouse: true },
        });

        if (!house) throw new NotFoundException('Casa não encontrada.');

        return manager.save(
            manager.create(Resident, {
                userId: user.id,
                user,
                houseId: house.id,
                house,
            }),
        );
    }

    private async _updateResident(
        manager: EntityManager,
        user: User,
        houseId: number | null,
    ): Promise<Resident | undefined> {
        if (houseId === null) {
            if (user.resident) await manager.remove(user.resident);
            return undefined;
        }

        const house = await manager.findOne(House, {
            where: { id: houseId },
            relations: { townhouse: true },
        });

        if (!house) throw new NotFoundException('Casa não encontrada.');

        const resident = user.resident ?? manager.create(Resident, { userId: user.id, user });
        resident.houseId = house.id;
        resident.house = house;
        return manager.save(resident);
    }

    private async _saveAudit(
        manager: EntityManager,
        userId: string,
        action: UserAuditAction,
        actorUserId: string | null,
    ): Promise<void> {
        await manager.save(
            manager.create(UserAudit, {
                userId,
                action,
                actorUserId,
            }),
        );
    }

    private _toGetUserDto(user: User): GetUserDto {
        const house = user.resident?.house;

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            situation: user.situation,
            house: house
                ? {
                      id: house.id,
                      identifier: house.identifier,
                      townhouse: {
                          id: house.townhouse.id,
                          name: house.townhouse.name,
                          slug: house.townhouse.slug,
                      },
                  }
                : null,
        };
    }

    private _handlePersistenceError(error: unknown, fallbackMessage: string): never {
        if (error instanceof HttpException) throw error;

        const driverError = error instanceof QueryFailedError ? (error.driverError as { code?: string }) : null;
        if (driverError?.code === '23505') {
            throw new ConflictException('Já existe um usuário com esse telefone ou e-mail.');
        }

        throw new InternalServerErrorException(fallbackMessage);
    }
}
