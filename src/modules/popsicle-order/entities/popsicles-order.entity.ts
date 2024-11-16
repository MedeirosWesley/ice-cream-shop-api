import { Popsicle } from "src/modules/popsicle/entities/popsicle.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PopsicleOrder } from "./popsicle-order.entity";

@Entity()
export class PopsiclesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => PopsicleOrder, popsicle => popsicle.popsicles, { cascade: true, eager: true })
  popsicles: PopsicleOrder[];

}
