import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, QueryFailedError, Repository } from 'typeorm';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { HashService } from '../common/services/hash.service';
import { ProvisionalPasswordService } from '../common/services/provisional-password.service';
import { House } from '../house/entities/house.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateUserResultDto, GetUserDetailsDto, GetUserDto } from './dtos/get-user.dto';
import { ProvisionalPasswordDto } from './dtos/password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Resident } from './entities/resident.entity';
import { User } from './entities/user.entity';
import { UserAudit } from './entities/user-audit.entity';
import { UserAuditAction } from './enums/user-audit-action';
import { UserRole } from './enums/user-role';
import { UserSituation } from './enums/user-situation';

interface ResidenceSelection {
    readonly townhouseId: number;
    readonly houseId: number;
}

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly _userRepository: Repository<User>,
        @InjectRepository(UserAudit) private readonly _userAuditRepository: Repository<UserAudit>,
        private readonly _hashService: HashService,
        private readonly _provisionalPasswordService: ProvisionalPasswordService,
        private readonly _townhousePolicy: TownhousePolicy,
    ) {}

    async create(dto: CreateUserDto, actor: AuthenticatedActor): Promise<CreateUserResultDto> {
        const residence = this._getResidenceSelection(dto.townhouseId, dto.houseId);
        this._assertCanCreate(actor, residence);

        const provisionalPassword = this._provisionalPasswordService.generate();
        const passwordHash = await this._hashService.hash(provisionalPassword);

        try {
            const user = await this._userRepository.manager.transaction(async (manager) => {
                const house = residence ? await this._findHouse(manager, residence, actor) : null;
                const newUser = manager.create(User, {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    passwordHash,
                    email: dto.email?.trim().toLowerCase() || null,
                    phone: dto.phone.trim(),
                    situation: UserSituation.PENDING,
                    role: UserRole.RESIDENT,
                });
                const savedUser = await manager.save(newUser);

                await this._saveAudit(manager, savedUser.id, UserAuditAction.CREATED, actor.userId);

                if (house) {
                    savedUser.resident = await this._createResident(manager, savedUser, house);
                }

                return savedUser;
            });

            return {
                ...this._toGetUserDto(user),
                provisionalPassword,
            };
        } catch (error) {
            this._handlePersistenceError(error, 'Erro ao registrar usuário.');
        }
    }

    async get(userId: string): Promise<GetUserDto> {
        return this._toGetUserDto(await this._findOne(userId));
    }

    async getForActor(userId: string, actor: AuthenticatedActor): Promise<GetUserDto> {
        const user = await this._findOne(userId);
        this._assertCanManageUser(actor, user);
        return this._toGetUserDto(user);
    }

    async getDetails(userId: string, actor: AuthenticatedActor): Promise<GetUserDetailsDto> {
        const user = await this._findOne(userId);
        this._assertCanManageUser(actor, user);
        const audits = await this._userAuditRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        const actorUserIds = [...new Set(audits.flatMap(({ actorUserId }) => (actorUserId ? [actorUserId] : [])))];
        const actors = actorUserIds.length
            ? await this._userRepository.find({
                  select: { id: true, firstName: true, lastName: true },
                  where: { id: In(actorUserIds) },
              })
            : [];
        const actorsById = new Map(actors.map((auditActor) => [auditActor.id, auditActor]));

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

    async getAll(actor: AuthenticatedActor, townhouseId?: number): Promise<GetUserDto[]> {
        if (townhouseId !== undefined && (!Number.isInteger(townhouseId) || townhouseId <= 0)) {
            throw new BadRequestException('Condomínio inválido.');
        }

        const scopedTownhouseId = this._getScopedTownhouseId(actor, townhouseId);

        try {
            const users = await this._userRepository.find({
                where: scopedTownhouseId ? { resident: { house: { townhouse: { id: scopedTownhouseId } } } } : {},
                relations: { resident: { house: { townhouse: true } } },
                order: { firstName: 'ASC', lastName: 'ASC' },
            });

            return users.map((user) => this._toGetUserDto(user));
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao consultar usuários.');
        }
    }

    async update(userId: string, dto: UpdateUserDto, actor: AuthenticatedActor): Promise<GetUserDto> {
        const user = await this._findOne(userId);
        this._assertCanManageUser(actor, user);

        if (userId === actor.userId && dto.situation !== undefined && dto.situation !== UserSituation.ACTIVE) {
            throw new ForbiddenException('Você não pode inativar seu próprio usuário durante a sessão atual.');
        }

        if (dto.role !== undefined && actor.role !== UserRole.SYSTEM_ADMIN) {
            throw new ForbiddenException('Somente o administrador do sistema pode alterar papéis administrativos.');
        }

        if (dto.situation === UserSituation.PENDING && user.situation !== UserSituation.PENDING) {
            throw new ConflictException('A situação pendente é definida somente no pré-cadastro.');
        }

        if (user.situation === UserSituation.PENDING && dto.situation === UserSituation.ACTIVE) {
            throw new ConflictException('O usuário pendente deve definir uma nova senha para ativar o cadastro.');
        }

        const hasTownhouseId = dto.townhouseId !== undefined;
        const hasHouseId = dto.houseId !== undefined;

        if (hasTownhouseId !== hasHouseId) {
            throw new BadRequestException('Condomínio e casa devem ser informados em conjunto.');
        }

        try {
            return await this._userRepository.manager.transaction(async (manager) => {
                if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
                if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
                if (dto.phone !== undefined) user.phone = dto.phone.trim();
                if (dto.email !== undefined) user.email = dto.email?.trim().toLowerCase() || null;
                if (dto.situation !== undefined) user.situation = dto.situation;
                if (dto.role !== undefined) user.role = dto.role;

                if (hasTownhouseId && hasHouseId) {
                    user.resident = await this._updateResident(
                        manager,
                        user,
                        dto.townhouseId ?? null,
                        dto.houseId ?? null,
                        actor,
                    );
                }

                if (user.role === UserRole.TOWNHOUSE_MANAGER && !user.resident) {
                    throw new BadRequestException('O gestor de condomínio deve possuir vínculo residencial.');
                }

                await manager.save(user);
                await this._saveAudit(manager, user.id, UserAuditAction.UPDATED, actor.userId);

                return this._toGetUserDto(user);
            });
        } catch (error) {
            this._handlePersistenceError(error, 'Erro ao atualizar usuário.');
        }
    }

    async regenerateProvisionalPassword(userId: string, actor: AuthenticatedActor): Promise<ProvisionalPasswordDto> {
        const user = await this._findOne(userId);
        this._assertCanManageUser(actor, user);

        if (user.situation !== UserSituation.PENDING) {
            throw new ConflictException('A senha provisória só pode ser gerada para usuários pendentes.');
        }

        const provisionalPassword = this._provisionalPasswordService.generate();
        const passwordHash = await this._hashService.hash(provisionalPassword);

        await this._userRepository.manager.transaction(async (manager) => {
            user.passwordHash = passwordHash;
            await manager.save(user);
            await this._saveAudit(manager, user.id, UserAuditAction.PASSWORD_CHANGED, actor.userId);
        });

        return { provisionalPassword };
    }

    async completeFirstAccess(userId: string, newPassword: string): Promise<User> {
        const user = await this._findOne(userId);

        if (user.situation !== UserSituation.PENDING) {
            throw new ConflictException('O primeiro acesso já foi concluído.');
        }

        const passwordHash = await this._hashService.hash(newPassword);

        return this._userRepository.manager.transaction(async (manager) => {
            user.passwordHash = passwordHash;
            user.situation = UserSituation.ACTIVE;
            await manager.save(user);
            await this._saveAudit(manager, user.id, UserAuditAction.PASSWORD_CHANGED, user.id);
            await this._saveAudit(manager, user.id, UserAuditAction.ACTIVATED, user.id);
            return user;
        });
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this._findOne(userId);

        if (user.situation !== UserSituation.ACTIVE) {
            throw new ConflictException('Conclua o primeiro acesso antes de alterar a senha.');
        }

        const isCurrentPasswordValid = await this._hashService.compare(currentPassword, user.passwordHash);

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Senha atual inválida.');
        }

        const passwordHash = await this._hashService.hash(newPassword);

        await this._userRepository.manager.transaction(async (manager) => {
            user.passwordHash = passwordHash;
            await manager.save(user);
            await this._saveAudit(manager, user.id, UserAuditAction.PASSWORD_CHANGED, user.id);
        });
    }

    async findUserByLogin(login: string): Promise<User | null> {
        try {
            const normalizedLogin = login.trim();
            return await this._userRepository.findOne({
                where: [{ email: normalizedLogin.toLowerCase() }, { phone: normalizedLogin }],
                relations: { resident: { house: { townhouse: true } } },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    async findAuthenticatableUserById(userId: string): Promise<User | null> {
        try {
            return await this._userRepository.findOne({
                where: { id: userId, situation: In([UserSituation.ACTIVE, UserSituation.PENDING]) },
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

    private _getResidenceSelection(
        townhouseId: number | null | undefined,
        houseId: number | null | undefined,
    ): ResidenceSelection | null {
        const hasTownhouse = townhouseId !== undefined && townhouseId !== null;
        const hasHouse = houseId !== undefined && houseId !== null;

        if (hasTownhouse !== hasHouse) {
            throw new BadRequestException('Condomínio e casa devem ser informados em conjunto.');
        }

        return hasTownhouse && hasHouse ? { townhouseId, houseId } : null;
    }

    private _assertCanCreate(actor: AuthenticatedActor, residence: ResidenceSelection | null): void {
        if (actor.role === UserRole.SYSTEM_ADMIN) return;

        if (actor.role !== UserRole.TOWNHOUSE_MANAGER || !residence) {
            throw new ForbiddenException();
        }

        this._townhousePolicy.assertCanManage(actor, residence.townhouseId);
    }

    private _getScopedTownhouseId(actor: AuthenticatedActor, requestedTownhouseId?: number): number | undefined {
        if (actor.role === UserRole.SYSTEM_ADMIN) return requestedTownhouseId;

        if (actor.role !== UserRole.TOWNHOUSE_MANAGER || !actor.townhouseId) {
            throw new ForbiddenException();
        }

        if (requestedTownhouseId !== undefined) {
            this._townhousePolicy.assertCanManage(actor, requestedTownhouseId);
        }

        return actor.townhouseId;
    }

    private _assertCanManageUser(actor: AuthenticatedActor, user: User): void {
        if (actor.role === UserRole.SYSTEM_ADMIN) return;

        if (actor.role !== UserRole.TOWNHOUSE_MANAGER || user.role === UserRole.SYSTEM_ADMIN) {
            throw new ForbiddenException();
        }

        const townhouseId = user.resident?.house.townhouse.id;

        if (!townhouseId) throw new ForbiddenException();
        this._townhousePolicy.assertCanManage(actor, townhouseId);
    }

    private async _findHouse(
        manager: EntityManager,
        residence: ResidenceSelection,
        actor: AuthenticatedActor,
    ): Promise<House> {
        this._townhousePolicy.assertCanManage(actor, residence.townhouseId);
        const house = await manager.findOne(House, {
            where: { id: residence.houseId, townhouse: { id: residence.townhouseId } },
            relations: { townhouse: true },
        });

        if (!house) throw new NotFoundException('Casa não encontrada no condomínio informado.');
        return house;
    }

    private async _createResident(manager: EntityManager, user: User, house: House): Promise<Resident> {
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
        townhouseId: number | null,
        houseId: number | null,
        actor: AuthenticatedActor,
    ): Promise<Resident | undefined> {
        const residence = this._getResidenceSelection(townhouseId, houseId);

        if (!residence) {
            if (actor.role !== UserRole.SYSTEM_ADMIN) throw new ForbiddenException();
            if (user.resident) await manager.remove(user.resident);
            return undefined;
        }

        const house = await this._findHouse(manager, residence, actor);
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
            role: user.role,
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
