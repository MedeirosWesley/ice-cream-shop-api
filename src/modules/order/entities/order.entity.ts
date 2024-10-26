import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, BeforeInsert, getRepository } from 'typeorm';
import { OrderProduct } from './order-product.entity';
import { MotorcycleCourier } from 'src/modules/motorcycle_courier/entities/motorcycle_courier.entity';
import { Client } from 'src/modules/client/entities/client.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  productIndex: number;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  amountPaid: number;

  @Column({ nullable: true })
  motorcycleCourierId: string;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn()
  client: Client;

  @ManyToOne(() => MotorcycleCourier, { eager: true })
  @JoinColumn()
  motorcycleCourier: MotorcycleCourier;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order, { cascade: true })
  products: OrderProduct[];
}
