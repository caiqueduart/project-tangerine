import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { House } from '../../house/entities/house.entity';

@Entity()
export class Resident {
    @PrimaryColumn('uuid')
    userId: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'integer' })
    houseId: number;

    @ManyToOne(() => House, (house) => house.residents, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'houseId' })
    house: House;
}
