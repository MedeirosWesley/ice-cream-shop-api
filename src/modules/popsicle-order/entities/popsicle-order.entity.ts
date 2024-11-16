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
  popsicleQuantity: number;

  @Column()
  withSyrup: boolean;

  @ManyToOne(() => PopsiclesOrder, popsiclesOrder => popsiclesOrder.popsicles, { onDelete: 'CASCADE' })
  @JoinColumn()
  popsiclesOrder: PopsiclesOrder; // Alterado para ser mais claro

  @ManyToOne(() => Popsicle, { eager: true })
  @JoinColumn()
  popsicle: Popsicle;
}
