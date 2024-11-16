import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Acai } from 'src/modules/acai/entities/acai.entity';
import { MilkShake } from 'src/modules/milk-shake/entities/milk-shake.entity';
import { IceCreamOrder } from 'src/modules/ice-cream-order/entities/ice-cream-order.entity';
import { IceCreamPotOrder } from 'src/modules/ice-cream-pot-order/entities/ice-cream-pot-order.entity';
import { PopsicleOrder } from 'src/modules/popsicle-order/entities/popsicle-order.entity';
import { DrinkOrder } from 'src/modules/drink-order/entities/drink-order.entity';
import { Order } from './order.entity';
import { OnSaleAcaiOrder } from 'src/modules/on-sale-acai-order/entities/on-sale-acai-order.entity';
import { OtherProductOrder } from 'src/modules/other-product-order/entities/other-product-order.entity';
import { PopsiclesOrder } from 'src/modules/popsicle-order/entities/popsicles-order.entity';

@Entity()
export class OrderProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  observation: string;

  @Column()
  productType: string;

  @ManyToOne(() => Order, order => order.products)
  order: Order;

  @ManyToOne(() => Acai, { eager: true, nullable: true })
  acai: Acai;

  @ManyToOne(() => MilkShake, { nullable: true })
  milkShake: MilkShake;

  @ManyToOne(() => PopsiclesOrder, popsicle => popsicle.popsicles, { nullable: true })
  popsicle: PopsiclesOrder;

  @ManyToOne(() => DrinkOrder, { nullable: true })
  drink: DrinkOrder;

  @ManyToOne(() => IceCreamOrder, { nullable: true })
  iceCream: IceCreamOrder;

  @ManyToOne(() => IceCreamPotOrder, { nullable: true })
  iceCreamPot: IceCreamPotOrder;

  @ManyToOne(() => OnSaleAcaiOrder, { nullable: true })
  onSaleAcaiOrder: OnSaleAcaiOrder;

  @ManyToOne(() => OtherProductOrder, { nullable: true })
  otherProductOrder: OtherProductOrder;
}
