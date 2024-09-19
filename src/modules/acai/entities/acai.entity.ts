import { IceCreamSize } from "src/modules/ice-cream-size/entities/ice-cream-size.entity";
import { OrderAdditional } from "src/modules/order/entities/order-additional.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Acai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sizeId: string;

  @ManyToOne(() => IceCreamSize)
  @JoinColumn()
  size: IceCreamSize;

  @OneToMany(() => OrderAdditional, orderAdditional => orderAdditional.acai, { cascade: true, eager: true })
  additionals: OrderAdditional[];
}
