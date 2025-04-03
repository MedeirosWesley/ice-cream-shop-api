import { IceCreamFlavorOrder } from "src/modules/ice-cream-flavor/entities/ice-cream-flavor-order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class IceCreamOrder {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal'})
  price: number;

  @OneToMany(() => IceCreamFlavorOrder, iceCreamFlavorOrder => iceCreamFlavorOrder.iceCreamOrder, { cascade: true })
  flavors: IceCreamFlavorOrder[];
}
