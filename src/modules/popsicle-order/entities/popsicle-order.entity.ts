import { Popsicle } from "src/modules/popsicle/entities/popsicle.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PopsiclesOrder } from "./popsicles-order.entity";

@Entity()
export class PopsicleOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  popsicleId: string;

  @Column()
  withSyrup: boolean;

  @ManyToOne(() => PopsiclesOrder, popsicle => popsicle.popsicles, { onDelete: 'CASCADE' })
  @JoinColumn()
  popsicles: PopsiclesOrder;

  @ManyToOne(() => Popsicle, { eager: true })
  @JoinColumn()
  popsicle: Popsicle;

}
