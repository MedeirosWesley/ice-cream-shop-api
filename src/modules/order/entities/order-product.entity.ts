import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Acai } from 'src/modules/acai/entities/acai.entity';

@Entity()
export class OrderProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.products)
  order: Order;

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  observation: string;

  @Column('varchar') // Pode ser usado para armazenar o tipo do produto, ex: "acai", "milk_shake"
  productType: string;

  @ManyToOne(() => Acai, { nullable: true }) // Relacionamento com a entidade Acai
  acai: Acai;

  // @ManyToOne(() => MilkShake, { nullable: true })
  // milkShake: MilkShake;

  // @ManyToOne(() => Popsicle, { nullable: true })
  // popsicle: Popsicle;

  // @ManyToOne(() => Drink, { nullable: true })
  // drink: Drink;

  // @ManyToOne(() => IceCream, { nullable: true })
  // iceCream: IceCream;

  // @ManyToOne(() => IceCreamPot, { nullable: true })
  // iceCreamPot: IceCreamPot;
}
