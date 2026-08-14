import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserAuditAction } from '../enums/user-audit-action';

@Entity({ name: 'UserAudits' })
@Index(['userId', 'createdAt'])
export class UserAudit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'enum', enum: UserAuditAction })
    action: UserAuditAction;

    @Column({ type: 'uuid', nullable: true })
    actorUserId: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
