import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Townhouse } from '../../townhouse/entities/townhouse.entity';
import { User } from '../../user/entities/user.entity';
import { ManagerPermissionSituation } from '../enums/manager-permission-situation';

@Entity({ name: 'ManagerPermissions' })
@Index('UQ_manager_permission_user_townhouse', ['userId', 'townhouseId'], { unique: true })
export class ManagerPermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.managerPermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_manager_permission_user' })
    user: User;

    @Column({ type: 'integer' })
    townhouseId: number;

    @ManyToOne(() => Townhouse, (townhouse) => townhouse.managerPermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'townhouseId', foreignKeyConstraintName: 'FK_manager_permission_townhouse' })
    townhouse: Townhouse;

    @Column({
        type: 'enum',
        enum: ManagerPermissionSituation,
        enumName: 'manager_permission_situation_enum',
        default: ManagerPermissionSituation.ACTIVE,
    })
    situation: ManagerPermissionSituation;

    @Column({ type: 'uuid', nullable: true })
    grantedByUserId: string | null;

    @Column({ type: 'timestamptz' })
    grantedAt: Date;

    @Column({ type: 'uuid', nullable: true })
    revokedByUserId: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    revokedAt: Date | null;
}
