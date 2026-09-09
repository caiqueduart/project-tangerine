import {
    ConflictException,
    ForbiddenException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { AuthenticatedActor } from '../authorization/models/authenticated-actor';
import { TownhousePolicy } from '../authorization/policies/townhouse.policy';
import { TownhouseService } from '../townhouse/townhouse.service';
import { UserAuditAction } from '../user/enums/user-audit-action';
import { UserRole } from '../user/enums/user-role';
import { UserService } from '../user/user.service';
import { ManagerPermissionDto } from './dtos/manager-permission.dto';
import { ManagerPermission } from './entities/manager-permission.entity';
import { ManagerPermissionSituation } from './enums/manager-permission-situation';

@Injectable()
export class ManagerPermissionService {
    constructor(
        @InjectRepository(ManagerPermission)
        private readonly _managerPermissionRepository: Repository<ManagerPermission>,
        private readonly _townhousePolicy: TownhousePolicy,
        private readonly _townhouseService: TownhouseService,
        private readonly _userService: UserService,
    ) {}

    async getActiveByTownhouse(townhouseId: number, actor: AuthenticatedActor): Promise<ManagerPermissionDto[]> {
        this._townhousePolicy.assertCanManage(actor, townhouseId);

        try {
            const permissions = await this._managerPermissionRepository.find({
                where: { townhouseId, situation: ManagerPermissionSituation.ACTIVE },
                relations: { user: true, townhouse: true },
                order: { user: { firstName: 'ASC', lastName: 'ASC' } },
            });

            return permissions.map((permission) => this._toDto(permission));
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao consultar gestores do condomínio.');
        }
    }

    async grant(userId: string, townhouseId: number, actor: AuthenticatedActor): Promise<ManagerPermissionDto> {
        this._assertSystemAdmin(actor);

        const [user, townhouse] = await Promise.all([
            this._userService.getActiveForManagerPermission(userId),
            this._townhouseService.getActiveForManagerPermission(townhouseId),
        ]);
        const existingPermission = await this._managerPermissionRepository.findOne({
            where: { userId, townhouseId },
        });

        if (existingPermission?.situation === ManagerPermissionSituation.ACTIVE) {
            throw new ConflictException('O usuário já possui permissão de gestor neste condomínio.');
        }

        const permission = existingPermission ?? this._managerPermissionRepository.create({ userId, townhouseId });
        permission.user = user;
        permission.townhouse = townhouse;
        permission.situation = ManagerPermissionSituation.ACTIVE;
        permission.grantedByUserId = actor.userId;
        permission.grantedAt = new Date();
        permission.revokedByUserId = null;
        permission.revokedAt = null;

        try {
            const savedPermission = await this._managerPermissionRepository.save(permission);
            await this._userService.recordAudit(userId, UserAuditAction.MANAGER_PERMISSION_GRANTED, actor.userId);
            return this._toDto(savedPermission);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            const driverError = error instanceof QueryFailedError ? (error.driverError as { code?: string }) : null;

            if (driverError?.code === '23505') {
                throw new ConflictException('O usuário já possui permissão de gestor neste condomínio.');
            }

            throw new InternalServerErrorException('Erro ao conceder permissão de gestor.');
        }
    }

    async revoke(userId: string, townhouseId: number, actor: AuthenticatedActor): Promise<void> {
        this._assertSystemAdmin(actor);

        const permission = await this._managerPermissionRepository.findOne({
            where: { userId, townhouseId, situation: ManagerPermissionSituation.ACTIVE },
        });

        if (!permission) {
            throw new NotFoundException('Permissão de gestor ativa não encontrada.');
        }

        permission.situation = ManagerPermissionSituation.REVOKED;
        permission.revokedByUserId = actor.userId;
        permission.revokedAt = new Date();

        try {
            await this._managerPermissionRepository.save(permission);
            await this._userService.recordAudit(userId, UserAuditAction.MANAGER_PERMISSION_REVOKED, actor.userId);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao remover permissão de gestor.');
        }
    }

    private _assertSystemAdmin(actor: AuthenticatedActor): void {
        if (actor.role !== UserRole.SYSTEM_ADMIN) throw new ForbiddenException();
    }

    private _toDto(permission: ManagerPermission): ManagerPermissionDto {
        return {
            id: permission.id,
            userId: permission.userId,
            townhouseId: permission.townhouseId,
            situation: permission.situation,
            grantedByUserId: permission.grantedByUserId,
            grantedAt: permission.grantedAt,
            revokedByUserId: permission.revokedByUserId,
            revokedAt: permission.revokedAt,
            user: {
                id: permission.user.id,
                firstName: permission.user.firstName,
                lastName: permission.user.lastName,
                phone: permission.user.phone,
                email: permission.user.email,
                role: permission.user.role,
                situation: permission.user.situation,
            },
            townhouse: {
                id: permission.townhouse.id,
                name: permission.townhouse.name,
                slug: permission.townhouse.slug,
            },
        };
    }
}
