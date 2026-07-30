import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Townhouse } from '../../townhouse/entities/townhouse.entity';
import { Resident } from '../../user/entities/resident.entity';

@Entity()
@Unique(['townhouse', 'identifier'])
export class House {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Townhouse, { nullable: false })
    @JoinColumn({ name: 'townhouseId' })
    townhouse: Townhouse;

    @Column({ nullable: false, type: 'varchar', length: 50 }) /* unica em relaçao ao condominio */ identifier: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Resident, (resident) => resident.house)
    residents: Resident[];
}
