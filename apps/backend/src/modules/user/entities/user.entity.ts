import { UserSituation } from '../enums/user-situation';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
    email: string;

    @Column({ type: 'enum', enum: UserSituation, nullable: false, default: UserSituation.INACTIVE })
    situation: UserSituation;
}
