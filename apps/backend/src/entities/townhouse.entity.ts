import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {House} from "./house.entity";

@Entity()
export class Townhouse {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @OneToMany(() => House, (house) => house.townhouse)
    houses: House[];
}