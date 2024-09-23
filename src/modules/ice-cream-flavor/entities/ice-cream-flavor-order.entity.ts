import { IceCreamOrder } from "src/modules/ice-cream-order/entities/ice-cream-order.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IceCreamFlavor } from "./ice-cream-flavor.entity";

@Entity()
export class IceCreamFlavorOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IceCreamOrder, iceCreamOrder => iceCreamOrder.flavors, { onDelete: 'CASCADE' })
  @JoinColumn()
  iceCreamOrder: IceCreamOrder;

  @ManyToOne(() => IceCreamFlavor, { eager: true })
  @JoinColumn()
  iceCreamFlavor: IceCreamFlavor;
}