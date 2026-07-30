import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { House } from '../../house/entities/house.entity';

@Entity()
export class Townhouse {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 30, unique: true })
    slug: string;

    @OneToMany(() => House, (house) => house.townhouse)
    houses: House[];
}
