import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderProduct } from './order-product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column()
  paymentMethod: string;

  @Column()
  motorcycleCourierId: string;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order, { cascade: true })
  products: OrderProduct[];
}
