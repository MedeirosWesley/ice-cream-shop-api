import { Popsicle } from "src/modules/popsicle/entities/popsicle.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PopsicleOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  popsicleId: string;

  @Column()
  quantity: number;

  @Column()
  withSyrup: boolean;

  @ManyToOne(() => Popsicle, { eager: true })
  @JoinColumn()
  popsicle: Popsicle;

}
