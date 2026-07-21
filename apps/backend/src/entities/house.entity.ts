import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {Townhouse} from "./townhouse.entity";

@Entity()
@Unique(['townhouseId', 'identifier'])
export class House {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Townhouse)
    @JoinColumn({name: 'townhouseId'})
    townhouseId: number;

    @Column({nullable: false, type: 'varchar', length: 50 }) /* unica em relaçao ao condominio */
    identifier: string;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}