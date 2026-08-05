import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { House } from '../../house/entities/house.entity';
import { TownhouseSituation } from '../enums/townhouse-situation.enum';

@Entity()
export class Townhouse {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 30, unique: true })
    slug: string;

    @Column({ type: 'enum', enum: TownhouseSituation, default: TownhouseSituation.ACTIVE })
    situation: TownhouseSituation;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => House, (house) => house.townhouse)
    houses: House[];
}
