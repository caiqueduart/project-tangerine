import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";
import {Townhouse} from "../townhouse/townhouse.entity";

@Entity()
@Unique(['townhouse', 'identifier'])
export class House {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Townhouse, { nullable: false})
    @JoinColumn({ name: 'townhouseId' })
    townhouse: Townhouse;

    @Column({nullable: false, type: 'varchar', length: 50 }) /* unica em relaçao ao condominio */
    identifier: string;

    @UpdateDateColumn()
    updatedAt: Date;
}