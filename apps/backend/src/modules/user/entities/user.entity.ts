import { UserSituation } from '../enums/user-situation';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Resident } from './resident.entity';
import { UserRole } from '../enums/user-role';
import { ManagerPermission } from '../../manager-permission/entities/manager-permission.entity';

@Entity()
export class User {
    @Column({ type: 'varchar', nullable: false })
    passwordHash: string;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: false, length: 20 })
    firstName: string;

    @Column({ type: 'varchar', nullable: false, length: 80 })
    lastName: string;

    @Column({ type: 'varchar', nullable: false, length: 20, unique: true })
    phone: string;

    @Column({ type: 'varchar', nullable: true, length: 255, unique: true })
    email: string | null;

    @Column({ type: 'enum', enum: UserSituation, nullable: false, default: UserSituation.PENDING })
    situation: UserSituation;

    @Column({ type: 'enum', enum: UserRole, enumName: 'user_role_enum', nullable: false, default: UserRole.USER })
    role: UserRole;

    @OneToOne(() => Resident, (resident) => resident.user)
    resident?: Resident;

    @OneToMany(() => ManagerPermission, (permission) => permission.user)
    managerPermissions?: ManagerPermission[];
}
